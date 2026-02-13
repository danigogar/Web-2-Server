import { Router } from 'express';
import * as todoController from '../controllers/todo.controller.js';
import { validate } from '../middleware/validateRequest.js';
import { createTodoSchema, updateTodoSchema, todoIdSchema, queryFiltersSchema } from '../schemas/todo.schema.js';

const router = Router();

router.get('/', todoController.getAll);
router.get('/:id', todoController.getById);
router.post('/', validate(createTodoSchema), todoController.create);
router.put('/:id', validate(updateTodoSchema), todoController.update);
router.patch('/:id/toggle', validate(todoIdSchema), todoController.toggle);
router.delete('/:id', todoController.remove);

export default router;