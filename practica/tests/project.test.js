import request from 'supertest';
import { app } from '../src/app.js';

describe('Project Endpoints', () => {
  let token;
  let clientId;

  beforeEach(async () => {
    const register = await request(app).post('/api/user/register').send({ email: 'project@test.com', password: '12345678', name: 'Project Test' });
    token = register.body.token;
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente Test', cif: 'B12345678' });
    clientId = client.body.client._id;
  });

  describe('POST /api/project', () => {
    it('should create a new project', async () => {
      const res = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId, name: 'Proyecto Test', projectCode: 'TEST001' });
      expect(res.status).toBe(201);
      expect(res.body.project).toHaveProperty('name', 'Proyecto Test');
    });
  });
});
