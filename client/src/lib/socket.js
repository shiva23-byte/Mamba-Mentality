import { io } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const SOCKET_URL = rawApiUrl 
  ? (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://') ? rawApiUrl : `https://${rawApiUrl}`)
  : 'http://localhost:5000';
const isVercel = SOCKET_URL.includes('vercel.app');

export const socket = io(SOCKET_URL, {
  autoConnect: !isVercel,
  reconnection: !isVercel,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on('connect', () => {
  console.log('[Socket.IO] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket.IO] Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('[Socket.IO] Connection error:', error.message);
});

export default socket;
