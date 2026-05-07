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
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/user/login', () => {
    it('should login with valid credentials', async () => {
      await request(app).post('/api/user/register').send({ email: 'test@test.com', password: '12345678', name: 'Test' });
      const res = await request(app).post('/api/user/login').send({ email: 'test@test.com', password: '12345678' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});

describe('Auth Endpoints - Errores', () => {
  it('should return 409 when registering with existing email', async () => {
    await request(app).post('/api/user/register').send({ email: 'exists@test.com', password: '12345678', name: 'Exists' });
    const res = await request(app).post('/api/user/register').send({ email: 'exists@test.com', password: '12345678', name: 'Exists2' });
    expect(res.status).toBe(409);
  });

  it('should return 401 for invalid password', async () => {
    await request(app).post('/api/user/register').send({ email: 'loginfail@test.com', password: '12345678', name: 'LoginFail' });
    const res = await request(app).post('/api/user/login').send({ email: 'loginfail@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should return 401 for non-existent user login', async () => {
    const res = await request(app).post('/api/user/login').send({ email: 'nonexistent@test.com', password: '12345678' });
    expect(res.status).toBe(401);
  });
});