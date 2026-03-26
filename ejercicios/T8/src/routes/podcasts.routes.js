import { Router } from 'express'
import {
  getPodcasts,
  getAllPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast,
  togglePublish,
} from '../controllers/podcasts.controller.js'
import { validate, validateObjectId } from '../middleware/validate.middleware.js'
import sessionMiddleware from '../middleware/session.middleware.js'
import checkRol from '../middleware/rol.middleware.js'
import {
  validatorCreatePodcast,
  validatorUpdatePodcast,
} from '../validators/podcast.validator.js'

const router = Router()

/**
 * @openapi
 * /api/podcasts:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Listar podcasts publicados
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de podcasts publicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Podcast'
 *                 pagination:
 *                   type: object
 */
router.get('/', getPodcasts)

/**
 * @openapi
 * /api/podcasts/admin/all:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Listar todos los podcasts (solo admin)
 *     security:
 *       - BearerToken: []
 *     responses:
 *       200:
 *         description: Todos los podcasts incluidos los no publicados
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get('/admin/all', sessionMiddleware, checkRol('admin'), getAllPodcasts)

/**
 * @openapi
 * /api/podcasts/{id}:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Obtener podcast por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Podcast'
 *       404:
 *         description: Podcast no encontrado
 */
router.get('/:id', validateObjectId(), getPodcastById)

/**
 * @openapi
 * /api/podcasts:
 *   post:
 *     tags:
 *       - Podcasts
 *     summary: Crear nuevo podcast
 *     security:
 *       - BearerToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, duration]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tech con Café
 *               description:
 *                 type: string
 *                 example: Un podcast sobre tecnología moderna
 *               category:
 *                 type: string
 *                 enum: [tech, science, history, comedy, news]
 *               duration:
 *                 type: number
 *                 example: 3600
 *               episodes:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: Podcast creado
 *       401:
 *         description: No autenticado
 */
router.post('/', sessionMiddleware, validate(validatorCreatePodcast), createPodcast)

/**
 * @openapi
 * /api/podcasts/{id}:
 *   put:
 *     tags:
 *       - Podcasts
 *     summary: Actualizar podcast (solo el autor)
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Podcast'
 *     responses:
 *       200:
 *         description: Podcast actualizado
 *       403:
 *         description: Solo puedes editar tus propios podcasts
 *       404:
 *         description: Podcast no encontrado
 */
router.put(
  '/:id',
  sessionMiddleware,
  validateObjectId(),
  validate(validatorUpdatePodcast),
  updatePodcast
)

/**
 * @openapi
 * /api/podcasts/{id}:
 *   delete:
 *     tags:
 *       - Podcasts
 *     summary: Eliminar podcast (solo admin)
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast eliminado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Podcast no encontrado
 */
router.delete('/:id', sessionMiddleware, checkRol('admin'), validateObjectId(), deletePodcast)

/**
 * @openapi
 * /api/podcasts/{id}/publish:
 *   patch:
 *     tags:
 *       - Podcasts
 *     summary: Publicar o despublicar podcast (solo admin)
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de publicación actualizado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Podcast no encontrado
 */
router.patch(
  '/:id/publish',
  sessionMiddleware,
  checkRol('admin'),
  validateObjectId(),
  togglePublish
)

export default router
