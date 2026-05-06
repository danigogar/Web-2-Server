import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};
