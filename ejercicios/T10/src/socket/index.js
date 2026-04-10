import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { roomHandler } from './handlers/room.handler.js';
import { chatHandler, onlineUsers } from './handlers/chat.handler.js';

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new Error('Token inválido o expirado'));
    }

    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Usuario conectado: ${user.name} (${user.id})`);

    roomHandler(io, socket, user);
    chatHandler(io, socket, user);
  });

  return io;
}
