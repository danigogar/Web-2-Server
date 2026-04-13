import app from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🏢 BildyApp API corriendo en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${config.nodeEnv}`);
});

process.on('SIGINT', async () => {
  console.log('\n🔌 Cerrando servidor...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔌 Cerrando servidor...');
  server.close();
  process.exit(0);
});
