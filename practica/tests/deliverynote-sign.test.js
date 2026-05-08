/**
 * Tests para signDeliveryNote y deleteDeliveryNote sobre albaranes firmados.
 *
 * Mockeamos `uploadSignature` y `uploadPDF` de storage.service.js porque
 * dependen de Cloudinary (servicio externo). Los mocks se declaran con
 * `jest.unstable_mockModule` ANTES de importar la app, que es la forma
 * estándar de mockear módulos ESM con Jest en --experimental-vm-modules.
 */
import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Mock del módulo storage ANTES de importar la app
jest.unstable_mockModule('../src/services/storage.service.js', () => ({
  uploadSignature: jest.fn(async (buffer, companyId, deliveryNoteId) => ({
    url: `https://fake.cloudinary.test/${companyId}/signatures/${deliveryNoteId}.webp`,
    publicId: `bildyapp/${companyId}/signatures/signature_${deliveryNoteId}`
  })),
  uploadPDF: jest.fn(async (buffer, companyId, deliveryNoteId) => ({
    url: `https://fake.cloudinary.test/${companyId}/pdfs/${deliveryNoteId}.pdf`,
    publicId: `bildyapp/${companyId}/pdfs/deliverynote_${deliveryNoteId}`
  }))
}));

// 2. También mockeamos pdf.service para no depender de pdfkit + fetch a la firma.
jest.unstable_mockModule('../src/services/pdf.service.js', () => ({
  generateDeliveryNotePDF: jest.fn(async () => Buffer.from('fake-pdf-bytes'))
}));

// 3. Importamos la app DESPUÉS de declarar los mocks
const { app } = await import('../src/app.js');
const { uploadSignature, uploadPDF } = await import('../src/services/storage.service.js');

// Helper: registra usuario freelance con cliente y proyecto, devuelve token + ids.
const setupUserWithProject = async (email = 'sign@test.com') => {
  const reg = await request(app).post('/api/user/register')
    .send({ email, password: '12345678' });
  const token = reg.body.accessToken;

  await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Sign', lastName: 'User', nif: '12345678A' });
  await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`)
    .send({ isFreelance: true });

  const client = await request(app).post('/api/client').set('Authorization', `Bearer ${token}`)
    .send({ name: 'Cliente Sign', cif: 'B12345678' });
  const project = await request(app).post('/api/project').set('Authorization', `Bearer ${token}`)
    .send({ clientId: client.body.client._id, name: 'Proyecto Sign', projectCode: 'SIGN001' });

  return { token, projectId: project.body.project._id, clientId: client.body.client._id };
};

const fakeImageBuffer = () => Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('signDeliveryNote — flujo de firma', () => {
  let token, projectId, deliveryNoteId;

  beforeEach(async () => {
    uploadSignature.mockClear();
    uploadPDF.mockClear();
    const setup = await setupUserWithProject('sign@test.com');
    token = setup.token;
    projectId = setup.projectId;

    const created = await request(app).post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        format: 'material',
        projectId,
        description: 'Albarán para firmar',
        workDate: new Date(),
        material: 'Cemento',
        quantity: 5,
        unit: 'kg'
      });
    deliveryNoteId = created.body.deliveryNote._id;
  });

  it('firma un albarán correctamente y deja signed: true', async () => {
    const res = await request(app)
      .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', fakeImageBuffer(), { filename: 'firma.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('signatureUrl');
    expect(res.body).toHaveProperty('pdfUrl');
    expect(res.body.signatureUrl).toMatch(/fake\.cloudinary\.test/);
    expect(uploadSignature).toHaveBeenCalledTimes(1);
    expect(uploadPDF).toHaveBeenCalledTimes(1);

    // Verificamos persistencia del flag signed
    const fetched = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.deliveryNote.signed).toBe(true);
    expect(fetched.body.deliveryNote.signatureUrl).toMatch(/fake\.cloudinary\.test/);
  });

  it('intentar firmar un albarán ya firmado devuelve 400', async () => {
    // Primera firma
    await request(app)
      .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', fakeImageBuffer(), { filename: 'firma.png', contentType: 'image/png' });

    // Segunda firma sobre el mismo albarán
    const res = await request(app)
      .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', fakeImageBuffer(), { filename: 'firma2.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/firmado/i);
    // El mock NO debe haberse llamado una segunda vez (uploadSignature: 1 sola vez total)
    expect(uploadSignature).toHaveBeenCalledTimes(1);
  });

  it('intentar borrar un albarán firmado devuelve 403', async () => {
    // Primero firmamos
    await request(app)
      .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', fakeImageBuffer(), { filename: 'firma.png', contentType: 'image/png' });

    // Intentamos borrar
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
    expect(res.body.message).toMatch(/firmado/i);

    // El albarán SIGUE existiendo en BD
    const stillThere = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(stillThere.status).toBe(200);
    expect(stillThere.body.deliveryNote.signed).toBe(true);
  });
});