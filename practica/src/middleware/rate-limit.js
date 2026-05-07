import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // En test subimos el límite a un valor que no se va a alcanzar
  // para que los tests de integración no fallen por rate limiting.
  max: isTest ? 100000 : 100,
  message: {
    error: true,
    message: 'Demasiadas peticiones, intenta en 15 minutos',
    code: 'RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
});
