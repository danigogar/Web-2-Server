import { Router } from 'express';
import { getBookReviews, createReview, deleteReview } from '../controllers/reviews.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/books/:bookId/reviews', getBookReviews);
router.post('/books/:bookId/reviews', authenticate, createReview);
router.delete('/reviews/:id', authenticate, deleteReview);
export default router;
