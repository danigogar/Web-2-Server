import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { setupSocket } from './socket/index.js';
import authRoutes from './routes/auth.routes.js';
import roomsRoutes from './routes/rooms.routes.js';

const app = express();
const httpServer = createServer(app);

await connectDB();
const io = setupSocket(httpServer);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`💬 Chat Completo corriendo en http://localhost:${PORT}`);
  console.log(`🔌 WebSocket disponible en ws://localhost:${PORT}`);
  console.log(`✨ Bonus incluidos: mensajes privados, reacciones, editar/eliminar, búsqueda, imágenes`);
});

export { app, io };
