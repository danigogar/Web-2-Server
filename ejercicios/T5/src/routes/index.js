import { Router } from 'express'
import moviesRoutes from './movies.routes.js'

const router = Router()

router.use('/movies', moviesRoutes)

router.get('/', (req, res) => {
  res.json({
    message: '🎬 BlockBuster API v1.0',
    endpoints: {
      movies: '/api/movies',
      topMovies: '/api/movies/stats/top',
      availableMovies: '/api/movies/available',
    },
  })
})

export default router
