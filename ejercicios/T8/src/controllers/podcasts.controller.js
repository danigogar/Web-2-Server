import Podcast from '../models/podcast.model.js'

// ─── GET /api/podcasts ────────────────────────────────────────────────────────
// Solo podcasts publicados, con paginación (BONUS)
export const getPodcasts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    const skip = (pageNum - 1) * limitNum

    const [podcasts, total] = await Promise.all([
      Podcast.find({ published: true })
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Podcast.countDocuments({ published: true }),
    ])

    res.json({
      data: podcasts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    next(error)
  }
}

// ─── GET /api/podcasts/admin/all ──────────────────────────────────────────────
// Solo admin — todos los podcasts (publicados y no publicados)
export const getAllPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ data: podcasts })
  } catch (error) {
    next(error)
  }
}

// ─── GET /api/podcasts/:id ────────────────────────────────────────────────────
export const getPodcastById = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .populate('author', 'name email')
      .lean()

    if (!podcast) {
      return res.status(404).json({
        error: true,
        message: 'Podcast no encontrado',
      })
    }

    res.json({ data: podcast })
  } catch (error) {
    next(error)
  }
}

// ─── POST /api/podcasts ───────────────────────────────────────────────────────
export const createPodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.create({
      ...req.body,
      author: req.user._id,
    })

    await podcast.populate('author', 'name email')

    res.status(201).json({ data: podcast })
  } catch (error) {
    next(error)
  }
}

// ─── PUT /api/podcasts/:id ────────────────────────────────────────────────────
// Solo el autor puede actualizar su propio podcast
export const updatePodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id)

    if (!podcast) {
      return res.status(404).json({
        error: true,
        message: 'Podcast no encontrado',
      })
    }

    // Verificar que el usuario autenticado es el autor
    if (podcast.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'Solo puedes editar tus propios podcasts',
      })
    }

    const updated = await Podcast.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email')

    res.json({ data: updated })
  } catch (error) {
    next(error)
  }
}

// ─── DELETE /api/podcasts/:id ─────────────────────────────────────────────────
// Solo admin
export const deletePodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findByIdAndDelete(req.params.id)

    if (!podcast) {
      return res.status(404).json({
        error: true,
        message: 'Podcast no encontrado',
      })
    }

    res.json({ message: 'Podcast eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}

// ─── PATCH /api/podcasts/:id/publish ─────────────────────────────────────────
// Solo admin — publica o despublica un podcast
export const togglePublish = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id)

    if (!podcast) {
      return res.status(404).json({
        error: true,
        message: 'Podcast no encontrado',
      })
    }

    podcast.published = !podcast.published
    await podcast.save()

    res.json({
      data: podcast,
      message: `Podcast ${podcast.published ? 'publicado' : 'despublicado'} correctamente`,
    })
  } catch (error) {
    next(error)
  }
}
