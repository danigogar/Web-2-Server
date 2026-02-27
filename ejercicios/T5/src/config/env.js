import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es obligatoria'),
  PUBLIC_URL: z.string().url().default('http://localhost:3000'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:')
  parsed.error.issues.forEach(issue => {
    console.error(`  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
  })
  process.exit(1)
}

export const env = parsed.data
