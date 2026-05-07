import { AppError } from '../src/utils/AppError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  storeRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} from '../src/utils/jwt.js';

describe('AppError', () => {
  it('badRequest sets statusCode 400 and operational flag', () => {
    const err = AppError.badRequest('msg');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.isOperational).toBe(true);
    expect(err.message).toBe('msg');
  });

  it('badRequest with defaults', () => {
    const err = AppError.badRequest();
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Solicitud inválida');
  });

  it('badRequest with custom code', () => {
    const err = AppError.badRequest('msg', 'CUSTOM_CODE');
    expect(err.code).toBe('CUSTOM_CODE');
  });

  it('unauthorized sets statusCode 401', () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('unauthorized with custom message and code', () => {
    const err = AppError.unauthorized('no auth', 'TOKEN_BAD');
    expect(err.message).toBe('no auth');
    expect(err.code).toBe('TOKEN_BAD');
  });

  it('forbidden sets statusCode 403', () => {
    const err = AppError.forbidden('no');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('forbidden with defaults', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Acceso prohibido');
  });

  it('notFound formats the resource name', () => {
    const err = AppError.notFound('Cliente');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Cliente no encontrado');
  });

  it('notFound with defaults', () => {
    const err = AppError.notFound();
    expect(err.message).toBe('Recurso no encontrado');
  });

  it('conflict sets statusCode 409', () => {
    const err = AppError.conflict('dup');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('conflict with defaults', () => {
    const err = AppError.conflict();
    expect(err.message).toBe('Conflicto con recurso existente');
  });

  it('tooManyRequests sets statusCode 429', () => {
    const err = AppError.tooManyRequests();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT');
  });

  it('tooManyRequests with custom message', () => {
    const err = AppError.tooManyRequests('slow down', 'SLOW');
    expect(err.message).toBe('slow down');
  });

  it('internal sets statusCode 500', () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
  });

  it('internal with custom args', () => {
    const err = AppError.internal('boom', 'X');
    expect(err.message).toBe('boom');
    expect(err.code).toBe('X');
  });

  it('default constructor uses 500', () => {
    const err = new AppError('boom');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  it('constructor with all params', () => {
    const err = new AppError('msg', 418, 'TEAPOT');
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('TEAPOT');
  });
});

describe('jwt utils', () => {
  const fakeUser = { _id: '507f1f77bcf86cd799439011', email: 'jwt@test.com', role: 'admin' };

  it('generateAccessToken + verifyAccessToken roundtrip', () => {
    const token = generateAccessToken(fakeUser);
    const decoded = verifyAccessToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe(fakeUser._id);
    expect(decoded.email).toBe(fakeUser.email);
  });

  it('verifyAccessToken returns null for invalid token', () => {
    expect(verifyAccessToken('not-a-token')).toBeNull();
  });

  it('generateRefreshToken returns hex string', () => {
    const token = generateRefreshToken();
    expect(typeof token).toBe('string');
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('store + get + revoke refresh token works', () => {
    const token = generateRefreshToken();
    const expires = new Date(Date.now() + 60_000);
    storeRefreshToken('user1', token, expires);
    const data = getRefreshToken(token);
    expect(data).not.toBeNull();
    expect(data.userId).toBe('user1');

    revokeRefreshToken(token);
    expect(getRefreshToken(token)).toBeNull();
  });

  it('expired refresh token returns null', () => {
    const token = generateRefreshToken();
    const expired = new Date(Date.now() - 1000);
    storeRefreshToken('user2', token, expired);
    expect(getRefreshToken(token)).toBeNull();
  });

  it('getRefreshToken returns null for unknown token', () => {
    expect(getRefreshToken('token-que-nunca-se-guardo')).toBeNull();
  });

  it('revokeAllUserTokens removes every token of that user', () => {
    const t1 = generateRefreshToken();
    const t2 = generateRefreshToken();
    const t3 = generateRefreshToken();
    const future = new Date(Date.now() + 60_000);
    storeRefreshToken('userA', t1, future);
    storeRefreshToken('userA', t2, future);
    storeRefreshToken('userB', t3, future);

    revokeAllUserTokens('userA');
    expect(getRefreshToken(t1)).toBeNull();
    expect(getRefreshToken(t2)).toBeNull();
    expect(getRefreshToken(t3)).not.toBeNull();
  });
});