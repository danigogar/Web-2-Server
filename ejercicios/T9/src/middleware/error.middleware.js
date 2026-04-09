import { Prisma } from '@prisma/client';

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({ error: true, message: `El campo ${err.meta?.target} ya existe` });
      case 'P2025':
        return res.status(404).json({ error: true, message: 'Registro no encontrado' });
      default:
        return res.status(400).json({ error: true, message: 'Error de base de datos' });
    }
  }

  const status = err.status || 500;
  const message = err.message || 'Error interno';
  res.status(status).json({ error: true, message });
}
