import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { config } from './config/index.js';
import userRoutes from './routes/user.routes.js';
import { notFound, errorHandler } from './middleware/error-handler.js';

const app = express();

// Conexión a MongoDB
try {
  await mongoose.connect(config.dbUri);
  console.log('✅ Conectado a MongoDB Atlas');
} catch (error) {
  console.error('❌ Error conectando a MongoDB:', error.message);
  process.exit(1);
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Desconectado de MongoDB');
});

// Seguridad
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
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
app.use('/api', limiter);

// Parseo de JSON
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (uploads)
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use('/api/user', userRoutes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

export default app;