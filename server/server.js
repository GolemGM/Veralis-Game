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

// ---------------- Character Creation API ----------------

// Status hráče
app.get("/api/character/status", async (req, res) => {
  try {
    const result = await pool.query("SELECT name, stage, book_visited FROM characters LIMIT 1");
    if (result.rows.length === 0) {
      return res.json({ cc_stage: 0 });
    }
    const row = result.rows[0];
    return res.json({
      cc_stage: row.stage,
      book_visited: row.book_visited,
      name: row.name
    });
  } catch (err) {
    console.error("status error", err);
    res.json({ cc_stage: 0 });
  }
});

// Vytvoření postavy
app.post("/api/character/create", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.json({ error: "invalid" });

  try {
    // unikátní jméno
    const exists = await pool.query("SELECT id FROM characters WHERE LOWER(name) = LOWER($1)", [name]);
    if (exists.rows.length > 0) {
      return res.json({ error: "exists" });
    }

    await pool.query(
      "INSERT INTO characters (name, stage, book_visited) VALUES ($1, 1, false)",
      [name]
    );
    return res.json({ status: "ok" });
  } catch (err) {
    console.error("create error", err);
    res.json({ error: "db" });
  }
});

// Označení že hráč otevřel knihu
app.post("/api/character/book-visited", async (req, res) => {
  try {
    await pool.query("UPDATE characters SET book_visited = true WHERE stage = 1");
    res.json({ ok: true });
  } catch (err) {
    console.error("book error", err);
    res.json({ error: "db" });
  }
});

// Dokončení CC
app.post("/api/character/cc-complete", async (req, res) => {
  try {
    await pool.query("UPDATE characters SET stage = 2 WHERE stage = 1");
    res.json({ redirect: "/game.html" });
  } catch (err) {
    console.error("cc-complete error", err);
    res.json({ error: "db" });
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


