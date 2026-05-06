import mongoSanitize from 'express-mongo-sanitize';

// Configuración que solo sanitiza el body (no query/params)
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Intento de inyección NoSQL detectado en ${key}`);
  }
});

// Middleware alternativo que NO usa sanitize en query
export const sanitizeBodyOnly = (req, res, next) => {
  if (req.body) {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
};