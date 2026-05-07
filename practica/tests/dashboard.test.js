import request from 'supertest';
import { app } from '../src/app.js';

describe('Dashboard Endpoints', () => {
  let token;
  let projectId;

  beforeEach(async () => {
    const register = await request(app).post('/api/user/register').send({ email: 'dashboard@test.com', password: '12345678', name: 'Dashboard Test' });
    token = register.body.accessToken;
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`).send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente Dashboard', cif: 'D12345678' });
    const project = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId: client.body.client._id, name: 'Proyecto Dashboard', projectCode: 'DB001' });
    projectId = project.body.project._id;
    
    await request(app).post('/api/deliverynote').set('Authorization', `Bearer ${token}`).send({ format: 'material', projectId, description: 'Dashboard Test', workDate: new Date(), material: 'Test', quantity: 10, unit: 'kg' });
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('albaranesPorMes');
      expect(res.body).toHaveProperty('horasPorProyecto');
      expect(res.body).toHaveProperty('materialesPorCliente');
      expect(res.body).toHaveProperty('resumen');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/dashboard');
      expect(res.status).toBe(401);
    });
  });
});