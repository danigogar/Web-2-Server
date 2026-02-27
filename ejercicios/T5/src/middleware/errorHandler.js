import mongoose from 'mongoose'

// Clase para errores operacionales de la API
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details)
  }

  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(404, message)
  }

  static conflict(message) {
    return new ApiError(409, message)
  }

  static internal(message = 'Error interno del servidor') {
    return new ApiError(500, message)
  }
}

// Middleware 404 — ruta no encontrada
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
}

// Middleware global de errores
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message)

  // Error operacional conocido (lanzado con ApiError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      ...(err.details && { details: err.details }),
    })
  }

  // Error de validación de Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      details: messages,
    })
  }

  // ID con formato inválido
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: true,
      message: `ID inválido: ${err.value}`,
    })
  }

  // Campo duplicado (unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      error: true,
      message: `Ya existe un registro con ese '${field}'`,
    })
  }

  // Error de Multer — archivo demasiado grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: true,
      message: 'El archivo supera el tamaño máximo permitido (5MB)',
    })
  }

  // Error de Multer — tipo de archivo no permitido
  if (err.message === 'TIPO_NO_PERMITIDO') {
    return res.status(400).json({
      error: true,
      message: 'Solo se permiten imágenes (jpeg, png, webp, gif)',
    })
  }

  // Error genérico no controlado
  const isDev = process.env.NODE_ENV === 'development'
  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    ...(isDev && { stack: err.stack, detail: err.message }),
  })
}
