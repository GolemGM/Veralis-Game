// server/server.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '200kb' }));

// Statické soubory servírujeme z ROOTU repa (o úroveň výš než /server)
const ROOT = path.resolve(__dirname, '..');

app.use(express.static(ROOT, {
  index: false,
  etag: true,
  maxAge: '1h',
}));

// Přímé routy na hlavní stránky
app.get(['/game', '/game.html'], (req, res) => {
  res.sendFile(path.join(ROOT, 'game.html'));
});

app.get(['/starbridge', '/StarBridge', '/StarBridge.html'], (req, res) => {
  res.sendFile(path.join(ROOT, 'StarBridge.html'));
});

// Pokud nemáš index.html, pošli uživatele na /game
app.get('/', (req, res) => res.redirect('/game'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// ------------------ Character Creation API (final) ------------------

// CREATE – vytvořit postavu (case-insensitive unikátnost)
app.post("/api/character/create", async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.json({ error: "invalid" });

  try {
    // kolize jména (LOWER)
    const exists = await pool.query(
      "SELECT 1 FROM characters WHERE LOWER(name) = LOWER($1) LIMIT 1",
      [name.trim()]
    );
    if (exists.rows.length) return res.json({ error: "exists" });

    await pool.query(
      "INSERT INTO characters (name, stage, book_visited) VALUES ($1, 1, false)",
      [name.trim()]
    );
    return res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.json({ error: "db" });
  }
});

// STATUS – poslední záznam (dokud neřešíme player_id)
app.get("/api/character/status", async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT name, stage, book_visited FROM characters ORDER BY id DESC LIMIT 1"
    );
    if (!r.rows.length) return res.json({ cc_stage: 0 });
    const row = r.rows[0];
    return res.json({
      cc_stage: row.stage,
      book_visited: row.book_visited,
      name: row.name
    });
  } catch (err) {
    console.error(err);
    return res.json({ cc_stage: 0 });
  }
});

// BOOK – označit, že hráč knihu zavřel
app.post("/api/character/book-visited", async (_req, res) => {
  try {
    await pool.query(
      "UPDATE characters SET book_visited = true WHERE id=(SELECT id FROM characters ORDER BY id DESC LIMIT 1)"
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.json({ ok: false });
  }
});

// COMPLETE – ukončit CC a poslat do hry
app.post("/api/character/cc-complete", async (_req, res) => {
  try {
    await pool.query(
      "UPDATE characters SET stage = 2 WHERE id=(SELECT id FROM characters ORDER BY id DESC LIMIT 1)"
    );
    return res.json({ redirect: "/game.html" });
  } catch (err) {
    console.error(err);
    return res.json({ redirect: "/game.html" });
  }
});

// Rozhodnutí při vstupu do hry (ze StarBridge)
app.get(['/enter', '/enter-game'], async (_req, res) => {
  try {
    const r = await pool.query("SELECT stage FROM characters ORDER BY id DESC LIMIT 1");
    const stage = r.rows[0]?.stage ?? 0;
    if (stage < 2) return res.redirect('/charactercreation.html');
    return res.redirect('/game.html');
  } catch (err) {
    console.error(err);
    return res.redirect('/charactercreation.html');
  }
});

// Guard pro přímý přístup na CC – hotový hráč už CC neuvidí
app.get('/charactercreation.html', async (req, res, next) => {
  try {
    const r = await pool.query("SELECT stage FROM characters ORDER BY id DESC LIMIT 1");
    const stage = r.rows[0]?.stage ?? 0;
    if (stage >= 2) return res.redirect('/game.html');
    return res.sendFile(path.join(ROOT, 'charactercreation.html'));
  } catch (err) {
    console.error(err);
    return res.sendFile(path.join(ROOT, 'charactercreation.html'));
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Dev server běží na http://localhost:${PORT}`);
  console.log(`→ /game        (game.html)`);
  console.log(`→ /StarBridge  (StarBridge.html)`);

pool.connect()
  .then(client => {
    console.log("✅ DB connected");
    client.release();
  })
  .catch(err => console.error("❌ DB connection error:", err));  
});




