import { z } from 'zod';

// Esquema de dirección reutilizable
const addressSchema = z.object({
  street: z.string().trim().min(1, 'La calle es requerida').optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().min(1, 'El código postal es requerido').optional(),
  city: z.string().trim().min(1, 'La ciudad es requerida').optional(),
  province: z.string().trim().min(1, 'La provincia es requerida').optional()
});

// Registro de usuario
export const registerSchema = z.object({
  email: z.string()
    .email('Email no válido')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
});

// Validación de email
export const validationSchema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código debe contener solo números')
});

// Login
export const loginSchema = z.object({
  email: z.string()
    .email('Email no válido')
    .transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, 'La contraseña es requerida')
});

// Onboarding - Datos personales
export const personalDataSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').trim(),
  lastName: z.string().min(1, 'Los apellidos son requeridos').trim(),
  nif: z.string().min(1, 'El NIF es requerido').trim().toUpperCase()
});

// Onboarding - Compañía (con discriminatedUnion para isFreelance)
const freelanceCompanySchema = z.object({
  isFreelance: z.literal(true)
});

const regularCompanySchema = z.object({
  isFreelance: z.literal(false),
  name: z.string().min(1, 'El nombre de la compañía es requerido').trim(),
  cif: z.string().min(1, 'El CIF es requerido').trim().toUpperCase(),
  address: addressSchema
});

export const companySchema = z.discriminatedUnion('isFreelance', [
  freelanceCompanySchema,
  regularCompanySchema
]);

// Cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword']
});

// Invitar compañero
export const inviteSchema = z.object({
  email: z.string()
    .email('Email no válido')
    .transform(val => val.toLowerCase().trim()),
  name: z.string().min(1, 'El nombre es requerido').trim(),
  lastName: z.string().min(1, 'Los apellidos son requeridos').trim()
});

// Refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido')
});

// Query params para delete
export const deleteUserSchema = z.object({
  query: z.object({
    soft: z.enum(['true', 'false']).default('true')
  })
});