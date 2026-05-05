import multer from 'multer';
import path from 'node:path';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const uploadsPath = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WEBP)', 400), false);
  }
};

export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
}).single('logo');

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: `El archivo excede el tamaño máximo de ${config.maxFileSize / 1024 / 1024}MB`,
        code: 'FILE_TOO_LARGE'
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
