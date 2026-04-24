import express from 'express';
import authRoutes from './routes/auth.routes.js';
import booksRoutes from './routes/books.routes.js';
import loansRoutes from './routes/loans.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api', reviewsRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`📚 Biblioteca API en http://localhost:${PORT}`);
});

export default app;
