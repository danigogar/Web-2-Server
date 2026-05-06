import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(process.cwd(), 'uploads');

// Almacenamiento en disco para logos
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

// Almacenamiento en memoria para firmas
const memoryStorage = multer.memoryStorage();

// Filtro para imágenes en general
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WEBP)', 400), false);
  }
};

// Filtro específico para firmas
const signatureFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Formato de firma no permitido. Solo JPEG, PNG o WebP', 400), false);
  }
};

// Middleware para subir logo
export const uploadLogo = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
}).single('logo');

// Middleware para subir firma
export const uploadSignature = multer({
  storage: memoryStorage,
  fileFilter: signatureFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('signature');

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: `El archivo excede el tamaño máximo de ${config.maxFileSize / 1024 / 1024}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: true,
        message: 'Campo de archivo no esperado',
        code: 'UNEXPECTED_FILE'
      });
    }
    return res.status(400).json({
      error: true,
      message: err.message,
      code: err.code
    });
  }
  next(err);
};