import { EventEmitter } from 'node:events';

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
    this.io = null;
  }

  setIo(io) {
    this.io = io;
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

    this.on('client:new', (data) => {
      console.log(`🏢 [EVENT] client:new - ${data.name} (${data._id})`);
    });

    this.on('project:new', (data) => {
      console.log(`📋 [EVENT] project:new - ${data.name} (${data._id})`);
    });

    this.on('deliverynote:new', (data) => {
      console.log(`📄 [EVENT] deliverynote:new - ${data._id} (formato: ${data.format})`);
    });

    this.on('deliverynote:signed', (data) => {
      console.log(`✍️ [EVENT] deliverynote:signed - ${data._id}`);
    });
  }

  emitToCompany(companyId, event, data) {
    const companyRoom = `company:${companyId}`;
    this.emit(event, data);
    if (this.io) {
      this.io.to(companyRoom).emit(event, data);
    }
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

  emitClientCreated(client, companyId) {
    this.emitToCompany(companyId, 'client:new', client);
  }

  emitProjectCreated(project, companyId) {
    this.emitToCompany(companyId, 'project:new', project);
  }

  emitDeliveryNoteCreated(deliveryNote, companyId) {
    this.emitToCompany(companyId, 'deliverynote:new', deliveryNote);
  }

  emitDeliveryNoteSigned(deliveryNote, companyId) {
    this.emitToCompany(companyId, 'deliverynote:signed', deliveryNote);
  }
}

export const notificationService = new NotificationService();