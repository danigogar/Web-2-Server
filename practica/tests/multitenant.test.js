/**
 * Tests de aislamiento multi-tenant y de exposición de recursos archivados.
 *
 * Verifican dos reglas de seguridad críticas en una API multi-empresa:
 *
 *   1. Un usuario de la compañía B no puede acceder a recursos (clientes,
 *      proyectos, albaranes) de la compañía A. La respuesta correcta es 404,
 *      no 403, porque para B el recurso "no existe" — no debe siquiera filtrar
 *      la información de su existencia.
 *
 *   2. Un cliente archivado (soft delete con `deleted: true`) no debe
 *      devolverse en GET /api/client/:id. El acceso a archivados va
 *      por GET /api/client/archived.
 */
import request from 'supertest';
import { app } from '../src/app.js';

// Helper: crea un usuario freelance con su propia compañía + un cliente.
// Devuelve el token y el ID del cliente recién creado.
const setupCompanyWithClient = async (email, nif, cif) => {
  const reg = await request(app).post('/api/user/register')
    .send({ email, password: '12345678' });
  const token = reg.body.accessToken;

  await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Owner', lastName: 'Tester', nif });
  await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`)
    .send({ isFreelance: true });

  const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`)
    .send({ name: `Cliente de ${email}`, cif });

  return { token, clientId: client.body.client._id };
};

describe('Aislamiento multi-tenant — acceso cruzado entre compañías', () => {
  it('GET /api/client/:id de otra compañía devuelve 404', async () => {
    // Compañía A crea un cliente
    const compA = await setupCompanyWithClient('userA@test.com', '11111111A', 'BAA000001');
    // Compañía B (independiente)
    const compB = await setupCompanyWithClient('userB@test.com', '22222222B', 'BBB000002');

    // El usuario B intenta acceder al cliente de A por ID
    const res = await request(app)
      .get(`/api/client/${compA.clientId}`)
      .set('Authorization', `Bearer ${compB.token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('PUT /api/client/:id de otra compañía devuelve 404', async () => {
    const compA = await setupCompanyWithClient('updatorA@test.com', '33333333C', 'BAA000003');
    const compB = await setupCompanyWithClient('updatorB@test.com', '44444444D', 'BBB000004');

    const res = await request(app)
      .put(`/api/client/${compA.clientId}`)
      .set('Authorization', `Bearer ${compB.token}`)
      .send({ name: 'No deberías poder editarme' });

    expect(res.status).toBe(404);
  });

  it('DELETE /api/client/:id de otra compañía devuelve 404', async () => {
    const compA = await setupCompanyWithClient('deleterA@test.com', '55555555E', 'BAA000005');
    const compB = await setupCompanyWithClient('deleterB@test.com', '66666666F', 'BBB000006');

    const res = await request(app)
      .delete(`/api/client/${compA.clientId}`)
      .set('Authorization', `Bearer ${compB.token}`);

    expect(res.status).toBe(404);

    // Verificamos que el cliente sigue intacto en la compañía A
    const stillThere = await request(app)
      .get(`/api/client/${compA.clientId}`)
      .set('Authorization', `Bearer ${compA.token}`);
    expect(stillThere.status).toBe(200);
  });
});

describe('getClientById — clientes archivados (deleted: true)', () => {
  it('un cliente archivado no se devuelve por GET /api/client/:id', async () => {
    const { token, clientId } = await setupCompanyWithClient(
      'archived@test.com', '77777777G', 'BAR000007'
    );

    // Confirmamos que existe antes de archivar
    const before = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(before.status).toBe(200);

    // Archivar (soft delete)
    const archive = await request(app)
      .delete(`/api/client/${clientId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);
    expect(archive.status).toBe(200);

    // Tras archivar, el GET por ID directo debe devolver 404
    const after = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(404);
    expect(after.body.code).toBe('NOT_FOUND');

    // Pero sí aparece en el listado de archivados
    const archived = await request(app)
      .get('/api/client/archived')
      .set('Authorization', `Bearer ${token}`);
    expect(archived.status).toBe(200);
    expect(archived.body.clients.some(c => c._id === clientId)).toBe(true);
  });
});