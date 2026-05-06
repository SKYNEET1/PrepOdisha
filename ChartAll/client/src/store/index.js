import { create } from 'zustand';

// PrepOdisha stores token as JSON string in localStorage.token
// and user as JSON string in localStorage.user
function getStoredToken() {
  try {
    const raw = localStorage.getItem('token');
    if (!raw || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  chatUser: null,

  // Re-read from localStorage (called on mount)
  hydrate: () => {
    set({ user: getStoredUser(), token: getStoredToken() });
  },

  setChatUser: (chatUser) => set({ chatUser }),

  logout: () => {
    // Clears PrepOdisha's own storage too (optional — redirect instead)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

export const useChatStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  roomMessages: {},
  dmMessages: {},
  view: 'rooms',
  typingUsers: {},
  onlineUsers: new Set(),

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  setChatUser: (chatUser) => set({ chatUser }),
  setView: (view) => set({ view }),

  addRoomMessage: (roomId, message) => set((state) => {
    console.log(`[Store] addRoomMessage called for room: ${roomId}`, message);
    const prev = state.roomMessages[roomId] || [];
    const exists = prev.some((m) => String(m._id) === String(message._id));
    if (exists) {
      console.log(`[Store] Duplicate message ignored: ${message._id}`);
      return state;
    }
    console.log(`[Store] Message added to room ${roomId}. New count: ${prev.length + 1}`);
    return { roomMessages: { ...state.roomMessages, [roomId]: [...prev, message] } };
  }),

  prependRoomMessages: (roomId, messages) => set((state) => {
    const prev = state.roomMessages[roomId] || [];
    const merged = [...messages, ...prev];
    const deduped = merged.filter((m, i, arr) => arr.findIndex((x) => x._id === m._id) === i);
    return { roomMessages: { ...state.roomMessages, [roomId]: deduped } };
  }),

  setRoomMessages: (roomId, messages) =>
    set((state) => {
      const existing = state.roomMessages[roomId] || [];
      // Merge and deduplicate by _id
      const merged = [...messages, ...existing];
      const deduped = merged.filter((m, i, arr) => 
        arr.findIndex((x) => String(x._id) === String(m._id)) === i
      );
      // Sort by createdAt just in case
      deduped.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return { roomMessages: { ...state.roomMessages, [roomId]: deduped } };
    }),

  addDMMessage: (key, message) => set((state) => {
    const prev = state.dmMessages[key] || [];
    if (prev.find((m) => m._id === message._id)) return {};
    return { dmMessages: { ...state.dmMessages, [key]: [...prev, message] } };
  }),

  setDMMessages: (key, messages) =>
    set((state) => ({ dmMessages: { ...state.dmMessages, [key]: messages } })),

  setTyping: (roomId, userId, isTyping) => set((state) => {
    const prev = state.typingUsers[roomId] || [];
    const updated = isTyping
      ? [...new Set([...prev, userId])]
      : prev.filter((u) => u !== userId);
    return { typingUsers: { ...state.typingUsers, [roomId]: updated } };
  }),

  setOnline: (userId) => set((state) => {
    const s = new Set(state.onlineUsers); s.add(userId); return { onlineUsers: s };
  }),
  setOffline: (userId) => set((state) => {
    const s = new Set(state.onlineUsers); s.delete(userId); return { onlineUsers: s };
  }),

  updateRoomMessage: (roomId, messageId, patch) => set((state) => {
    const msgs = (state.roomMessages[roomId] || []).map((m) =>
      m._id === messageId ? { ...m, ...patch } : m
    );
    return { roomMessages: { ...state.roomMessages, [roomId]: msgs } };
  }),

  deleteRoomMessage: (roomId, messageId) => set((state) => {
    const msgs = (state.roomMessages[roomId] || []).map((m) =>
      m._id === messageId ? { ...m, deleted: true, text: '' } : m
    );
    return { roomMessages: { ...state.roomMessages, [roomId]: msgs } };
  }),
}));
