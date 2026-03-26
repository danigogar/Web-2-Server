import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const sessionMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Token no proporcionado',
      })
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({
        error: true,
        message: 'Token inválido o expirado',
      })
    }

    if (!decoded.userId) {
      return res.status(401).json({
        error: true,
        message: 'Token malformado',
      })
    }

    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no encontrado',
      })
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({
      error: true,
      message: 'Error de autenticación',
    })
  }
}

export default sessionMiddleware
