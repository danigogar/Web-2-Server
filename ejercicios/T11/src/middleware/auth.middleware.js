import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: true, message: 'Token inválido' });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return res.status(401).json({ error: true, message: 'Usuario no encontrado' });
  }

  req.user = user;
  next();
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: true, message: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: 'No tienes permisos' });
    }
    next();
  };
}
