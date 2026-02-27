import Track from '../models/track.model.js';
import { handleHttpError } from '../utils/handleError.js';

// GET /api/tracks
export const getTracks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, genre } = req.query;

    const filter = {};
    if (genre) filter.genres = genre;

    const skip = (Number(page) - 1) * Number(limit);

    const [tracks, total] = await Promise.all([
      Track.find(filter)
        .populate('artist', 'name email')
        .populate('file', 'url mimetype')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),
      Track.countDocuments(filter)
    ]);

    res.json({
      data: tracks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tracks/:id
export const getTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate('artist', 'name email avatar')
      .populate('file', 'url mimetype size')
      .lean();

    if (!track) return handleHttpError(res, 'Track no encontrado', 404);

    res.json({ data: track });
  } catch (error) {
    next(error);
  }
};

// POST /api/tracks
export const createTrack = async (req, res, next) => {
  try {
    const track = await Track.create(req.body);
    await track.populate('artist', 'name email');
    res.status(201).json({ data: track });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tracks/:id
export const updateTrack = async (req, res, next) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('artist', 'name email');

    if (!track) return handleHttpError(res, 'Track no encontrado', 404);

    res.json({ data: track });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tracks/:id
export const deleteTrack = async (req, res, next) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);

    if (!track) return handleHttpError(res, 'Track no encontrado', 404);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
