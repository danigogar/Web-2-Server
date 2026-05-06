import request from 'supertest';
import { app } from '../src/app.js';

describe('Auth Endpoints', () => {
  describe('POST /api/user/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({ email: 'test@test.com', password: '12345678', name: 'Test' });
      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('email', 'test@test.com');
    });
  });

  describe('POST /api/user/login', () => {
    it('should login with valid credentials', async () => {
      await request(app).post('/api/user/register').send({ email: 'test@test.com', password: '12345678', name: 'Test' });
      const res = await request(app).post('/api/user/login').send({ email: 'test@test.com', password: '12345678' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
