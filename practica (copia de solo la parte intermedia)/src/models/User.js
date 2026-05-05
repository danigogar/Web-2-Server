import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  postal: { type: String, trim: true },
  city: { type: String, trim: true },
  province: { type: String, trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  nif: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'guest'],
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending'
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationAttempts: {
    type: Number,
    default: 3,
    select: false
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  address: addressSchema,
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true }
});

// Virtual fullName
userSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.lastName}`.trim();
});

// Índices (solo una vez)
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ company: 1, status: 1 });
userSchema.index({ role: 1, deleted: 1 });

const User = mongoose.model('User', userSchema);
export default User;