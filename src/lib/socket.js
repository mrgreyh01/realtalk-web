import { io } from 'socket.io-client';
import { API_ORIGIN } from './http.js';

export const SOCKET_EVENTS = {
  presenceSnapshot: 'presence:snapshot',
  presenceChanged: 'presence:changed',
  messageNew: 'message:new',
  messageDelivered: 'message:delivered',
  messageRead: 'message:read',
  typingChanged: 'typing:changed',
};

/**
 * The handshake reuses the session cookie, which is why withCredentials matters
 * here. A socket that arrives without a valid session is rejected by the server
 * before any event is exchanged.
 */
export function createSocket() {
  return io(API_ORIGIN, {
    withCredentials: true,
    autoConnect: false,
    reconnectionAttempts: 8,
    reconnectionDelay: 800,
  });
}
