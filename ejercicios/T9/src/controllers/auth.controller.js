import prisma from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { registerSchema, loginSchema } from '../schemas/validation.js';

export async function register(req, res, next) {
  try {
    const { email, name, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: true, message: 'Email ya registrado' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = generateToken(user);
    res.status(201).json({ message: 'Usuario registrado', user, token });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: true, message: 'Datos inválidos', details: error.errors });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login exitoso', user: userWithoutPassword, token });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: true, message: 'Datos inválidos', details: error.errors });
    }
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
