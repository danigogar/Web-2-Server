import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { join } from 'node:path'
import routes from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const __dirname = import.meta.dirname

const app = express()

// ── Seguridad ──────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors())

// ── Parseo de body ─────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Archivos estáticos (carátulas) ─────────────────────────────────────────
app.use('/uploads', express.static(join(__dirname, '../storage')))

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
