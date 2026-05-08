import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';

const onlineUsers = new Map();

export const setupSocket = (httpServer) => {
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

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return next(new Error('Token inválido o expirado'));
    }

    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Usuario conectado: ${user.name} (${user.id})`);

    onlineUsers.set(user.id, socket.id);

    // Determinamos la sala de la compañía antes de emitir, para que los
    // eventos de presencia (user:online / user:offline) viajen SOLO a los
    // miembros de la misma compañía y no a todos los sockets globales.
    // Antes se usaba io.emit, lo que filtraba nombres y userIds entre
    // compañías distintas conectadas al mismo servidor.
    const companyRoom = user.company
      ? `company:${user.company._id || user.company}`
      : null;

    if (companyRoom) {
      socket.join(companyRoom);
      console.log(`📡 Usuario ${user.name} unido a sala ${companyRoom}`);
      io.to(companyRoom).emit('user:online', { userId: user.id, name: user.name });
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${user.name} (${user.id})`);
      onlineUsers.delete(user.id);
      if (companyRoom) {
        io.to(companyRoom).emit('user:offline', { userId: user.id, name: user.name });
      }
    });
  });

  return io;
};