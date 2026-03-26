/**
 * Middleware factory que verifica el rol del usuario.
 * Debe usarse después de sessionMiddleware (necesita req.user).
 * @param {string} requiredRole - Rol requerido ('user' | 'admin')
 */
const checkRol = (requiredRole) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'No autenticado',
      })
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para realizar esta acción',
      })
    }

    next()
  } catch {
    res.status(403).json({
      error: true,
      message: 'Error de autorización',
    })
  }
}

export default checkRol
