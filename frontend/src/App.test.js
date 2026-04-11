import { vi } from "vitest"
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

global.fetch = vi.fn();

const mockHealth = { status: 'ok', db: 'connected' };
const mockMessages = [
  { id: 1, content: 'Hello', created_at: '2024-01-01' },
  { id: 2, content: 'World', created_at: '2024-01-02' },
];

beforeEach(() => vi.clearAllMocks());

// ─── Hiển thị ────────────────────────────────────────────────────────────────
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
    await waitFor(() => expect(screen.getByText('connected')).toBeInTheDocument());
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
    await waitFor(() => expect(screen.getByText('Chưa có tin nhắn nào.')).toBeInTheDocument());
  });
});

// ─── Thêm ─────────────────────────────────────────────────────────────────────
describe('App - thêm message', () => {
  it('gọi POST API khi nhấn nút Thêm', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 3, content: 'New msg' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Nhập tin nhắn...'), { target: { value: 'New msg' } });
    fireEvent.click(screen.getByText('Thêm'));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'New msg' }),
      }))
    );
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
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', expect.objectContaining({ method: 'POST' }))
    );
  });

  it('không gọi POST nếu input rỗng', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });
    render(<App />);
    fireEvent.click(screen.getByText('Thêm'));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

// ─── Xoá ─────────────────────────────────────────────────────────────────────
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
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/messages/1', { method: 'DELETE' })
    );
  });
});

// ─── Sửa (Edit) ───────────────────────────────────────────────────────────────
describe('App - sửa message', () => {
  it('hiển thị input chỉnh sửa khi nhấn Sửa', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    expect(screen.getByLabelText('Chỉnh sửa tin nhắn')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('input chỉnh sửa chứa nội dung gốc của message', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) });
    render(<App />);
    await waitFor(() => screen.getByText('World'));
    fireEvent.click(screen.getAllByText('Sửa')[1]);
    expect(screen.getByDisplayValue('World')).toBeInTheDocument();
  });

  it('gọi PUT API với nội dung mới khi nhấn Lưu', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 1, content: 'Hello edited' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([{ id: 1, content: 'Hello edited' }, mockMessages[1]]) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    fireEvent.change(screen.getByLabelText('Chỉnh sửa tin nhắn'), { target: { value: 'Hello edited' } });
    fireEvent.click(screen.getByText('Lưu'));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/messages/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ content: 'Hello edited' }),
      }))
    );
  });

  it('gọi PUT khi nhấn Enter trong ô chỉnh sửa', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 1, content: 'Hello Enter' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    const editInput = screen.getByLabelText('Chỉnh sửa tin nhắn');
    fireEvent.change(editInput, { target: { value: 'Hello Enter' } });
    fireEvent.keyDown(editInput, { key: 'Enter' });
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/messages/1', expect.objectContaining({ method: 'PUT' }))
    );
  });

  it('không gọi PUT nếu nội dung chỉnh sửa rỗng', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    fireEvent.change(screen.getByLabelText('Chỉnh sửa tin nhắn'), { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Lưu'));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('ẩn input và hiện lại nội dung khi nhấn Huỷ', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    expect(screen.getByLabelText('Chỉnh sửa tin nhắn')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Huỷ'));
    expect(screen.queryByLabelText('Chỉnh sửa tin nhắn')).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('ẩn input khi nhấn Escape', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    fireEvent.keyDown(screen.getByLabelText('Chỉnh sửa tin nhắn'), { key: 'Escape' });
    expect(screen.queryByLabelText('Chỉnh sửa tin nhắn')).not.toBeInTheDocument();
  });

  it('hiển thị nội dung mới sau khi lưu thành công', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockMessages) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 1, content: 'Hello edited' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([{ id: 1, content: 'Hello edited' }, mockMessages[1]]) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getAllByText('Sửa')[0]);
    fireEvent.change(screen.getByLabelText('Chỉnh sửa tin nhắn'), { target: { value: 'Hello edited' } });
    fireEvent.click(screen.getByText('Lưu'));
    await waitFor(() => expect(screen.getByText('Hello edited')).toBeInTheDocument());
  });

  it('không hiển thị nút Sửa/Xoá khi đang ở chế độ chỉnh sửa', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHealth) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([mockMessages[0]]) });
    render(<App />);
    await waitFor(() => screen.getByText('Hello'));
    fireEvent.click(screen.getByText('Sửa'));
    expect(screen.queryByText('Xoá')).not.toBeInTheDocument();
    expect(screen.queryByText('Sửa')).not.toBeInTheDocument();
  });
});
