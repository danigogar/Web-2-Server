import { Router } from 'express';
import Room from '../models/room.model.js';
import Message from '../models/message.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(409).json({ error: true, message: 'Ya existe una sala con ese nombre' });
    }

    const room = await Room.create({
      name,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Sala creada exitosamente', room });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const { search } = req.query;

    let query = { roomId, isPrivate: false, deleted: false };

    if (search) {
      query.$text = { $search: search };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

export default router;
