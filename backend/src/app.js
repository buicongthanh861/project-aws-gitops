const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let pool;
app.setPool = (p) => { pool = p; };

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

app.put('/api/messages/:id', async (req, res) => {
  const { content } = req.body;
  const result = await pool.query(
    'UPDATE messages SET content = $1 WHERE id = $2 RETURNING *',
    [content, req.params.id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/messages/:id', async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = app;
