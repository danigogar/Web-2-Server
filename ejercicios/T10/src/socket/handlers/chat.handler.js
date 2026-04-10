import Message from '../../models/message.model.js';

const typingTimeouts = new Map();
const onlineUsers = new Map();

const EMOJIS = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢'
};

export function chatHandler(io, socket, user) {
  // Registrar usuario online
  onlineUsers.set(user.id, socket.id);
  io.emit('user:online', { userId: user.id, name: user.name });

  socket.on('chat:message', async ({ roomId, content, image, isPrivate, toUserId }) => {
    try {
      if ((!content || content.trim().length === 0) && !image) return;

      const messageData = {
        roomId,
        userId: user.id,
        userName: user.name,
        content: content?.trim() || '',
        image: image || null,
        isPrivate: isPrivate || false,
        toUserId: toUserId || null
      };

      const message = await Message.create(messageData);

      const messageResponse = {
        id: message._id,
        content: message.content,
        image: message.image,
        user: { id: user.id, name: user.name },
        timestamp: message.createdAt,
        isPrivate: message.isPrivate,
        edited: false,
        deleted: false
      };

      if (isPrivate && toUserId) {
        const targetSocketId = onlineUsers.get(toUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit('chat:private', messageResponse);
          socket.emit('chat:private:sent', messageResponse);
        } else {
          socket.emit('chat:error', { message: 'Usuario no conectado' });
        }
      } else {
        io.to(roomId).emit('chat:message', messageResponse);
      }
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  socket.on('chat:typing', ({ roomId }) => {
    socket.to(roomId).emit('chat:typing', {
      user: { id: user.id, name: user.name }
    });

    if (typingTimeouts.has(socket.id)) {
      clearTimeout(typingTimeouts.get(socket.id));
    }

    const timeout = setTimeout(() => {
      socket.to(roomId).emit('chat:stop-typing', {
        user: { id: user.id, name: user.name }
      });
      typingTimeouts.delete(socket.id);
    }, 1500);

    typingTimeouts.set(socket.id, timeout);
  });

  socket.on('chat:reaction', async ({ messageId, reactionType }) => {
    try {
      const emoji = EMOJIS[reactionType];
      if (!emoji) return;

      await Message.findByIdAndUpdate(messageId, { reaction: emoji });
      
      io.emit('chat:reaction-updated', {
        messageId,
        reaction: emoji,
        user: { id: user.id, name: user.name }
      });
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  socket.on('chat:edit', async ({ messageId, newContent }) => {
    try {
      const message = await Message.findById(messageId);
      
      if (message.userId.toString() !== user.id) {
        return socket.emit('chat:error', { message: 'No puedes editar mensajes de otros usuarios' });
      }

      message.content = newContent;
      message.edited = true;
      message.updatedAt = new Date();
      await message.save();

      io.emit('chat:message-edited', {
        messageId,
        newContent,
        editedAt: message.updatedAt
      });
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  socket.on('chat:delete', async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      
      if (message.userId.toString() !== user.id) {
        return socket.emit('chat:error', { message: 'No puedes eliminar mensajes de otros usuarios' });
      }

      message.deleted = true;
      message.content = '[Mensaje eliminado]';
      await message.save();

      io.emit('chat:message-deleted', { messageId });
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(user.id);
    io.emit('user:offline', { userId: user.id, name: user.name });
    
    if (typingTimeouts.has(socket.id)) {
      clearTimeout(typingTimeouts.get(socket.id));
      typingTimeouts.delete(socket.id);
    }
  });
}

export { onlineUsers, EMOJIS };
