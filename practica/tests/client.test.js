import request from 'supertest';
import { app } from '../src/app.js';

describe('Client Endpoints', () => {
  let token;
  let companyId;

  beforeEach(async () => {
    // 1. Registrar usuario
    const register = await request(app).post('/api/user/register').send({ email: 'client@test.com', password: '12345678', name: 'Client Test' });
    token = register.body.accessToken;
    
    // 2. Onboarding - Datos personales
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`).send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
    
    // 3. Onboarding - Compañía (autónomo)
    const companyRes = await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    companyId = companyRes.body.user.company._id;
  });

  describe('POST /api/client', () => {
    it('should create a new client', async () => {
      const res = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente Test', cif: 'B12345678' });
      expect(res.status).toBe(201);
      expect(res.body.client).toHaveProperty('name', 'Cliente Test');
    });
  });

  describe('GET /api/client', () => {
    it('should list clients', async () => {
      const res = await request(app)
        .get('/api/client')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });
  });
});

describe('Client Endpoints - Errores', () => {
  let token;

  beforeEach(async () => {
    const register = await request(app).post('/api/user/register').send({ email: 'clienterror@test.com', password: '12345678', name: 'Client Error' });
    token = register.body.accessToken;
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`).send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
  });

  it('should return 404 for non-existent client', async () => {
    const res = await request(app)
      .get('/api/client/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('should return 409 for duplicate CIF', async () => {
    await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Duplicado CIF', cif: 'D99999999' });
    const res = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Duplicado CIF 2', cif: 'D99999999' });
    expect(res.status).toBe(409);
  });

  it('should update client', async () => {
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Update Test', cif: 'U88888888' });
    const clientId = client.body.client._id;
    
    const updateRes = await request(app).put(`/api/client/${clientId}`).set('Authorization', `Bearer ${token}`).send({ name: 'Update Test Modificado' });
    expect(updateRes.status).toBe(200);
  });

  it('should archive and restore client', async () => {
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Archivar Test', cif: 'A88888888' });
    const clientId = client.body.client._id;
    
    const archiveRes = await request(app).delete(`/api/client/${clientId}?soft=true`).set('Authorization', `Bearer ${token}`);
    expect(archiveRes.status).toBe(200);
    
    const restoreRes = await request(app).patch(`/api/client/${clientId}/restore`).set('Authorization', `Bearer ${token}`);
    expect(restoreRes.status).toBe(200);
  });
});