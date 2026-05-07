import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { createServer } from 'node:http';
import { config } from './config/index.js';
import userRoutes from './routes/user.routes.js';
import clientRoutes from './routes/client.routes.js';
import projectRoutes from './routes/project.routes.js';
import deliveryNoteRoutes from './routes/deliverynote.routes.js';
import { notFound, errorHandler } from './middleware/error-handler.js';
import { limiter } from './middleware/rate-limit.js';
import { sanitizeBodyOnly } from './middleware/sanitize.js';
import { setupSocket } from './socket/index.js';
import { logToSlack } from './services/logger.service.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from './config/swagger.js';
import routes from './routes/index.js';


const app = express();

// Seguridad
app.use(helmet());
app.use(cors());
app.use(sanitizeBodyOnly);

// Rate limiting
app.use('/api', limiter);

// Parseo de JSON
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (uploads)
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Añadido temporalmente para Prueba de Slack Errors (Comprobado, funciona y envía reporte en canal)
/*
app.get('/test-slack', (req, res) => {
  throw new Error('Error de prueba para Slack');
});
*/

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  
  // Verificar conexión a MongoDB
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    dbStatus = 'connected';
  }

  res.json({
    status: 'ok',
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/user', userRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);
app.use('/api', routes);


// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Middleware de manejo de errores con Slack
app.use(notFound);
app.use(async (err, req, res, next) => {
  if (err.statusCode >= 500 && !err.isOperational) {
    await logToSlack(err, req);
  }
  next(err);
});
app.use(errorHandler);


// Crear servidor HTTP y configurar Socket.IO
const httpServer = createServer(app);
const io = setupSocket(httpServer);

export { app, httpServer, io };