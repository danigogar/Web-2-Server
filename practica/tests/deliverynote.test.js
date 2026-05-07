import request from 'supertest';
import { app } from '../src/app.js';

describe('DeliveryNote Endpoints', () => {
  let token;
  let projectId;

  beforeEach(async () => {
    // 1. Registrar usuario
    const register = await request(app).post('/api/user/register').send({ email: 'delivery@test.com', password: '12345678', name: 'Delivery Test' });
    token = register.body.accessToken;
    
    // 2. Onboarding - Datos personales
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`).send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
    
    // 3. Onboarding - Compañía (autónomo)
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    
    // 4. Crear cliente
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente Test', cif: 'B12345678' });
    
    // 5. Crear proyecto
    const project = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId: client.body.client._id, name: 'Proyecto Test', projectCode: 'TEST001' });
    projectId = project.body.project._id;
  });

  describe('POST /api/deliverynote', () => {
    it('should create material delivery note', async () => {
      const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`).send({ format: 'material', projectId, description: 'Entrega de materiales', workDate: new Date(), material: 'Cemento', quantity: 10, unit: 'kg' });
      expect(res.status).toBe(201);
      expect(res.body.deliveryNote).toHaveProperty('format', 'material');
    });
  });

  describe('GET /api/deliverynote', () => {
    it('should list delivery notes', async () => {
      const res = await request(app)
        .get('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });
  });
});

describe('DeliveryNote Endpoints - Errores', () => {
  let token;
  let projectId;
  let deliveryNoteId;

  beforeEach(async () => {
    const register = await request(app).post('/api/user/register').send({ email: 'deliveryerror@test.com', password: '12345678', name: 'Delivery Error' });
    token = register.body.accessToken;
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`).send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente Error', cif: 'E12345678' });
    const project = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId: client.body.client._id, name: 'Proyecto Error', projectCode: 'ERR001' });
    projectId = project.body.project._id;
    
    const deliveryNote = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`).send({ format: 'material', projectId, description: 'Test Error', workDate: new Date(), material: 'Test', quantity: 1, unit: 'kg' });
    deliveryNoteId = deliveryNote.body.deliveryNote._id;
  });

  it('should return 404 for non-existent delivery note', async () => {
    const res = await request(app)
      .get('/api/deliverynote/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('should return 400 when creating delivery note with invalid format', async () => {
    const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`).send({ format: 'invalid', projectId, description: 'Test', workDate: new Date() });
    expect(res.status).toBe(400);
  });

  it('should get delivery note by id', async () => {
    const res = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.deliveryNote).toHaveProperty('_id', deliveryNoteId);
  });

  it('should delete delivery note (not signed)', async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});