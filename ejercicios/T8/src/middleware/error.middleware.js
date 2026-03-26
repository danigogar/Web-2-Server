import mongoose from 'mongoose'

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
}

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message)

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      details: messages,
    })
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: true,
      message: `ID inválido: ${err.value}`,
    })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      error: true,
      message: `Ya existe un registro con ese '${field}'`,
    })
  }

  const isDev = process.env.NODE_ENV === 'development'
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor',
    ...(isDev && { stack: err.stack }),
  })
}
