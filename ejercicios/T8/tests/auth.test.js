import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app.js'
import dbConnect from '../src/config/db.js'

// Conectar a la BD de test antes de todos los tests
beforeAll(async () => {
  await dbConnect(process.env.MONGODB_TEST_URI)
})

// Limpiar la colección de usuarios después de todos los tests
afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({})
  await mongoose.connection.close()
})

describe('Auth Endpoints', () => {
  // Usuario de prueba con email único por ejecución
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'Password123',
  }

  let token = ''

  // ── POST /api/auth/register ───────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario y devolver 201 con token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('user')
      expect(res.body.user.email).toBe(testUser.email)
      expect(res.body.user.role).toBe('user')
      expect(res.body.user).not.toHaveProperty('password')

      token = res.body.token
    })

    it('debería devolver 400 si el email ya está registrado', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incompleto@example.com' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 400 si el email no tiene formato válido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'no-es-un-email', password: 'Password123' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 400 si la contraseña tiene menos de 8 caracteres', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'otro@example.com', password: '123' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe(true)
    })
  })

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('debería hacer login correctamente y devolver 201 con token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).not.toHaveProperty('password')

      token = res.body.token
    })

    it('debería devolver 401 si la contraseña es incorrecta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword999' })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 401 si el usuario no existe', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@example.com', password: 'Password123' })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe(true)
    })
  })

  // ── GET /api/auth/me ──────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('debería devolver 200 con datos del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.email).toBe(testUser.email)
      expect(res.body).not.toHaveProperty('password')
    })

    it('debería devolver 401 sin token', async () => {
      const res = await request(app)
        .get('/api/auth/me')

      expect(res.status).toBe(401)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 401 con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_invalido_123')

      expect(res.status).toBe(401)
      expect(res.body.error).toBe(true)
    })
  })
})
