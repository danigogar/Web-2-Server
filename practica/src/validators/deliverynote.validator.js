import { z } from 'zod';

const workerSchema = z.object({
  name: z.string().min(1, 'Nombre del trabajador requerido'),
  hours: z.number().min(0, 'Horas no pueden ser negativas')
});

const materialSchema = z.object({
  format: z.literal('material'),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de proyecto no válido'),
  description: z.string().min(1, 'Descripción requerida').trim(),
  workDate: z.coerce.date(),
  material: z.string().min(1, 'Material requerido').trim(),
  quantity: z.number().min(0.01, 'Cantidad debe ser mayor a 0'),
  unit: z.string().min(1, 'Unidad requerida').trim()
});

const hoursSchema = z.object({
  format: z.literal('hours'),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de proyecto no válido'),
  description: z.string().min(1, 'Descripción requerida').trim(),
  workDate: z.coerce.date(),
  hours: z.number().min(0, 'Horas no pueden ser negativas').optional(),
  workers: z.array(workerSchema).optional()
}).refine(data => data.hours || (data.workers && data.workers.length > 0), {
  message: 'Debe especificar horas totales o lista de trabajadores'
});

export const createDeliveryNoteSchema = z.union([materialSchema, hoursSchema]);

export const listDeliveryNotesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    format: z.enum(['material', 'hours']).optional(),
    signed: z.enum(['true', 'false']).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    sort: z.string().optional()
  })
});