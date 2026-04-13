import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/index.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtAccessExpires }
  );
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

// Almacén de refresh tokens (en producción usar Redis o MongoDB)
const refreshTokens = new Map();

export const storeRefreshToken = (userId, token, expiresAt) => {
  refreshTokens.set(token, { userId, expiresAt });
};

export const getRefreshToken = (token) => {
  const data = refreshTokens.get(token);
  if (data && data.expiresAt > new Date()) {
    return data;
  }
  return null;
};

export const revokeRefreshToken = (token) => {
  refreshTokens.delete(token);
};

export const revokeAllUserTokens = (userId) => {
  for (const [token, data] of refreshTokens.entries()) {
    if (data.userId === userId) {
      refreshTokens.delete(token);
    }
  }
};