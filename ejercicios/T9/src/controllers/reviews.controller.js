import prisma from '../config/prisma.js';
import { createReviewSchema } from '../schemas/validation.js';

export async function getBookReviews(req, res, next) {
  try {
    const bookId = parseInt(req.params.bookId);
    const reviews = await prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const bookId = parseInt(req.params.bookId);
    const userId = req.user.id;
    const { rating, comment } = createReviewSchema.parse(req.body);

    const existing = await prisma.review.findUnique({ where: { userId_bookId: { userId, bookId } } });
    if (existing) return res.status(409).json({ error: true, message: 'Ya reseñaste este libro' });

    const hasRead = await prisma.loan.findFirst({ where: { userId, bookId, status: 'RETURNED' } });
    if (!hasRead) {
      return res.status(403).json({ error: true, message: 'Solo puedes reseñar libros que hayas leído' });
    }

    const review = await prisma.review.create({ data: { userId, bookId, rating, comment } });
    res.status(201).json({ message: 'Reseña creada', data: review });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: true, message: 'Datos inválidos', details: error.errors });
    }
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const reviewId = parseInt(req.params.id);
    await prisma.review.delete({ where: { id: reviewId } });
    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    next(error);
  }
}
