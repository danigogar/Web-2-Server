import mongoose from 'mongoose'

const dbConnect = async (uri) => {
  const DB_URI = uri || process.env.MONGODB_URI

  try {
    await mongoose.connect(DB_URI, { appName: 'podcasthub-api' })
    console.log('✅ Conectado a MongoDB')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Desconectado de MongoDB')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🔌 Conexión a MongoDB cerrada')
  process.exit(0)
})

export default dbConnect
