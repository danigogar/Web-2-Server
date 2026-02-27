import User from '../models/user.model.js';
import { handleHttpError } from '../utils/handleError.js';

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      data: users,
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

// GET /api/users/:id
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) return handleHttpError(res, 'Usuario no encontrado', 404);

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/users
export const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) return handleHttpError(res, 'Usuario no encontrado', 404);

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return handleHttpError(res, 'Usuario no encontrado', 404);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
