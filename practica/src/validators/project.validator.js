import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional()
});

export const createProjectSchema = z.object({
  clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente no válido'),
  name: z.string().min(1, 'El nombre es requerido').trim(),
  projectCode: z.string().min(1, 'El código de proyecto es requerido').trim().toUpperCase(),
  address: addressSchema.optional(),
  email: z.string().email('Email no válido').optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true)
});

export const updateProjectSchema = createProjectSchema.partial();

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    name: z.string().optional(),
    active: z.enum(['true', 'false']).optional(),
    sort: z.string().optional(),
    archived: z.enum(['true', 'false']).default('false')
  })
});
