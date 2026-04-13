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
