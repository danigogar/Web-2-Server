import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables del archivo .env
dotenv.config();

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';

// Usar JWT_SECRET del .env, o si no existe, usar una por defecto
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-32-chars-long-here';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.DB_URI = uri;
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});