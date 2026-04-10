import { useState, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [health, setHealth] = useState(null);

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

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>Demo App Fullstack - BCT devops</h1>

      <p>API: <b>{health?.status}</b> | DB: <b>{health?.db}</b></p>

      <div style={{ display: 'flex', gap: 8, margin: '20px 0' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMessage()}
          placeholder="Nhập tin nhắn..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addMessage} style={{ padding: '8px 16px' }}>Thêm</button>
      </div>

      {messages.map(m => (
        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
          <span>{m.content}</span>
          <button onClick={() => deleteMessage(m.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Xoá</button>
        </div>
      ))}

      {messages.length === 0 && <p style={{ color: '#999' }}>Chưa có tin nhắn nào.</p>}
    </div>
  );
}
