import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './docs/swagger.js'
import routes from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js'

const app = express()

// ── Seguridad ──────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors())

// ── Parseo de body ─────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Documentación Swagger ──────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// ── Rutas de la API ────────────────────────────────────────────────────────
app.use('/api', routes)

// ── Manejo de errores ──────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

export default app
