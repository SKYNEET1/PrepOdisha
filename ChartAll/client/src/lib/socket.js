import { io } from 'socket.io-client';

const CHAT_URL = import.meta.env.VITE_CHAT_URL || 'http://localhost:5001';

let groupSocket = null;
let dmSocket = null;
let presenceSocket = null;

export function getGroupSocket(token) {
  if (!groupSocket) {
    groupSocket = io(`${CHAT_URL}/group`, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
    });
  }
  return groupSocket;
}

export function getDMSocket(token) {
  if (!dmSocket) {
    dmSocket = io(`${CHAT_URL}/dm`, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
    });
  }
  return dmSocket;
}

export function getPresenceSocket(token) {
  if (!presenceSocket) {
    presenceSocket = io(`${CHAT_URL}/presence`, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
    });
  }
  return presenceSocket;
}

export function disconnectAll() {
  groupSocket?.disconnect();
  dmSocket?.disconnect();
  presenceSocket?.disconnect();
  groupSocket = null;
  dmSocket = null;
  presenceSocket = null;
}
