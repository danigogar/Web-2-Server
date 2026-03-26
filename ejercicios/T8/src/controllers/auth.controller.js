import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

// ─── Helper: generar token ────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  )
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({
        error: true,
        message: 'El email ya está registrado',
      })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    const token = generateToken(user._id)

    // No devolver la contraseña
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      token,
      user: userResponse,
    })
  } catch (error) {
    next(error)
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Incluir password explícitamente (select: false en el modelo)
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
      })
    }

    const isMatch = await bcryptjs.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
      })
    }

    const token = generateToken(user._id)

    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      token,
      user: userResponse,
    })
  } catch (error) {
    next(error)
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  // req.user viene del sessionMiddleware
  res.json(req.user)
}

// ─── BONUS: PATCH /api/auth/change-password ───────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Obtener usuario con password
    const user = await User.findById(req.user._id).select('+password')

    const isMatch = await bcryptjs.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'La contraseña actual es incorrecta',
      })
    }

    user.password = await bcryptjs.hash(newPassword, 10)
    await user.save()

    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    next(error)
  }
}
