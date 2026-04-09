import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nombre muy corto'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const createBookSchema = z.object({
  isbn: z.string().min(10, 'ISBN inválido'),
  title: z.string().min(1, 'Título requerido'),
  author: z.string().min(1, 'Autor requerido'),
  genre: z.string().min(1, 'Género requerido'),
  description: z.string().optional(),
  publishedYear: z.number().int().min(1500).max(new Date().getFullYear()),
  copies: z.number().int().positive().default(1),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const bookQuerySchema = z.object({
  genre: z.string().optional(),
  author: z.string().optional(),
  title: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
