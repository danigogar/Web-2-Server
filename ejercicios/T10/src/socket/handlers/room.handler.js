import Room from '../../models/room.model.js';

const roomUsers = new Map();

export function roomHandler(io, socket, user) {
  socket.on('room:join', async ({ roomId }) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        return socket.emit('room:error', { message: 'Sala no encontrada' });
      }

      const previousRooms = Array.from(socket.rooms);
      previousRooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      socket.join(roomId);

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(user.id);

      const usersInRoom = Array.from(roomUsers.get(roomId)).length;

      socket.emit('room:joined', {
        room: { id: room._id, name: room.name },
        users: usersInRoom
      });

      socket.to(roomId).emit('room:user-joined', {
        user: { id: user.id, name: user.name }
      });
    } catch (error) {
      socket.emit('room:error', { message: error.message });
    }
  });

  socket.on('room:leave', async ({ roomId }) => {
    socket.leave(roomId);

    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(user.id);
      if (roomUsers.get(roomId).size === 0) {
        roomUsers.delete(roomId);
      }
    }

    socket.to(roomId).emit('room:user-left', {
      user: { id: user.id, name: user.name }
    });
  });
}
