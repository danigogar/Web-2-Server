import mongoose from 'mongoose';

export const notFound = (req, res, next) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Error de validación de Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      details: messages
    });
  }

  // CastError — ID con formato inválido
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: true,
      message: `Valor inválido para '${err.path}'`
    });
  }

  // Clave duplicada (unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: true,
      message: `Ya existe un registro con ese '${field}'`
    });
  }

  // Archivo demasiado grande (Multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: true,
      message: 'El archivo excede el tamaño máximo permitido (10MB)'
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor'
  });
};
