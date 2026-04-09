import { Router } from 'express';
import { getMyLoans, getAllLoans, createLoan, returnBook } from '../controllers/loans.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', authenticate, getMyLoans);
router.get('/all', authenticate, authorize('LIBRARIAN', 'ADMIN'), getAllLoans);
router.post('/:bookId', authenticate, createLoan);
router.put('/:id/return', authenticate, returnBook);
export default router;
