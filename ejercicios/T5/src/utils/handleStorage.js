import multer from 'multer'
import { extname, join } from 'node:path'

const __dirname = import.meta.dirname

// Configuración de dónde y cómo guardar los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(__dirname, '../../storage')
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = extname(file.originalname).toLowerCase()
    cb(null, `cover-${uniqueSuffix}${ext}`)
  },
})

// Solo permitir imágenes
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('TIPO_NO_PERMITIDO'), false)
  }
}

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

export default uploadMiddleware
