import { z } from 'zod'

export const validatorRegister = z.object({
  body: z.object({
    name: z.string({ required_error: 'El nombre es obligatorio' })
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .trim(),
    email: z.string({ required_error: 'El email es obligatorio' })
      .email('Email no válido')
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: 'La contraseña es obligatoria' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  }),
})

export const validatorLogin = z.object({
  body: z.object({
    email: z.string({ required_error: 'El email es obligatorio' })
      .email('Email no válido')
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: 'La contraseña es obligatoria' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  }),
})

export const validatorChangePassword = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'La contraseña actual es obligatoria' })
      .min(8),
    newPassword: z.string({ required_error: 'La nueva contraseña es obligatoria' })
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  }),
})
