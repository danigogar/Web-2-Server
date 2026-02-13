import { z } from 'zod';

// Esquema para crear una tarea
export const createTodoSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(100, 'El título no puede superar los 100 caracteres'),
    description: z.string()
      .optional(),
    priority: z.enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'La prioridad debe ser: low, medium o high' })
    })
      .optional()
      .default('medium')
  })
});

// Esquema para actualizar una tarea
export const updateTodoSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(100, 'El título no puede superar los 100 caracteres'),
    description: z.string()
      .optional(),
    completed: z.boolean()
      .optional(),
    priority: z.enum(['low', 'medium', 'high'])
      .optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID debe ser numérico')
  })
});

// Esquema para validar los parámetros de ruta
export const todoIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID debe ser numérico')
  })
});

// Esquema para validar query params de filtrado
export const queryFiltersSchema = z.object({
  query: z.object({
    completed: z.string()
      .transform(val => val === 'true')
      .optional(),
    priority: z.enum(['low', 'medium', 'high'])
      .optional()
  })
});
