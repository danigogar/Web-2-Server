import { Router } from 'express';
import User from '../models/user.model.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: true, message: 'El email ya está registrado' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

router.get('/users', authenticate, async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('_id name email');
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

export default router;
