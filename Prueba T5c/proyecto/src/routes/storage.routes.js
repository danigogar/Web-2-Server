import { Router } from 'express';
import { uploadFile, getFiles, deleteFile } from '../controllers/storage.controller.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import uploadMiddleware from '../utils/handleStorage.js';

const router = Router();

router.get('/', getFiles);
router.post('/', uploadMiddleware.single('file'), uploadFile);
router.delete('/:id', validateObjectId(), deleteFile);

export default router;
