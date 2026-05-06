const BASE = import.meta.env.VITE_CHAT_URL || 'http://localhost:5001';

async function apiFetch(path, options = {}, token) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  
  const data = await res.json();
  
  if (res.status === 401 && (data.message?.includes('expired') || data.message?.includes('log in again'))) {
    console.warn("Session expired. Redirecting to login...");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const PREPODISHA_URL = import.meta.env.VITE_PREPODISHA_URL || 'http://localhost:3000';
    window.location.href = `${PREPODISHA_URL}/login`;
    return;
  }

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // User
  syncUser: (userData, token) =>
    apiFetch(`/api/v1/chat/sync-user`, {
      method: 'POST',
      body: JSON.stringify(userData),
    }, token),

  // Rooms
  getOrCreateRoom: (courseId, token) =>
    apiFetch(`/api/v1/chat/rooms/${courseId}`, {}, token),

  getRoomMembers: (courseId, token) =>
    apiFetch(`/api/v1/chat/rooms/${courseId}/members`, {}, token),

  // Messages
  getRoomMessages: (roomId, page = 1, token) =>
    apiFetch(`/api/v1/chat/messages/room/${roomId}?page=${page}&limit=30`, {}, token),

  getDMHistory: (otherUserId, page = 1, token) =>
    apiFetch(`/api/v1/chat/messages/dm/${otherUserId}?page=${page}&limit=30`, {}, token),

  editMessage: (messageId, text, token) =>
    apiFetch(`/api/v1/chat/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    }, token),

  deleteMessage: (messageId, token) =>
    apiFetch(`/api/v1/chat/messages/${messageId}`, { method: 'DELETE' }, token),
};
