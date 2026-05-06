/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         email: { type: string }
 *         name: { type: string }
 *         lastName: { type: string }
 *         fullName: { type: string }
 *         nif: { type: string }
 *         role: { type: string, enum: [admin, guest] }
 *         status: { type: string, enum: [pending, verified] }
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user: { $ref: '#/components/schemas/User' }
 *         accessToken: { type: string }
 *         refreshToken: { type: string }
 *     Error:
 *       type: object
 *       properties:
 *         error: { type: boolean }
 *         message: { type: string }
 *         code: { type: string }
 *
 * /api/user/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401:
 *         description: Credenciales inválidas
 *
 * /api/user/validation:
 *   put:
 *     summary: Validar email con código
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, minLength: 6, maxLength: 6 }
 *     responses:
 *       200:
 *         description: Email verificado
 *       400:
 *         description: Código incorrecto
 *       429:
 *         description: Demasiados intentos
 *
 * /api/user:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *   put:
 *     summary: Actualizar datos personales (onboarding)
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lastName, nif]
 *             properties:
 *               name: { type: string }
 *               lastName: { type: string }
 *               nif: { type: string }
 *     responses:
 *       200:
 *         description: Datos actualizados
 *   delete:
 *     summary: Eliminar usuario (soft/hard)
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: soft
 *         in: query
 *         schema: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *
 * /api/user/company:
 *   patch:
 *     summary: Crear/actualizar compañía (onboarding)
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isFreelance: { type: boolean }
 *               name: { type: string }
 *               cif: { type: string }
 *               address: { type: object }
 *     responses:
 *       200:
 *         description: Compañía actualizada
 *
 * /api/user/logo:
 *   patch:
 *     summary: Subir logo de la compañía
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo subido
 *
 * /api/user/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nuevo access token
 *       401:
 *         description: Refresh token inválido
 *
 * /api/user/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 *
 * /api/user/password:
 *   put:
 *     summary: Cambiar contraseña (Bonus)
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *
 * /api/user/invite:
 *   post:
 *     summary: Invitar compañero (solo admin)
 *     tags: [User]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: Usuario invitado
 */

import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, requireRole, requireVerified, requireCompany } from '../middleware/auth.middleware.js';
import { validateBody, validate } from '../middleware/validate.js';
import { uploadLogo, handleUploadError } from '../middleware/upload.js';
import {
  registerSchema,
  validationSchema,
  loginSchema,
  personalDataSchema,
  companySchema,
  changePasswordSchema,
  inviteSchema,
  refreshTokenSchema,
  deleteUserSchema
} from '../validators/user.validator.js';

const router = Router();

// Rutas públicas
router.post('/register', validateBody(registerSchema), userController.register);
router.post('/login', validateBody(loginSchema), userController.login);
router.post('/refresh', validateBody(refreshTokenSchema), userController.refreshToken);

// Rutas protegidas (requieren autenticación)
router.put('/validation', authenticate, validateBody(validationSchema), userController.validateEmail);
router.put('/register', authenticate, validateBody(personalDataSchema), userController.updatePersonalData);
router.patch('/company', authenticate, validateBody(companySchema), userController.updateCompany);
router.patch('/logo', authenticate, requireCompany, (req, res, next) => {
  uploadLogo(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, userController.uploadLogo);
router.get('/', authenticate, userController.getMe);
router.post('/logout', authenticate, userController.logout);
router.delete('/', authenticate, validate(deleteUserSchema), userController.deleteUser);
router.put('/password', authenticate, validateBody(changePasswordSchema), userController.changePassword);
router.post('/invite', authenticate, requireRole('admin'), requireCompany, validateBody(inviteSchema), userController.inviteUser);

export default router;
