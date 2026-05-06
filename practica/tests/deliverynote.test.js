import request from 'supertest';
import { app } from '../src/app.js';

describe('DeliveryNote Endpoints', () => {
  let token;
  let projectId;

  beforeEach(async () => {
    const register = await request(app).post('/api/user/register').send({ email: 'delivery@test.com', password: '12345678', name: 'Delivery Test' });
    token = register.body.token;
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente Test', cif: 'B12345678' });
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
});
