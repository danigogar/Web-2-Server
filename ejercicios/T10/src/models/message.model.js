import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  reaction: {
    type: String,
    default: null
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  edited: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ content: 'text' });

export default mongoose.model('Message', messageSchema);
