import { z } from 'zod'

const currentYear = new Date().getFullYear()

const movieBody = z.object({
  title: z
    .string({ required_error: 'El título es obligatorio' })
    .min(2, 'El título debe tener al menos 2 caracteres'),
  director: z.string({ required_error: 'El director es obligatorio' }).min(1),
  year: z
    .number({ required_error: 'El año es obligatorio' })
    .int()
    .min(1888, 'El año mínimo es 1888')
    .max(currentYear, `El año no puede ser mayor que ${currentYear}`),
  genre: z.enum(['action', 'comedy', 'drama', 'horror', 'scifi'], {
    required_error: 'El género es obligatorio',
    message: 'Género no válido. Usa: action, comedy, drama, horror, scifi',
  }),
  copies: z.number().int().min(1).default(5).optional(),
})

export const createMovieSchema = z.object({
  body: movieBody,
})

export const updateMovieSchema = z.object({
  body: movieBody.partial(), // todos los campos opcionales en update
  params: z.object({
    id: z.string().min(1),
  }),
})
