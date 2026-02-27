import { Router } from 'express'
import {
  getMovies,
  getTopMovies,
  getAvailableMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  rentMovie,
  returnMovie,
  uploadCover,
  getCover,
  rateMovie,
} from '../controllers/movies.controller.js'
import { validate, validateObjectId } from '../middleware/validateRequest.js'
import { createMovieSchema, updateMovieSchema } from '../schemas/movie.schema.js'
import uploadMiddleware from '../utils/handleStorage.js'

const router = Router()

// ── Rutas especiales ANTES de /:id para evitar conflictos ──────────────────
router.get('/stats/top', getTopMovies)
router.get('/available', getAvailableMovies)

// ── CRUD básico ────────────────────────────────────────────────────────────
router.get('/', getMovies)
router.get('/:id', validateObjectId(), getMovieById)
router.post('/', validate(createMovieSchema), createMovie)
router.put('/:id', validateObjectId(), validate(updateMovieSchema), updateMovie)
router.delete('/:id', validateObjectId(), deleteMovie)

// ── Lógica de negocio ──────────────────────────────────────────────────────
router.patch('/:id/rent', validateObjectId(), rentMovie)
router.patch('/:id/return', validateObjectId(), returnMovie)

// ── Carátulas ──────────────────────────────────────────────────────────────
router.patch('/:id/cover', validateObjectId(), uploadMiddleware.single('cover'), uploadCover)
router.get('/:id/cover', validateObjectId(), getCover)

// ── BONUS: Valoraciones ────────────────────────────────────────────────────
router.patch('/:id/rate', validateObjectId(), rateMovie)

export default router
