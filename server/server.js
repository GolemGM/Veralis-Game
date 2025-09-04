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

app.get([
  '/character-creation',
  '/charactercreation',
  '/cc'
], (req, res) => {
  res.sendFile(path.join(ROOT, 'charactercreation.html'));
});

// Pokud nemáš index.html, pošli uživatele na /game
app.get('/', (req, res) => res.redirect('/game'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// --------------------------
// CC – pomocné (získej userId z vaší identity; dočasně volitelné)
// --------------------------
function getUserId(req) {
  // 1) pokud máte vlastní auth middleware, vraťte req.user.id
  if (req.user && req.user.id) return req.user.id;

  // 2) fallback – volitelné: z hlavičky při testování
  const fromHeader = req.get('x-user-id');
  if (fromHeader) return parseInt(fromHeader, 10);

  // 3) žádné přihlášení -> NULL (povoleno v tabulce, máme unique (user_id) jen WHEN NOT NULL)
  return null;
}

// --------------------------
// CC – API
// --------------------------

// Stav pro obnovu (F5)
app.get('/api/character/status', async (req, res) => {
  const userId = getUserId(req);

  try {
    let row = null;

    if (userId !== null) {
      const q = await pool.query(
        `SELECT id, user_id, name, cc_stage, book_visited
           FROM cc_characters
          WHERE user_id = $1
          ORDER BY id DESC
          LIMIT 1`, [userId]
      );
      row = q.rows[0] || null;
    } else {
      // anonymní – nic nevracej (FE si poradí localStoragem)
    }

    if (!row) return res.json({ cc_stage: 0 });

    return res.json({
      cc_stage: row.cc_stage,         // 0 / 1 / 2
      book_visited: !!row.book_visited,
      name: row.name
    });
  } catch (e) {
    console.error('status error:', e);
    return res.status(500).json({ cc_stage: 0 });
  }
});

// Rezervace jména
app.post('/api/character/create', async (req, res) => {
  const userId = getUserId(req);
  const nameRaw = (req.body?.name || '').trim();

  // jednoduchá validace (písmena, mezery, max 30)
  if (!/^[A-Za-zÀ-ž ]{1,30}$/.test(nameRaw)) {
    return res.json({ error: 'invalid' });
  }

  try {
    // Když máte přihlášeného uživatele, udržujeme 1 záznam na user_id,
    // současně ctíme UNIQUE(name) (citext → case-insensitive).
    const q = await pool.query(
      `INSERT INTO cc_characters (user_id, name, cc_stage, book_visited)
         VALUES ($1, $2, 1, FALSE)
       ON CONFLICT (user_id) WHERE user_id IS NOT NULL
         DO UPDATE SET name = EXCLUDED.name, cc_stage = 1, book_visited = FALSE
       RETURNING id, name`,
      [userId, nameRaw]
    );

    return res.json({ status: 'ok', id: q.rows[0].id, name: q.rows[0].name });
  } catch (e) {
    // 23505 = unique_violation (pravděpodobně kolize na UNIQUE(name))
    if (e.code === '23505') {
      return res.json({ error: 'exists' });
    }
    console.error('create error:', e);
    return res.status(500).json({ error: 'server' });
  }
});

// Zápis „zápisník navštíven“
app.post('/api/character/book-visited', async (req, res) => {
  const userId = getUserId(req);
  try {
    if (userId !== null) {
      await pool.query(
        `UPDATE cc_characters
            SET book_visited = TRUE
          WHERE user_id = $1`, [userId]
      );
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('book-visited error:', e);
    return res.status(500).json({ ok: false });
  }
});

// Dokončení CC → redirect do hry
app.post('/api/character/cc-complete', async (req, res) => {
  const userId = getUserId(req);
  try {
    if (userId !== null) {
      await pool.query(
        `UPDATE cc_characters
            SET cc_stage = 2
          WHERE user_id = $1`, [userId]
      );
    }
    return res.json({ redirect: '/game' });
  } catch (e) {
    console.error('cc-complete error:', e);
    return res.status(500).json({ redirect: '/game' });
  }
});

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





