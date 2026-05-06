import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional()
});

export const createClientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').trim(),
  cif: z.string().min(1, 'El CIF es requerido').trim().toUpperCase(),
  email: z.string().email('Email no válido').optional(),
  phone: z.string().optional(),
  address: addressSchema.optional()
});

export const updateClientSchema = createClientSchema.partial();

export const listClientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    name: z.string().optional(),
    sort: z.string().optional(),
    archived: z.enum(['true', 'false']).default('false')
  })
});
