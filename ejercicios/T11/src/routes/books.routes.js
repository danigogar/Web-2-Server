import { Router } from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/books.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', authenticate, authorize('LIBRARIAN', 'ADMIN'), createBook);
router.put('/:id', authenticate, authorize('LIBRARIAN', 'ADMIN'), updateBook);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBook);
export default router;
