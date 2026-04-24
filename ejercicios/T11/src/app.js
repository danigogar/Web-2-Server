import express from 'express';
import authRoutes from './routes/auth.routes.js';
import booksRoutes from './routes/books.routes.js';
import loansRoutes from './routes/loans.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import prisma from './config/prisma.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    version: process.version
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.database = 'connected';
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.database = 'disconnected';
    return res.status(503).json(healthcheck);
  }

  res.json(healthcheck);
});


app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api', reviewsRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Ruta no encontrada' });
});


const server = app.listen(PORT, () => {
  console.log(`📚 Biblioteca API en http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);

  server.close(async () => {
    console.log('✅ Servidor HTTP cerrado');
    await prisma.$disconnect();
    console.log('✅ Prisma desconectado');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forzando cierre después de timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));


export default app;
