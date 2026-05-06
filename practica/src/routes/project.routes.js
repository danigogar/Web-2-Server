/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         projectCode: { type: string }
 *         client: { type: string }
 *         active: { type: boolean }
 *         notes: { type: string }
 *
 * /api/project:
 *   post:
 *     summary: Crear un proyecto
 *     tags: [Project]
 *     security: [{ BearerToken: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, name, projectCode]
 *             properties:
 *               clientId: { type: string }
 *               name: { type: string }
 *               projectCode: { type: string }
 *               active: { type: boolean, default: true }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Proyecto creado
 *       409:
 *         description: Código de proyecto ya existe
 *
 *   get:
 *     summary: Listar proyectos (con paginación)
 *     tags: [Project]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10 }
 *       - name: clientId
 *         in: query
 *         schema: { type: string }
 *       - name: name
 *         in: query
 *         schema: { type: string }
 *       - name: active
 *         in: query
 *         schema: { type: boolean }
 *       - name: archived
 *         in: query
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *
 * /api/project/archived:
 *   get:
 *     summary: Listar proyectos archivados
 *     tags: [Project]
 *     security: [{ BearerToken: [] }]
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 *
 * /api/project/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Project]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Project]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *
 *   delete:
 *     summary: Eliminar un proyecto (soft/hard)
 *     tags: [Project]
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
 *         description: Proyecto eliminado/archivado
 *
 * /api/project/{id}/restore:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Project]
 *     security: [{ BearerToken: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto restaurado
 */

import { Router } from 'express';
import { authenticate, requireCompany } from '../middleware/auth.middleware.js';
import { validateBody, validate } from '../middleware/validate.js';
import { createProject, updateProject, getProjects, getProjectById, deleteProject, restoreProject, getArchivedProjects } from '../controllers/project.controller.js';
import { createProjectSchema, updateProjectSchema, listProjectsSchema } from '../validators/project.validator.js';

const router = Router();

router.use(authenticate, requireCompany);

router.post('/', validateBody(createProjectSchema), createProject);
router.put('/:id', validateBody(updateProjectSchema), updateProject);
router.get('/', validate(listProjectsSchema), getProjects);
router.get('/archived', getArchivedProjects);
router.get('/:id', getProjectById);
router.delete('/:id', deleteProject);
router.patch('/:id/restore', restoreProject);

export default router;
