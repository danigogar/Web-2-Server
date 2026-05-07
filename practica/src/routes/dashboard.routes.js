/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardResponse:
 *       type: object
 *       properties:
 *         albaranesPorMes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: object
 *                 properties:
 *                   year: { type: number }
 *                   month: { type: number }
 *               count: { type: number }
 *               totalMateriales: { type: number }
 *               totalHoras: { type: number }
 *         horasPorProyecto:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               projectName: { type: string }
 *               totalHoras: { type: number }
 *         materialesPorCliente:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               clientName: { type: string }
 *               totalMateriales: { type: number }
 *               unidades: { type: array, items: { type: string } }
 *         resumen:
 *           type: object
 *           properties:
 *             totalAlbaranes: { type: number }
 *             totalMateriales: { type: number }
 *             totalHorasRegistradas: { type: number }
 *
 * /api/dashboard:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     tags: [Dashboard]
 *     security: [{ BearerToken: [] }]
 *     responses:
 *       200:
 *         description: Estadísticas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */

import { Router } from 'express';
import DeliveryNote from '../models/DeliveryNote.js';
import { authenticate, requireCompany } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireCompany);

router.get('/', async (req, res, next) => {
  try {
    const companyId = req.user.company._id;

    // 1. Albaranes por mes
    const albaranesPorMes = await DeliveryNote.aggregate([
      { $match: { company: companyId, deleted: false } },
      {
        $group: {
          _id: { year: { $year: '$workDate' }, month: { $month: '$workDate' } },
          count: { $sum: 1 },
          totalMateriales: { $sum: { $cond: [{ $eq: ['$format', 'material'] }, 1, 0] } },
          totalHoras: { $sum: { $cond: [{ $eq: ['$format', 'hours'] }, { $ifNull: ['$hours', 0] }, 0] } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // 2. Horas totales por proyecto
    const horasPorProyecto = await DeliveryNote.aggregate([
      { $match: { company: companyId, deleted: false, format: 'hours' } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      { $unwind: '$projectInfo' },
      {
        $group: {
          _id: '$project',
          projectName: { $first: '$projectInfo.name' },
          totalHoras: { $sum: { $ifNull: ['$hours', 0] } }
        }
      },
      { $sort: { totalHoras: -1 } },
      { $limit: 10 }
    ]);

    // 3. Materiales por cliente
    const materialesPorCliente = await DeliveryNote.aggregate([
      { $match: { company: companyId, deleted: false, format: 'material' } },
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      { $unwind: '$clientInfo' },
      {
        $group: {
          _id: '$client',
          clientName: { $first: '$clientInfo.name' },
          totalMateriales: { $sum: '$quantity' },
          unidades: { $addToSet: '$unit' }
        }
      },
      { $sort: { totalMateriales: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      albaranesPorMes,
      horasPorProyecto,
      materialesPorCliente,
      resumen: {
        totalAlbaranes: await DeliveryNote.countDocuments({ company: companyId, deleted: false }),
        totalMateriales: await DeliveryNote.countDocuments({ company: companyId, deleted: false, format: 'material' }),
        totalHorasRegistradas: horasPorProyecto.reduce((acc, p) => acc + p.totalHoras, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;