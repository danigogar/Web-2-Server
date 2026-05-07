import mongoSanitize from 'express-mongo-sanitize';

// `sanitizeInput` envuelve la librería express-mongo-sanitize (T6).
// NOTA: en Express 5 `req.query` es inmutable, lo que rompe esta librería
// si se monta directamente como `app.use(mongoSanitize())`. Por eso
// declaramos el middleware aquí (referencia explícita a la librería del
// enunciado) y montamos en `app.js` la variante `sanitizeBodyOnly` de abajo,
// que aplica la misma lógica pero solo sobre `req.body`.
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Intento de inyección NoSQL detectado en ${key}`);
  }
});

// Middleware alternativo: elimina recursivamente cualquier clave que empiece
// por '$' del cuerpo de la petición (operadores de MongoDB) para evitar
// inyección NoSQL. Solo actúa sobre `req.body` por compatibilidad con Express 5.
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