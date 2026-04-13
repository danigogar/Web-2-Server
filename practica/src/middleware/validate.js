import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    // Validar cada parte por separado sin asignar directamente
    if (schema.shape.body) {
      req.body = schema.shape.body.parse(req.body);
    }
    if (schema.shape.query) {
      // Para query params, usar Object.assign en lugar de asignar directamente
      const validatedQuery = schema.shape.query.parse(req.query);
      Object.assign(req.query, validatedQuery);
    }
    if (schema.shape.params) {
      const validatedParams = schema.shape.params.parse(req.params);
      Object.assign(req.params, validatedParams);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details
      });
    }
    next(error);
  }
};

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details
      });
    }
    next(error);
  }
};