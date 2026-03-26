import { z } from 'zod'

const podcastBody = z.object({
  title: z.string({ required_error: 'El título es obligatorio' })
    .min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string({ required_error: 'La descripción es obligatoria' })
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.enum(['tech', 'science', 'history', 'comedy', 'news'], {
    required_error: 'La categoría es obligatoria',
    message: 'Categoría no válida. Usa: tech, science, history, comedy, news',
  }),
  duration: z.number({ required_error: 'La duración es obligatoria' })
    .min(60, 'La duración mínima es 60 segundos'),
  episodes: z.number().int().min(1).optional(),
})

export const validatorCreatePodcast = z.object({
  body: podcastBody,
})

export const validatorUpdatePodcast = z.object({
  body: podcastBody.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Debe enviar al menos un campo para actualizar' }
  ),
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'ID no válido'),
  }),
})
