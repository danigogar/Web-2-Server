import prisma from '../config/prisma.js';

const LOAN_DURATION_DAYS = 14;
const MAX_ACTIVE_LOANS = 3;

export async function getMyLoans(req, res, next) {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id },
      include: { book: { select: { id: true, title: true, author: true } } },
      orderBy: { loanDate: 'desc' },
    });
    res.json({ data: loans });
  } catch (error) {
    next(error);
  }
}

export async function getAllLoans(req, res, next) {
  try {
    const loans = await prisma.loan.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, book: true },
      orderBy: { loanDate: 'desc' },
    });
    res.json({ data: loans });
  } catch (error) {
    next(error);
  }
}

export async function createLoan(req, res, next) {
  try {
    const bookId = parseInt(req.params.bookId);
    const userId = req.user.id;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ error: true, message: 'Libro no encontrado' });
    if (book.available <= 0) return res.status(400).json({ error: true, message: 'No hay ejemplares disponibles' });

    const activeCount = await prisma.loan.count({ where: { userId, status: 'ACTIVE' } });
    if (activeCount >= MAX_ACTIVE_LOANS) {
      return res.status(400).json({ error: true, message: `Máximo ${MAX_ACTIVE_LOANS} préstamos activos` });
    }

    const existing = await prisma.loan.findFirst({ where: { userId, bookId, status: 'ACTIVE' } });
    if (existing) return res.status(400).json({ error: true, message: 'Ya tienes este libro prestado' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DURATION_DAYS);

    const [loan] = await prisma.$transaction([
      prisma.loan.create({ data: { userId, bookId, dueDate } }),
      prisma.book.update({ where: { id: bookId }, data: { available: { decrement: 1 } } }),
    ]);

    res.status(201).json({ message: 'Préstamo solicitado', data: loan });
  } catch (error) {
    next(error);
  }
}

export async function returnBook(req, res, next) {
  try {
    const loanId = parseInt(req.params.id);
    const userId = req.user.id;

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) return res.status(404).json({ error: true, message: 'Préstamo no encontrado' });
    if (loan.userId !== userId && req.user.role === 'USER') {
      return res.status(403).json({ error: true, message: 'No autorizado' });
    }
    if (loan.status !== 'ACTIVE') return res.status(400).json({ error: true, message: 'Ya fue devuelto' });

    const [updated] = await prisma.$transaction([
      prisma.loan.update({ where: { id: loanId }, data: { returnDate: new Date(), status: 'RETURNED' } }),
      prisma.book.update({ where: { id: loan.bookId }, data: { available: { increment: 1 } } }),
    ]);

    res.json({ message: 'Libro devuelto', data: updated });
  } catch (error) {
    next(error);
  }
}
