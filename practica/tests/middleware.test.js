import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { sanitizeBodyOnly } from '../src/middleware/sanitize.js';
import { errorHandler } from '../src/middleware/error-handler.js';
import { notificationService } from '../src/services/notification.service.js';
import { AppError } from '../src/utils/AppError.js';

describe('Middleware — sanitizeBodyOnly', () => {
  it('removes $-prefixed keys from body', () => {
    const req = { body: { $where: 'malicious', name: 'ok', nested: { $gt: 1, valid: 'x' } } };
    const next = jest.fn();
    sanitizeBodyOnly(req, {}, next);
    expect(req.body.$where).toBeUndefined();
    expect(req.body.nested.$gt).toBeUndefined();
    expect(req.body.name).toBe('ok');
    expect(req.body.nested.valid).toBe('x');
    expect(next).toHaveBeenCalled();
  });

  it('does nothing when there is no body', () => {
    const req = {};
    const next = jest.fn();
    sanitizeBodyOnly(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('Middleware — 404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/this/does/not/exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', true);
  });
});

describe('Middleware — errorHandler edge cases (integration)', () => {
  it('returns 400 for invalid ObjectId (CastError)', async () => {
    // Hacemos login como usuario freelance y consultamos un cliente con ID inválido.
    const reg = await request(app)
      .post('/api/user/register')
      .send({ email: 'cast@test.com', password: '12345678' });
    const token = reg.body.accessToken;
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`)
      .send({ name: 'C', lastName: 'T', nif: '11111111A' });
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${token}`)
      .send({ isFreelance: true });

    const res = await request(app)
      .get('/api/client/no-es-un-objectid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

// Helper para invocar el errorHandler directamente con res mock.
const runErrorHandler = async (err) => {
  const req = { method: 'GET', originalUrl: '/test', ip: '127.0.0.1' };
  const next = jest.fn();
  let status = null;
  let body = null;
  const res = {
    status: (code) => { status = code; return res; },
    json: (b) => { body = b; return res; }
  };
  await errorHandler(err, req, res, next);
  return { status, body };
};

describe('Middleware — errorHandler unit (ramas no operacionales)', () => {
  it('handles Mongoose ValidationError → 400 con details', async () => {
    const err = new mongoose.Error.ValidationError();
    err.errors = {
      name: { path: 'name', message: 'Es requerido' },
      cif:  { path: 'cif',  message: 'Inválido' }
    };
    const { status, body } = await runErrorHandler(err);
    expect(status).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details).toHaveLength(2);
  });

  it('handles Mongoose CastError → 400', async () => {
    const err = new mongoose.Error.CastError('ObjectId', 'badvalue', 'foo');
    const { status, body } = await runErrorHandler(err);
    expect(status).toBe(400);
    expect(body.code).toBe('CAST_ERROR');
  });

  it('handles Mongoose duplicate key error (E11000) → 409', async () => {
    const err = Object.assign(new Error('dup'), {
      code: 11000,
      keyPattern: { email: 1 }
    });
    const { status, body } = await runErrorHandler(err);
    expect(status).toBe(409);
    expect(body.code).toBe('DUPLICATE_KEY');
  });

  it('handles unexpected error → 500', async () => {
    const err = new Error('boom');
    const { status, body } = await runErrorHandler(err);
    expect(status).toBe(500);
    expect(body.code).toBe('INTERNAL_ERROR');
  });

  it('returns operational AppError as-is', async () => {
    const err = AppError.forbidden('no entrar', 'NO_ENTRY');
    const { status, body } = await runErrorHandler(err);
    expect(status).toBe(403);
    expect(body.code).toBe('NO_ENTRY');
    expect(body.message).toBe('no entrar');
  });
});

describe('Middleware — auth roles', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/api/client');
    expect(res.status).toBe(401);
  });

  it('returns 401 with non-Bearer Authorization', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', 'NotBearer xyz');
    expect(res.status).toBe(401);
  });
});

describe('Health endpoint', () => {
  it('returns ok status with db state', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('NotificationService — emisión con io', () => {
  // Limpiamos el io al final para no contaminar otros tests.
  afterEach(() => notificationService.setIo(null));

  it('emite a la sala de la compañía cuando hay io configurado', () => {
    const emitMock = jest.fn();
    const toMock = jest.fn(() => ({ emit: emitMock }));
    const ioMock = { to: toMock };
    notificationService.setIo(ioMock);

    notificationService.emitClientCreated({ name: 'X', _id: '1' }, 'company123');

    expect(toMock).toHaveBeenCalledWith('company:company123');
    expect(emitMock).toHaveBeenCalledWith('client:new', expect.objectContaining({ name: 'X' }));
  });

  it('no falla cuando no hay io (rama else)', () => {
    notificationService.setIo(null);
    expect(() => {
      notificationService.emitProjectCreated({ name: 'P', _id: '2' }, 'companyXYZ');
      notificationService.emitDeliveryNoteCreated({ _id: '3', format: 'material' }, 'companyXYZ');
      notificationService.emitDeliveryNoteSigned({ _id: '4' }, 'companyXYZ');
    }).not.toThrow();
  });
});