import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
    email: z.string().email('Email no válido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    role: z.enum(['user', 'admin']).optional()
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email('Email no válido').optional(),
    role: z.enum(['user', 'admin']).optional(),
    isActive: z.boolean().optional()
  })
});
