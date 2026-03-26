import mongoose from 'mongoose'

const dbConnect = async (uri) => {
  const DB_URI = uri || process.env.MONGODB_URI

  try {
    await mongoose.connect(DB_URI, { appName: 'podcasthub-api' })
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Conectado a MongoDB')
    }
    return mongoose.connection
  } 
  
  catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message)
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1)
    }
    throw error
  }
}

// Solo mostrar warnings si no estamos en test, para que no se vean en los Tests
mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Desconectado de MongoDB')
  }
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🔌 Conexión a MongoDB cerrada')
  process.exit(0)
})

export default dbConnect