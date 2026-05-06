import React, { useEffect, useRef, useState } from 'react';
import { useStore, HARDCODED_USERS } from '../store';
import { getSocket, disconnectSocket } from '../socket';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import toast from 'react-hot-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5002';

export default function Chat() {
  const { currentUser, setMessages, addMessage, setOnlineUsers } = useStore();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Load history + connect socket
  useEffect(() => {
    if (!currentUser) return;

    // Fetch message history
    fetch(`${SERVER_URL}/api/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => toast.error('Failed to load chat history'));

    // Connect socket
    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
      socket.emit('join', {
        userId: currentUser._id,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        image: currentUser.image,
        accountType: currentUser.accountType,
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket] Disconnected');
    });

    socket.on('message', (msg) => {
      console.log('[Socket] Received message:', msg);
      addMessage(msg);
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      toast.error('Connection failed. Retrying...');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
      socket.off('onlineUsers');
      socket.off('connect_error');
      disconnectSocket();
      setConnected(false);
    };
  }, [currentUser]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#17212b' }}>
      <Sidebar connected={connected} socketRef={socketRef} />
      <ChatWindow connected={connected} socketRef={socketRef} />
    </div>
  );
}
