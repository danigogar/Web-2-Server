import request from 'supertest';
import { app } from '../src/app.js';

// Helper común para todos los suites: crea usuario, onboarding, cliente y proyecto
const setupUserWithProject = async (email, projectCode = 'TEST001') => {
  const register = await request(app)
    .post('/api/user/register')
    .send({ email, password: '12345678' });
  const token = register.body.accessToken;

  await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
  await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`)
    .send({ isFreelance: true });

  const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Cliente Test', cif: 'B12345678' });
  const project = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
    .send({ clientId: client.body.client._id, name: 'Proyecto Test', projectCode });

  return { token, projectId: project.body.project._id, clientId: client.body.client._id };
};

describe('DeliveryNote Endpoints', () => {
  let token;
  let projectId;

  beforeEach(async () => {
    const setup = await setupUserWithProject('delivery@test.com');
    token = setup.token;
    projectId = setup.projectId;
  });

  describe('POST /api/deliverynote', () => {
    it('should create material delivery note', async () => {
      const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
        .send({ format: 'material', projectId, description: 'Entrega de materiales', workDate: new Date(), material: 'Cemento', quantity: 10, unit: 'kg' });
      expect(res.status).toBe(201);
      expect(res.body.deliveryNote).toHaveProperty('format', 'material');
    });

    it('should create hours delivery note with total hours', async () => {
      const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
        .send({ format: 'hours', projectId, description: 'Horas trabajadas', workDate: new Date(), hours: 8 });
      expect(res.status).toBe(201);
      expect(res.body.deliveryNote.format).toBe('hours');
      expect(res.body.deliveryNote.hours).toBe(8);
    });

    it('should create hours delivery note with workers list', async () => {
      const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
        .send({
          format: 'hours',
          projectId,
          description: 'Trabajo en equipo',
          workDate: new Date(),
          workers: [
            { name: 'Pepe', hours: 4 },
            { name: 'Ana', hours: 5 }
          ]
        });
      expect(res.status).toBe(201);
      expect(res.body.deliveryNote.workers).toHaveLength(2);
    });

    it('should return 400 when hours format has neither hours nor workers', async () => {
      const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
        .send({ format: 'hours', projectId, description: 'Sin datos', workDate: new Date() });
      expect(res.status).toBe(400);
    });

    it('should return 404 when project does not exist', async () => {
      const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
        .send({ format: 'material', projectId: '000000000000000000000000', description: 'X', workDate: new Date(), material: 'Y', quantity: 1, unit: 'u' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/deliverynote', () => {
    it('should list delivery notes with pagination', async () => {
      const res = await request(app)
        .get('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });

    it('should filter by format', async () => {
      await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
        .send({ format: 'material', projectId, description: 'M', workDate: new Date(), material: 'X', quantity: 1, unit: 'u' });
      await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
        .send({ format: 'hours', projectId, description: 'H', workDate: new Date(), hours: 8 });

      const res = await request(app)
        .get('/api/deliverynote?format=hours')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.every(d => d.format === 'hours')).toBe(true);
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/deliverynote?from=2020-01-01&to=2030-12-31')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('should filter by signed status', async () => {
      const res = await request(app)
        .get('/api/deliverynote?signed=false')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});

describe('DeliveryNote Endpoints - Errores', () => {
  let token;
  let projectId;
  let deliveryNoteId;

  beforeEach(async () => {
    const setup = await setupUserWithProject('deliveryerror@test.com', 'ERR001');
    token = setup.token;
    projectId = setup.projectId;

    const deliveryNote = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
      .send({ format: 'material', projectId, description: 'Test Error', workDate: new Date(), material: 'Test', quantity: 1, unit: 'kg' });
    deliveryNoteId = deliveryNote.body.deliveryNote._id;
  });

  it('should return 404 for non-existent delivery note', async () => {
    const res = await request(app)
      .get('/api/deliverynote/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('should return 400 when creating delivery note with invalid format', async () => {
    const res = await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`)
      .send({ format: 'invalid', projectId, description: 'Test', workDate: new Date() });
    expect(res.status).toBe(400);
  });

  it('should get delivery note by id (with populate)', async () => {
    const res = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.deliveryNote).toHaveProperty('_id', deliveryNoteId);
    expect(res.body.deliveryNote.client).toHaveProperty('name');
    expect(res.body.deliveryNote.project).toHaveProperty('name');
  });

  it('should delete delivery note (not signed)', async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('should return 404 when deleting non-existent delivery note', async () => {
    const res = await request(app)
      .delete('/api/deliverynote/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('should return 400 when downloading PDF of unsigned delivery note', async () => {
    const res = await request(app)
      .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
