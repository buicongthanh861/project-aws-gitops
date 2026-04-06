import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch
global.fetch = jest.fn();

const mockHealth = { status: 'ok', db: 'connected' };
const mockMessages = [
  { id: 1, content: 'Hello', created_at: '2024-01-01' },
  { id: 2, content: 'World', created_at: '2024-01-02' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

// Helper: mock fetch trả về data
const mockFetch = (data) =>
  Promise.resolve({ json: () => Promise.resolve(data) });

describe('App - hiển thị', () => {
  it('hiển thị tiêu đề Demo App', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<App />);

    expect(screen.getByText('Demo App')).toBeInTheDocument();
  });

  it('hiển thị trạng thái DB từ API health', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('connected')).toBeInTheDocument();
    });
  });

  it('hiển thị danh sách messages từ API', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
    });
  });

  it('hiển thị thông báo khi không có messages', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Chưa có tin nhắn nào.')).toBeInTheDocument();
    });
  });
});

describe('App - thêm message', () => {
  it('gọi POST API khi nhấn nút Thêm', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 3, content: 'New msg' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([{ id: 3, content: 'New msg' }]) });

    render(<App />);

    const input = screen.getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.change(input, { target: { value: 'New msg' } });
    fireEvent.click(screen.getByText('Thêm'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'New msg' }),
      }));
    });
  });

  it('gọi POST khi nhấn Enter', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 3, content: 'Enter msg' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<App />);

    const input = screen.getByPlaceholderText('Nhập tin nhắn...');
    fireEvent.change(input, { target: { value: 'Enter msg' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  it('không gọi POST nếu input rỗng', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<App />);

    fireEvent.click(screen.getByText('Thêm'));

    // Chỉ có 2 lần fetch ban đầu, không thêm lần nào
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('App - xoá message', () => {
  it('gọi DELETE API khi nhấn Xoá', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

    render(<App />);

    await waitFor(() => screen.getByText('Hello'));

    fireEvent.click(screen.getAllByText('Xoá')[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages/1', { method: 'DELETE' });
    });
  });
});
