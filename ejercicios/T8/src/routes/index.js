import { Router } from 'express'
import authRoutes from './auth.routes.js'
import podcastsRoutes from './podcasts.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/podcasts', podcastsRoutes)

router.get('/', (req, res) => {
  res.json({
    message: '🎙️ PodcastHub API v1.0',
    endpoints: {
      auth: '/api/auth',
      podcasts: '/api/podcasts',
      docs: '/api-docs',
    },
  })
})

export default router
