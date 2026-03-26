import app from './app.js'
import dbConnect from './config/db.js'

const PORT = process.env.PORT || 3000

const startServer = async () => {
  await dbConnect()

  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`)
    console.log(`📚 Documentación en http://localhost:${PORT}/api-docs`)
    console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`)
  })
}

startServer()
