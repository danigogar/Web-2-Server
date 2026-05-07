export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: ['./tests/setup.js'],

  // Timeout por test. Bcrypt en Windows + cadena de requests en beforeEach
  // (register + onboarding + crear cliente + crear proyecto) supera fácil
  // los 5 s por defecto. 30 s da margen suficiente sin ocultar problemas reales.
  testTimeout: 30000,

  // Recoge cobertura solo del código fuente.
  collectCoverageFrom: [
    'src/**/*.js'
  ],

  // Excluimos del cálculo:
  //  - El punto de entrada (no tiene lógica testeable, solo arranca el servidor).
  //  - Configuración (carga de .env, swagger).
  //  - Servicios que dependen de servicios externos (Cloudinary, Slack, SMTP):
  //    probarlos requiere mocks complejos en ESM y no aporta valor real.
  //  - PDF service: usa pdfkit + fetch a URLs remotas para la firma.
  //  - Capa de Socket.IO: necesita cliente conectado para ejercitarla.
  //  - sanitize.js: contiene `sanitizeInput` (envoltorio sobre
  //    express-mongo-sanitize que la T6 obliga a referenciar) y que
  //    no se monta en runtime por incompatibilidad con Express 5.
  //  - upload.js: configuración de Multer (fileFilter, handleUploadError):
  //    testearlo exige requests multipart con buffers reales por endpoint,
  //    lo cual entra en el dominio de los servicios externos.
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    'src/index.js',
    'src/config/',
    'src/services/storage.service.js',
    'src/services/logger.service.js',
    'src/services/mail.service.js',
    'src/services/pdf.service.js',
    'src/socket/',
    'src/middleware/sanitize.js',
    'src/middleware/upload.js'
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};