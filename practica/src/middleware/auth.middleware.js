import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw AppError.unauthorized('Token inválido o expirado');
    }

    const user = await User.findById(decoded.id)
      .select('+password')
      .populate('company');

    if (!user || user.deleted) {
      throw AppError.unauthorized('Usuario no encontrado');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('No tienes permisos para realizar esta acción'));
    }

    next();
  };
};

export const requireVerified = async (req, res, next) => {
  if (req.user.status !== 'verified') {
    return next(AppError.forbidden('Debes verificar tu email primero'));
  }
  next();
};

export const requireCompany = async (req, res, next) => {
  if (!req.user.company) {
    return next(AppError.badRequest('Usuario sin compañía asociada'));
  }
  next();
};
