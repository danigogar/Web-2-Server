import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import Movie from '../models/movie.model.js'
import { ApiError } from '../middleware/errorHandler.js'
import { env } from '../config/env.js'

const __dirname = import.meta.dirname

// Helper para eliminar archivo de carátula del disco
const deleteCoverFile = async (filename) => {
  if (!filename) return
  try {
    const filePath = join(__dirname, '../../storage', filename)
    await unlink(filePath)
  } catch {
    console.warn(`⚠️  No se pudo eliminar el archivo: ${filename}`)
  }
}

// ─── GET /api/movies ────────────────────────────────────────────────────────
export const getMovies = async (req, res) => {
  const { genre, search, page, limit } = req.query

  const filter = {}
  if (genre) filter.genre = genre
  if (search) filter.title = { $regex: search, $options: 'i' }

  // Paginación (BONUS)
  const pageNum = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10))
  const skip = (pageNum - 1) * limitNum

  const [movies, total] = await Promise.all([
    Movie.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean(),
    Movie.countDocuments(filter),
  ])

  res.json({
    data: movies,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  })
}

// ─── GET /api/movies/stats/top ───────────────────────────────────────────────
export const getTopMovies = async (req, res) => {
  const movies = await Movie.find()
    .sort({ timesRented: -1 })
    .limit(5)
    .select('title director genre timesRented availableCopies')
    .lean()

  res.json({ data: movies })
}

// ─── GET /api/movies/available ───────────────────────────────────────────────
export const getAvailableMovies = async (req, res) => {
  const movies = await Movie.find({ availableCopies: { $gt: 0 } }).lean()
  res.json({ data: movies })
}

// ─── GET /api/movies/:id ─────────────────────────────────────────────────────
export const getMovieById = async (req, res) => {
  const movie = await Movie.findById(req.params.id).lean()

  if (!movie) {
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  res.json({ data: movie })
}

// ─── POST /api/movies ────────────────────────────────────────────────────────
export const createMovie = async (req, res) => {
  const movie = await Movie.create(req.body)
  res.status(201).json({ data: movie })
}

// ─── PUT /api/movies/:id ─────────────────────────────────────────────────────
export const updateMovie = async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!movie) {
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  res.json({ data: movie })
}

// ─── DELETE /api/movies/:id ──────────────────────────────────────────────────
export const deleteMovie = async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id)

  if (!movie) {
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  // Eliminar carátula si tenía una
  await deleteCoverFile(movie.cover)

  res.status(204).send()
}

// ─── PATCH /api/movies/:id/rent ──────────────────────────────────────────────
export const rentMovie = async (req, res) => {
  const movie = await Movie.findById(req.params.id)

  if (!movie) {
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  if (movie.availableCopies === 0) {
    throw ApiError.badRequest('No hay copias disponibles para alquilar')
  }

  movie.availableCopies -= 1
  movie.timesRented += 1
  await movie.save()

  res.json({
    data: movie,
    message: `"${movie.title}" alquilada correctamente. Quedan ${movie.availableCopies} copias disponibles.`,
  })
}

// ─── PATCH /api/movies/:id/return ────────────────────────────────────────────
export const returnMovie = async (req, res) => {
  const movie = await Movie.findById(req.params.id)

  if (!movie) {
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  if (movie.availableCopies >= movie.copies) {
    throw ApiError.badRequest('Todas las copias ya están disponibles, no se puede devolver más')
  }

  movie.availableCopies += 1
  await movie.save()

  res.json({
    data: movie,
    message: `"${movie.title}" devuelta correctamente. Hay ${movie.availableCopies} copias disponibles.`,
  })
}

// ─── PATCH /api/movies/:id/cover ─────────────────────────────────────────────
export const uploadCover = async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No se ha subido ningún archivo')
  }

  const movie = await Movie.findById(req.params.id)

  if (!movie) {
    // Si la película no existe, eliminar el archivo subido
    await deleteCoverFile(req.file.filename)
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  // Si ya tenía carátula, eliminar la anterior
  await deleteCoverFile(movie.cover)

  // Guardar el nuevo nombre de archivo
  movie.cover = req.file.filename
  await movie.save()

  res.json({
    data: movie,
    coverUrl: `${env.PUBLIC_URL}/uploads/${req.file.filename}`,
    message: 'Carátula subida correctamente',
  })
}

// ─── GET /api/movies/:id/cover ────────────────────────────────────────────────
export const getCover = async (req, res) => {
  const movie = await Movie.findById(req.params.id).select('cover').lean()

  if (!movie) {
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  if (!movie.cover) {
    throw ApiError.notFound('Esta película no tiene carátula')
  }

  const filePath = join(__dirname, '../../storage', movie.cover)
  res.sendFile(filePath)
}

// ─── BONUS: PATCH /api/movies/:id/rate ───────────────────────────────────────
export const rateMovie = async (req, res) => {
  const { rating } = req.body

  if (!rating || rating < 1 || rating > 5) {
    throw ApiError.badRequest('La valoración debe ser un número entre 1 y 5')
  }

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { rating },
    { new: true, runValidators: true }
  )

  if (!movie) {
    throw ApiError.notFound(`Película con ID ${req.params.id} no encontrada`)
  }

  res.json({ data: movie, message: `Valoración de ${rating}/5 registrada` })
}
