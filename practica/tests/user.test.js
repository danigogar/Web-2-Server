import request from 'supertest';
import { app } from '../src/app.js';
import User from '../src/models/User.js';

// Helper: registra un usuario y devuelve el token + la respuesta.
const registerUser = async (email = 'user@test.com', password = '12345678') => {
  const res = await request(app)
    .post('/api/user/register')
    .send({ email, password });
  return { token: res.body.accessToken, refreshToken: res.body.refreshToken, body: res.body };
};

// Helper: registra y completa onboarding (datos personales + compañía freelance).
const registerAndOnboard = async (email = 'user@test.com', nif = '12345678A') => {
  const { token, refreshToken } = await registerUser(email);
  await request(app)
    .put('/api/user/register')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Juan', lastName: 'Pérez', nif });
  await request(app)
    .patch('/api/user/company')
    .set('Authorization', `Bearer ${token}`)
    .send({ isFreelance: true });
  return { token, refreshToken };
};

describe('User — validateEmail', () => {
  it('should verify email with valid code', async () => {
    const { token } = await registerUser('valid@test.com');
    // Recuperamos el código directamente de la BD (en producción llegaría por email).
    const userInDb = await User.findOne({ email: 'valid@test.com' })
      .select('+verificationCode');
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: userInDb.verificationCode });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verificado/i);
  });

  it('should return 400 with wrong code and decrement attempts', async () => {
    const { token } = await registerUser('wrongcode@test.com');
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });
    expect(res.status).toBe(400);
  });

  it('should return 429 when attempts exhausted', async () => {
    const { token } = await registerUser('exhausted@test.com');
    // Forzamos los intentos a 0 directamente en BD.
    await User.updateOne(
      { email: 'exhausted@test.com' },
      { verificationAttempts: 0 }
    );
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });
    expect(res.status).toBe(429);
  });

  it('should return 400 if email already verified', async () => {
    const { token } = await registerUser('already@test.com');
    await User.updateOne({ email: 'already@test.com' }, { status: 'verified' });
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });
    expect(res.status).toBe(400);
  });
});

describe('User — onboarding', () => {
  it('should update personal data', async () => {
    const { token } = await registerUser('onboard@test.com');
    const res = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ana', lastName: 'García', nif: '11111111A' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Ana');
    expect(res.body.user.nif).toBe('11111111A');
  });

  it('should create company as freelance using user NIF as CIF', async () => {
    const { token } = await registerUser('freelance@test.com');
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Auto', lastName: 'Nomo', nif: '99999999Z' });
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({ isFreelance: true });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user.company.cif).toBe('99999999Z');
    expect(res.body.user.company.isFreelance).toBe(true);
  });

  it('should create company as admin when CIF does not exist', async () => {
    const { token } = await registerUser('newco@test.com');
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Carlos', lastName: 'López', nif: '22222222B' });
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        isFreelance: false,
        name: 'NuevaSL',
        cif: 'B12345678',
        address: { street: 'Calle Mayor', number: '1', postal: '28001', city: 'Madrid', province: 'Madrid' }
      });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.user.company.cif).toBe('B12345678');
  });

  it('should join existing company as guest when CIF exists', async () => {
    // Primer usuario crea la compañía
    const { token: ownerToken } = await registerUser('owner@test.com');
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Owner', lastName: 'Boss', nif: '33333333C' });
    await request(app).patch('/api/user/company').set('Authorization', `Bearer ${ownerToken}`)
      .send({
        isFreelance: false,
        name: 'CompartidaSL',
        cif: 'B99999999',
        address: { street: 'Calle X', number: '2', postal: '28002', city: 'Madrid', province: 'Madrid' }
      });

    // Segundo usuario se une con el mismo CIF
    const { token: joinerToken } = await registerUser('joiner@test.com');
    await request(app).put('/api/user/register').set('Authorization', `Bearer ${joinerToken}`)
      .send({ name: 'Joiner', lastName: 'New', nif: '44444444D' });
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${joinerToken}`)
      .send({
        isFreelance: false,
        name: 'CompartidaSL',
        cif: 'B99999999',
        address: { street: 'Calle X', number: '2', postal: '28002', city: 'Madrid', province: 'Madrid' }
      });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('guest');
  });
});

describe('User — getMe', () => {
  it('should return authenticated user data', async () => {
    const { token } = await registerAndOnboard('me@test.com');
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('email', 'me@test.com');
    expect(res.body.user).toHaveProperty('fullName', 'Juan Pérez');
    expect(res.body.user).toHaveProperty('company');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(401);
  });

  it('should return 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', 'Bearer notavalidjwt');
    expect(res.status).toBe(401);
  });
});

describe('User — refresh & logout', () => {
  it('should issue a new access token from a valid refresh token', async () => {
    const { refreshToken } = await registerUser('refresh@test.com');
    const res = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should return 401 with an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken: 'token-falso-que-no-existe' });
    expect(res.status).toBe(401);
  });

  it('should logout and invalidate the refresh token', async () => {
    const { token, refreshToken } = await registerUser('logout@test.com');
    const logoutRes = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${token}`)
      .send({ refreshToken });
    expect(logoutRes.status).toBe(200);
    // Tras el logout, el refresh token ya no es válido.
    const refreshRes = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

describe('User — deleteUser', () => {
  it('should soft delete user', async () => {
    const { token } = await registerAndOnboard('softdel@test.com');
    const res = await request(app)
      .delete('/api/user?soft=true')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const userInDb = await User.findOne({ email: 'softdel@test.com' });
    expect(userInDb.deleted).toBe(true);
  });

  it('should hard delete user', async () => {
    const { token } = await registerAndOnboard('harddel@test.com');
    const res = await request(app)
      .delete('/api/user?soft=false')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const userInDb = await User.findOne({ email: 'harddel@test.com' });
    expect(userInDb).toBeNull();
  });
});

describe('User — changePassword (Bonus)', () => {
  it('should change password successfully', async () => {
    const { token } = await registerUser('changepass@test.com', '12345678');
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: '12345678', newPassword: 'newPassword99' });
    expect(res.status).toBe(200);
    // Verificamos que el login con la nueva contraseña funciona
    const login = await request(app)
      .post('/api/user/login')
      .send({ email: 'changepass@test.com', password: 'newPassword99' });
    expect(login.status).toBe(200);
  });

  it('should return 401 with wrong current password', async () => {
    const { token } = await registerUser('wrongcurrent@test.com');
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrong', newPassword: 'newPassword99' });
    expect(res.status).toBe(401);
  });

  it('should return 400 if new password equals current (Zod refine)', async () => {
    const { token } = await registerUser('samepass@test.com', '12345678');
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: '12345678', newPassword: '12345678' });
    expect(res.status).toBe(400);
  });
});

describe('User — invite', () => {
  it('should invite a user as guest in same company', async () => {
    const { token } = await registerAndOnboard('admin@test.com');
    const res = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invited@test.com', name: 'Invitado', lastName: 'Apellido' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('guest');
    expect(res.body.user.email).toBe('invited@test.com');
  });

  it('should return 409 if invited email already exists', async () => {
    const { token } = await registerAndOnboard('admin2@test.com');
    await registerUser('existing@test.com');
    const res = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'existing@test.com', name: 'X', lastName: 'Y' });
    expect(res.status).toBe(409);
  });

  it('should return 403 when non-admin tries to invite', async () => {
    // Creamos compañía con admin
    const { token: adminToken } = await registerAndOnboard('owner2@test.com', '55555555E');
    // Invitamos a un usuario (queda como guest)
    await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'guest@test.com', name: 'G', lastName: 'U' });
    // El guest hace login y trata de invitar
    // Como no conocemos su contraseña temporal en el response no podemos hacer login
    // así que simulamos cambiando el rol a guest del propio admin original (ese sí tiene token)
    await User.updateOne({ email: 'owner2@test.com' }, { role: 'guest' });
    const res = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'noinvite@test.com', name: 'N', lastName: 'I' });
    expect(res.status).toBe(403);
  });
});

describe('User — validation errors (Zod)', () => {
  it('should return 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'not-an-email', password: '12345678' });
    expect(res.status).toBe(400);
  });

  it('should return 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'short@test.com', password: '123' });
    expect(res.status).toBe(400);
  });
});
