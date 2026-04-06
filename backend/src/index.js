const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'demo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
});

pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.json({ status: 'ok', db: 'disconnected' });
  }
});

app.get('/api/messages', async (req, res) => {
  const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/messages', async (req, res) => {
  const { content } = req.body;
  const result = await pool.query(
    'INSERT INTO messages (content) VALUES ($1) RETURNING *',
    [content]
  );
  res.json(result.rows[0]);
});

app.delete('/api/messages/:id', async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
