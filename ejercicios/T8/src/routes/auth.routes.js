import { Router } from 'express'
import { register, login, getMe, changePassword } from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import sessionMiddleware from '../middleware/session.middleware.js'
import {
  validatorRegister,
  validatorLogin,
  validatorChangePassword,
} from '../validators/auth.validator.js'

const router = Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: MiPassword123
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos inválidos o email duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validate(validatorRegister), register)

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: MiPassword123
 *     responses:
 *       201:
 *         description: Login correcto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(validatorLogin), login)

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Obtener perfil del usuario autenticado
 *     security:
 *       - BearerToken: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', sessionMiddleware, getMe)

/**
 * @openapi
 * /api/auth/change-password:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Cambiar contraseña (BONUS)
 *     security:
 *       - BearerToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: MiPassword123
 *               newPassword:
 *                 type: string
 *                 example: NuevaPassword456
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.patch(
  '/change-password',
  sessionMiddleware,
  validate(validatorChangePassword),
  changePassword
)

export default router
