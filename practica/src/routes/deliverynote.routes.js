/**
 * @swagger
 * components:
 *   schemas:
 *     DeliveryNote:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         format: { type: string, enum: [material, hours] }
 *         description: { type: string }
 *         workDate: { type: string, format: date }
 *         signed: { type: boolean }
 *         pdfUrl: { type: string }
 *
 * /api/deliverynote:
 *   post:
 *     summary: Crear un albarán
 *     tags: [DeliveryNote]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [format, projectId, description, workDate]
 *             properties:
 *               format: { type: string, enum: [material, hours] }
 *               projectId: { type: string }
 *               description: { type: string }
 *               workDate: { type: string, format: date }
 *               material: { type: string }
 *               quantity: { type: number }
 *               unit: { type: string }
 *               hours: { type: number }
 *               workers: { type: array, items: { type: object } }
 *     responses:
 *       201:
 *         description: Albarán creado
 *
 *   get:
 *     summary: Listar albaranes (con paginación y filtros)
 *     tags: [DeliveryNote]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10 }
 *       - name: projectId
 *         in: query
 *         schema: { type: string }
 *       - name: clientId
 *         in: query
 *         schema: { type: string }
 *       - name: format
 *         in: query
 *         schema: { type: string, enum: [material, hours] }
 *       - name: signed
 *         in: query
 *         schema: { type: boolean }
 *       - name: from
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: to
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de albaranes
 *
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [DeliveryNote]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *
 *   delete:
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     tags: [DeliveryNote]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán (subir imagen)
 *     tags: [DeliveryNote]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado
 *       400:
 *         description: Ya está firmado o error en la imagen
 *
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar PDF del albarán (requiere firma)
 *     tags: [DeliveryNote]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF del albarán
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *       400:
 *         description: Albarán no firmado
 */

import { Router } from 'express';
import { authenticate, requireCompany } from '../middleware/auth.middleware.js';
import { validateBody, validate } from '../middleware/validate.js';
import multer from 'multer';
import { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, signDeliveryNote, getDeliveryNotePDF, deleteDeliveryNote } from '../controllers/deliverynote.controller.js';
import { createDeliveryNoteSchema, listDeliveryNotesSchema } from '../validators/deliverynote.validator.js';

const router = Router();

// Configuración local de Multer para firmas
const memoryStorage = multer.memoryStorage();
const uploadSignature = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de firma no permitido. Solo JPEG, PNG o WebP'), false);
    }
  }
}).single('signature');

router.use(authenticate, requireCompany);

router.post('/', validateBody(createDeliveryNoteSchema), createDeliveryNote);
router.get('/', validate(listDeliveryNotesSchema), getDeliveryNotes);
router.get('/:id', getDeliveryNoteById);
router.get('/pdf/:id', getDeliveryNotePDF);
router.patch('/:id/sign', uploadSignature, signDeliveryNote);
router.delete('/:id', deleteDeliveryNote);

export default router;