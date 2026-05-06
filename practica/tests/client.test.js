import request from 'supertest';
import { app } from '../src/app.js';

describe('Client Endpoints', () => {
  let token;
  let companyId;

  beforeEach(async () => {
    const register = await request(app).post('/api/user/register').send({ email: 'client@test.com', password: '12345678', name: 'Client Test' });
    token = register.body.token;
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
});
