const request = require('supertest');
const app = require('../src/app');

// Mock pool - không cần DB thật khi test
const mockPool = {
  query: jest.fn(),
};

app.setPool(mockPool);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/health', () => {
  it('trả về connected khi DB OK', async () => {
    mockPool.query.mockResolvedValueOnce({});

    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });

  it('trả về disconnected khi DB lỗi', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'disconnected' });
  });
});

describe('GET /api/messages', () => {
  it('trả về danh sách messages', async () => {
    const rows = [
      { id: 1, content: 'Hello', created_at: '2024-01-01' },
      { id: 2, content: 'World', created_at: '2024-01-02' },
    ];
    mockPool.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/api/messages');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(rows);
  });

  it('trả về mảng rỗng khi không có messages', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/messages');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/messages', () => {
  it('tạo message mới và trả về message đó', async () => {
    const newMessage = { id: 1, content: 'Test message', created_at: '2024-01-01' };
    mockPool.query.mockResolvedValueOnce({ rows: [newMessage] });

    const res = await request(app)
      .post('/api/messages')
      .send({ content: 'Test message' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(newMessage);
    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO messages (content) VALUES ($1) RETURNING *',
      ['Test message']
    );
  });
});

describe('DELETE /api/messages/:id', () => {
  it('xoá message theo id', async () => {
    mockPool.query.mockResolvedValueOnce({});

    const res = await request(app).delete('/api/messages/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockPool.query).toHaveBeenCalledWith(
      'DELETE FROM messages WHERE id = $1',
      ['1']
    );
  });
});
