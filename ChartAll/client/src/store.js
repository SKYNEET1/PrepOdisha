import { create } from 'zustand';

// Hardcoded users list
export const HARDCODED_USERS = [
  {
    _id: '69f0bf1ac66efe1b772a8018',
    firstName: 'swagat',
    lastName: 'rout',
    email: 'snrout18@gmail.com',
    image: 'https://res.cloudinary.com/dhpvcjgsm/image/upload/v1777796196/sze7phgapgcvw0jcwmfy.png',
    accountType: 'Student',
  },
  {
    _id: '69f82a4adb22eb4147135bc0',
    firstName: 'Ram',
    lastName: 'Rout',
    email: 'swagatrout18@gmail.com',
    image: 'https://api.dicebear.com/5.x/initials/svg?seed=Ram Rout',
    accountType: 'Instructor',
  },
];

export const useStore = create((set) => ({
  // Auth
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null, messages: [] }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    if (state.messages.some((m) => m._id === message._id)) return {};
    return { messages: [...state.messages, message] };
  }),

  // Online users
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  // View
  view: 'chat', // 'chat' | 'members'
  setView: (view) => set({ view }),
}));
