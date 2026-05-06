import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: true,
    message: 'Demasiadas peticiones, intenta en 15 minutos',
    code: 'RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
});
