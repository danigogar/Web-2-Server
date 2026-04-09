import prisma from '../config/prisma.js';
import { createBookSchema, bookQuerySchema } from '../schemas/validation.js';

export async function getBooks(req, res, next) {
  try {
    const { genre, author, title, page, limit } = bookQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;
    const where = {};
    if (genre) where.genre = { contains: genre, mode: 'insensitive' };
    if (author) where.author = { contains: author, mode: 'insensitive' };
    if (title) where.title = { contains: title, mode: 'insensitive' };

    const [books, total] = await Promise.all([
      prisma.book.findMany({ where, skip, take: limit, orderBy: { title: 'asc' } }),
      prisma.book.count({ where }),
    ]);

    res.json({ data: books, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: true, message: 'Parámetros inválidos' });
    }
    next(error);
  }
}

export async function getBookById(req, res, next) {
  try {
    const book = await prisma.book.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!book) return res.status(404).json({ error: true, message: 'Libro no encontrado' });
    res.json({ data: book });
  } catch (error) {
    next(error);
  }
}

export async function createBook(req, res, next) {
  try {
    const data = createBookSchema.parse(req.body);
    const book = await prisma.book.create({ data: { ...data, available: data.copies } });
    res.status(201).json({ message: 'Libro creado', data: book });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: true, message: 'Datos inválidos', details: error.errors });
    }
    next(error);
  }
}

export async function updateBook(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: true, message: 'Libro no encontrado' });

    const { copies, ...rest } = req.body;
    const updateData = { ...rest };
    if (copies !== undefined) {
      const diff = copies - existing.copies;
      updateData.copies = copies;
      updateData.available = existing.available + diff;
    }

    const book = await prisma.book.update({ where: { id }, data: updateData });
    res.json({ message: 'Libro actualizado', data: book });
  } catch (error) {
    next(error);
  }
}

export async function deleteBook(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await prisma.book.delete({ where: { id } });
    res.json({ message: 'Libro eliminado' });
  } catch (error) {
    next(error);
  }
}
