import { z } from 'zod';

export const createTrackSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'El título es requerido').max(200),
    artist: z.string().min(1, 'El artista es requerido'),
    album: z.string().optional(),
    duration: z.number({ required_error: 'La duración es requerida' }).positive('Debe ser positivo'),
    genres: z.array(z.string()).min(1, 'Al menos un género').optional(),
    file: z.string().optional()
  })
});

export const updateTrackSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    album: z.string().optional(),
    duration: z.number().positive().optional(),
    genres: z.array(z.string()).min(1).optional()
  })
});
