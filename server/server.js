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

