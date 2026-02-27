import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import Storage from '../models/storage.model.js';
import { handleHttpError } from '../utils/handleError.js';

const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';

// POST /api/storage
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return handleHttpError(res, 'No se subió ningún archivo', 400);
    }

    const { filename, originalname, mimetype, size } = req.file;

    const fileData = await Storage.create({
      filename,
      originalName: originalname,
      url: `${PUBLIC_URL}/uploads/${filename}`,
      mimetype,
      size
    });

    res.status(201).json({ data: fileData });
  } catch (error) {
    next(error);
  }
};

// GET /api/storage
export const getFiles = async (req, res, next) => {
  try {
    const files = await Storage.find().sort({ createdAt: -1 }).lean();
    res.json({ data: files });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/storage/:id
export const deleteFile = async (req, res, next) => {
  try {
    const file = await Storage.findById(req.params.id);

    if (!file) return handleHttpError(res, 'Archivo no encontrado', 404);

    // Eliminar archivo físico del disco
    try {
      const filePath = join(process.cwd(), 'storage', file.filename);
      await unlink(filePath);
    } catch {
      console.warn('⚠️ Archivo físico no encontrado en disco');
    }

    await Storage.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
