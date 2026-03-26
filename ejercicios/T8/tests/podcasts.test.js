import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app.js'
import dbConnect from '../src/config/db.js'

beforeAll(async () => {
  await dbConnect(process.env.MONGODB_TEST_URI)
})

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({})
  await mongoose.connection.collection('podcasts').deleteMany({})
  await mongoose.connection.close()
})

describe('Podcasts Endpoints', () => {
  let userToken = ''
  let adminToken = ''
  let podcastId = ''

  // Datos de prueba
  const normalUser = {
    name: 'Normal User',
    email: `user_${Date.now()}@example.com`,
    password: 'Password123',
  }

  const adminUser = {
    name: 'Admin User',
    email: `admin_${Date.now()}@example.com`,
    password: 'Password123',
  }

  const testPodcast = {
    title: 'Tech con Café',
    description: 'Un podcast sobre tecnología y desarrollo web moderno',
    category: 'tech',
    duration: 3600,
    episodes: 5,
  }

  // Registrar usuarios y obtener tokens antes de los tests
  beforeAll(async () => {
    // Registrar usuario normal
    const userRes = await request(app)
      .post('/api/auth/register')
      .send(normalUser)
    userToken = userRes.body.token

    // Registrar y promover a admin directamente en BD
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send(adminUser)
    adminToken = adminRes.body.token

    // Cambiar rol a admin directamente en la BD
    await mongoose.connection
      .collection('users')
      .updateOne({ email: adminUser.email }, { $set: { role: 'admin' } })

    // Volver a hacer login para obtener token con usuario actualizado
    // (el token ya tiene el userId, el middleware consulta la BD siempre)
    // adminToken sigue siendo válido porque el middleware busca el usuario en BD
  })

  // ── GET /api/podcasts ─────────────────────────────────────────────────────
  describe('GET /api/podcasts', () => {
    it('debería devolver 200 con un array (solo publicados)', async () => {
      const res = await request(app).get('/api/podcasts')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(Array.isArray(res.body.data)).toBe(true)
      // Solo podcasts publicados
      res.body.data.forEach((p) => {
        expect(p.published).toBe(true)
      })
    })

    it('debería soportar paginación con ?page y ?limit (BONUS)', async () => {
      const res = await request(app).get('/api/podcasts?page=1&limit=5')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('pagination')
      expect(res.body.pagination.limit).toBe(5)
    })
  })

  // ── POST /api/podcasts ────────────────────────────────────────────────────
  describe('POST /api/podcasts', () => {
    it('debería crear un podcast y devolver 201 (requiere token)', async () => {
      const res = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testPodcast)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.title).toBe(testPodcast.title)
      expect(res.body.data.published).toBe(false)
      expect(res.body.data).toHaveProperty('author')

      podcastId = res.body.data._id
    })

    it('debería devolver 401 sin token', async () => {
      const res = await request(app)
        .post('/api/podcasts')
        .send(testPodcast)

      expect(res.status).toBe(401)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Solo título' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 400 si la categoría no es válida', async () => {
      const res = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...testPodcast, category: 'deportes' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe(true)
    })
  })

  // ── DELETE /api/podcasts/:id ──────────────────────────────────────────────
  describe('DELETE /api/podcasts/:id', () => {
    it('debería devolver 403 para usuario normal', async () => {
      const res = await request(app)
        .delete(`/api/podcasts/${podcastId}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(403)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 200 para admin', async () => {
      // Primero crear otro podcast para eliminar
      const createRes = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...testPodcast, title: 'Podcast para eliminar' })

      const idToDelete = createRes.body.data._id

      const res = await request(app)
        .delete(`/api/podcasts/${idToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBeDefined()
    })

    it('debería devolver 401 sin token', async () => {
      const res = await request(app)
        .delete(`/api/podcasts/${podcastId}`)

      expect(res.status).toBe(401)
    })
  })

  // ── GET /api/podcasts/admin/all ───────────────────────────────────────────
  describe('GET /api/podcasts/admin/all', () => {
    it('debería devolver 200 con todos los podcasts para admin', async () => {
      const res = await request(app)
        .get('/api/podcasts/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('debería devolver 403 para usuario normal', async () => {
      const res = await request(app)
        .get('/api/podcasts/admin/all')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(403)
      expect(res.body.error).toBe(true)
    })

    it('debería devolver 401 sin token', async () => {
      const res = await request(app)
        .get('/api/podcasts/admin/all')

      expect(res.status).toBe(401)
    })
  })

  // ── PATCH /api/podcasts/:id/publish ──────────────────────────────────────
  describe('PATCH /api/podcasts/:id/publish', () => {
    it('debería publicar un podcast si es admin', async () => {
      const res = await request(app)
        .patch(`/api/podcasts/${podcastId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.published).toBe(true)
    })

    it('debería devolver 403 si no es admin', async () => {
      const res = await request(app)
        .patch(`/api/podcasts/${podcastId}/publish`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })
  })
})
