import request from 'supertest';
import { app } from '../src/app.js';

describe('Project Endpoints', () => {
  let token;
  let clientId;

  beforeEach(async () => {
    // 1. Registrar usuario
    const register = await request(app).post('/api/user/register').send({ email: 'project@test.com', password: '12345678', name: 'Project Test' });
    token = register.body.accessToken;
    
    // 2. Onboarding - Datos personales
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`).send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
    
    // 3. Onboarding - Compañía (autónomo)
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    
    // 4. Crear cliente
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

  describe('GET /api/project', () => {
    it('should list projects', async () => {
      const res = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });
  });
});

describe('Project Endpoints - Errores', () => {
  let token;
  let clientId;

  beforeEach(async () => {
    const register = await request(app).post('/api/user/register').send({ email: 'projecterror@test.com', password: '12345678', name: 'Project Error' });
    token = register.body.accessToken;
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`).send({ name: 'Juan', lastName: 'Pérez', nif: '12345678A' });
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`).send({ isFreelance: true });
    
    const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`).send({ name: 'Cliente Error', cif: 'E12345678' });
    clientId = client.body.client._id;
  });

  it('should return 404 for non-existent project', async () => {
    const res = await request(app)
      .get('/api/project/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('should return 409 for duplicate project code', async () => {
    await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId, name: 'Proyecto Duplicado', projectCode: 'DUP001' });
    const res = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId, name: 'Proyecto Duplicado 2', projectCode: 'DUP001' });
    expect(res.status).toBe(409);
  });

  it('should update project', async () => {
    const project = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId, name: 'Update Test', projectCode: 'UPD001' });
    const projectId = project.body.project._id;
    
    const updateRes = await request(app).put(`/api/project/${projectId}`).set('Authorization', `Bearer ${token}`).send({ name: 'Update Test Modificado' });
    expect(updateRes.status).toBe(200);
  });

  it('should archive and restore project', async () => {
    const project = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`).send({ clientId, name: 'Proyecto Archivar', projectCode: 'ARC001' });
    const projectId = project.body.project._id;
    
    const archiveRes = await request(app).delete(`/api/project/${projectId}?soft=true`).set('Authorization', `Bearer ${token}`);
    expect(archiveRes.status).toBe(200);
    
    const restoreRes = await request(app).patch(`/api/project/${projectId}/restore`).set('Authorization', `Bearer ${token}`);
    expect(restoreRes.status).toBe(200);
  });
});