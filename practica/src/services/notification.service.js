import { EventEmitter } from 'node:events';

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
  }

  setupListeners() {
    this.on('user:registered', (data) => {
      console.log(`📧 [EVENT] user:registered - ${data.email} (${data.userId})`);
    });

    this.on('user:verified', (data) => {
      console.log(`✅ [EVENT] user:verified - ${data.email} (${data.userId})`);
    });

    this.on('user:invited', (data) => {
      console.log(`👥 [EVENT] user:invited - ${data.email} invitado por ${data.invitedBy}`);
    });

    this.on('user:deleted', (data) => {
      console.log(`🗑️ [EVENT] user:deleted - ${data.email} (soft: ${data.soft})`);
    });
  }

  emitUserRegistered(user) {
    this.emit('user:registered', {
      userId: user._id,
      email: user.email,
      timestamp: new Date()
    });
  }

  emitUserVerified(user) {
    this.emit('user:verified', {
      userId: user._id,
      email: user.email,
      timestamp: new Date()
    });
  }

  emitUserInvited(invitedUser, invitedByEmail) {
    this.emit('user:invited', {
      userId: invitedUser._id,
      email: invitedUser.email,
      invitedBy: invitedByEmail,
      timestamp: new Date()
    });
  }

  emitUserDeleted(user, soft = true) {
    this.emit('user:deleted', {
      userId: user._id,
      email: user.email,
      soft,
      timestamp: new Date()
    });
  }
}

export const notificationService = new NotificationService();
