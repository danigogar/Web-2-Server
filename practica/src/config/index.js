export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000'
};

// Validar variables críticas
if (!config.dbUri) {
  console.error('❌ DB_URI no está definida en .env');
  process.exit(1);
}

if (!config.jwtSecret) {
  console.error('❌ JWT_SECRET no está definida en .env');
  process.exit(1);
}