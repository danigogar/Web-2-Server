import app from './app.js'
import dbConnect from './config/db.js'
import { env } from './config/env.js'

const startServer = async () => {
  await dbConnect()

  app.listen(env.PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${env.PORT}`)
    console.log(`📦 Entorno: ${env.NODE_ENV}`)
    console.log(`🎬 BlockBuster API lista`)
  })
}

startServer()
