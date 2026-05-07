import { app, httpServer, io } from './app.js';
import mongoose from 'mongoose';
import { config } from './config/index.js';

const PORT = config.port;

// Función de conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUri);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Desconectado de MongoDB');
});

const startServer = async () => {
  // Conectar a BD antes de iniciar el servidor
  await connectDB();
  
  httpServer.listen(PORT, () => {
    console.log(`🏢 BildyApp API corriendo en http://localhost:${PORT}`);
    console.log(`📝 Entorno: ${config.nodeEnv}`);
    console.log(`🔌 WebSocket disponible en ws://localhost:${PORT}`);
  });
};

// Solo iniciar el servidor si no estamos en entorno de test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

const shutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);

  httpServer.close(async () => {
    console.log('✅ Servidor HTTP cerrado');

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB desconectado');
    }

    if (io) {
      await io.close();
      console.log('✅ Socket.IO cerrado');
    }

    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forzando cierre después de timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));