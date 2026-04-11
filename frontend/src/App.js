import { useState, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [health, setHealth] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const fetchMessages = async () => {
    const res = await fetch('/api/messages');
    setMessages(await res.json());
  };

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth);
    fetchMessages();
  }, []);

  const addMessage = async () => {
    if (!input.trim()) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input }),
    });
    setInput('');
    fetchMessages();
  };

  const deleteMessage = async (id) => {
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
  };

  const startEdit = (message) => {
    setEditingId(message.id);
    setEditingContent(message.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const saveEdit = async (id) => {
    if (!editingContent.trim()) return;
    await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editingContent }),
    });
    setEditingId(null);
    setEditingContent('');
    fetchMessages();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 40,
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: 600, 
        margin: '0 auto',
        background: 'white',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: '0 0 8px 0' }}>Demo App</h1>
        <p style={{ margin: '0 0 20px 0' }}>
          API: <b>{health?.status}</b> | DB: <b>{health?.db}</b>
        </p>

        <div style={{ display: 'flex', gap: 8, margin: '20px 0' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMessage()}
            placeholder="Nhập tin nhắn..."
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
          />
          <button onClick={addMessage} style={{ padding: '8px 16px', borderRadius: 8, background: '#667eea', color: 'white', border: 'none', cursor: 'pointer' }}>Thêm</button>
        </div>

        {messages.map(m => (
          <div key={m.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 0', 
            borderBottom: '1px solid #eee',
            background: editingId === m.id ? '#f9f9ff' : 'transparent',
            borderRadius: 8,
            paddingLeft: editingId === m.id ? 8 : 0,
            paddingRight: editingId === m.id ? 8 : 0
          }}>
            {editingId === m.id ? (
              <>
                <input
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(m.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  aria-label="Chỉnh sửa tin nhắn"
                  style={{ flex: 1, padding: 6, marginRight: 8, borderRadius: 6, border: '1px solid #667eea' }}
                  autoFocus
                />
                <button onClick={() => saveEdit(m.id)} style={{ marginRight: 4, background: '#28a745', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Lưu</button>
                <button onClick={cancelEdit} style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Huỷ</button>
              </>
            ) : (
              <>
                <span style={{ color: '#333' }}>{m.content}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(m)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#667eea' }}>Sửa</button>
                  <button onClick={() => deleteMessage(m.id)} style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer' }}>Xoá</button>
                </div>
              </>
            )}
          </div>
        ))}

        {messages.length === 0 && <p style={{ color: '#999' }}>Chưa có tin nhắn nào.</p>}
      </div>
    </div>
  );
}
