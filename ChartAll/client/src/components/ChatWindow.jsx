import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import toast from 'react-hot-toast';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function MessageBubble({ msg, isMine }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: 'flex', width: '100%', marginBottom: 4, paddingLeft: 16, paddingRight: 16,
        justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8
      }}
    >
      {/* Avatar for other user */}
      {!isMine && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
          flexShrink: 0, background: '#5288c1', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: 2
        }}>
          {msg.senderImage ? (
            <img src={msg.senderImage} alt={msg.senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{getInitials(msg.senderName)}</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '65%', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
        {/* Sender name */}
        {!isMine && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7dafda', marginBottom: 2, marginLeft: 4 }}>
            {msg.senderName}
          </span>
        )}

        {/* Bubble */}
        <div style={{
          padding: '8px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isMine ? '#005c4b' : '#283940',
          color: '#e9edef', fontSize: 14.5, lineHeight: 1.45, wordBreak: 'break-word',
          minWidth: 60, position: 'relative'
        }}>
          <p style={{ margin: 0 }}>{msg.text}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#8696a0', textAlign: 'right', marginTop: 4 }}>
            {formatTime(msg.createdAt)}
            {isMine && ' ✓'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatWindow({ connected, socketRef }) {
  const { currentUser, messages } = useStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !connected || sending) return;

    setSending(true);
    setText('');

    const socket = socketRef.current;
    socket.emit('sendMessage', { userId: currentUser._id, text: trimmed }, (ack) => {
      setSending(false);
      if (ack?.error) {
        toast.error('Failed to send message');
        setText(trimmed); // restore
      }
    });
  }, [text, connected, sending, currentUser, socketRef]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0e1621', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px', background: '#202c33', borderBottom: '1px solid #0f1923',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg,#5288c1,#2c5282)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 18 }}>💬</span>
        </div>
        <div>
          <p style={{ fontWeight: 600, color: '#e9edef', fontSize: 15 }}>Global Chat</p>
          <p style={{ fontSize: 12, color: connected ? '#4ade80' : '#ef4444' }}>
            {connected ? '● Connected' : '○ Connecting...'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12, paddingBottom: 8 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <span style={{ fontSize: 48 }}>💬</span>
            <p style={{ color: '#5a6d80', fontSize: 14 }}>No messages yet. Say hello!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                isMine={msg.senderId === currentUser?._id}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 16px', background: '#202c33', borderTop: '1px solid #0f1923',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0
      }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? 'Type a message…' : 'Connecting…'}
          disabled={!connected || sending}
          style={{
            flex: 1, background: '#2a3942', border: 'none', borderRadius: 24,
            padding: '10px 18px', color: '#e9edef', fontSize: 14, outline: 'none',
            opacity: !connected || sending ? 0.6 : 1
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || !connected || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: text.trim() && connected ? 'linear-gradient(135deg,#5288c1,#2c5282)' : 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'background 0.2s'
          }}
        >
          {sending
            ? <Loader2 style={{ width: 18, height: 18, color: '#fff', animation: 'spin 1s linear infinite' }} />
            : <Send style={{ width: 18, height: 18, color: text.trim() && connected ? '#fff' : '#5a6d80' }} />
          }
        </button>
      </div>
    </div>
  );
}
