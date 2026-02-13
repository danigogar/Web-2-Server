import { Router } from 'express';
import todoRoutes from './todo.routes.js';

const router = Router();

router.use('/todos/', todoRoutes);


// TO DO
router.get('/', (req, res) => {
    res.json({
        mensaje: 'API de Todos v1.0',
        endpoints: {
            cursos: '/api/todos',
            health: '/health'
        }
    });
});

export default router;