import { ZodError } from 'zod'

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    })
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        details: errors,
      })
    }
    next(error)
  }
}

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName]
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      error: true,
      message: `'${paramName}' no es un ID válido`,
    })
  }
  next()
}
