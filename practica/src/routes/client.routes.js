/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         cif: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         address: { type: object }
 *         deleted: { type: boolean }
 *
 * /api/client:
 *   post:
 *     summary: Crear un cliente
 *     tags: [Client]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif]
 *             properties:
 *               name: { type: string }
 *               cif: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               address: { type: object }
 *     responses:
 *       201:
 *         description: Cliente creado
 *       409:
 *         description: CIF ya existe
 *
 *   get:
 *     summary: Listar clientes (con paginación)
 *     tags: [Client]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10 }
 *       - name: name
 *         in: query
 *         schema: { type: string }
 *       - name: archived
 *         in: query
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Lista de clientes
 *
 * /api/client/archived:
 *   get:
 *     summary: Listar clientes archivados
 *     tags: [Client]
 *     security: [{ BearerToken: [] }]
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 *
 * /api/client/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Client]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 *
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Client]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               cif: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *
 *   delete:
 *     summary: Eliminar un cliente (soft/hard)
 *     tags: [Client]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: soft
 *         in: query
 *         schema: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Cliente eliminado/archivado
 *
 * /api/client/{id}/restore:
 *   patch:
 *     summary: Restaurar un cliente archivado
 *     tags: [Client]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente restaurado
 */

import { Router } from 'express';
import { authenticate, requireCompany } from '../middleware/auth.middleware.js';
import { validateBody, validate } from '../middleware/validate.js';
import { createClient, updateClient, getClients, getClientById, deleteClient, restoreClient, getArchivedClients } from '../controllers/client.controller.js';
import { createClientSchema, updateClientSchema, listClientsSchema } from '../validators/client.validator.js';

const router = Router();

router.use(authenticate, requireCompany);

router.post('/', validateBody(createClientSchema), createClient);
router.put('/:id', validateBody(updateClientSchema), updateClient);
router.get('/', validate(listClientsSchema), getClients);
router.get('/archived', getArchivedClients);
router.get('/:id', getClientById);
router.delete('/:id', deleteClient);
router.patch('/:id/restore', restoreClient);

export default router;
