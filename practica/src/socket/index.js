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
    io.emit('user:online', { userId: user.id, name: user.name });

    if (user.company) {
      const companyRoom = `company:${user.company._id || user.company}`;
      socket.join(companyRoom);
      console.log(`📡 Usuario ${user.name} unido a sala ${companyRoom}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${user.name} (${user.id})`);
      onlineUsers.delete(user.id);
      io.emit('user:offline', { userId: user.id, name: user.name });
    });
  });

  return io;
};