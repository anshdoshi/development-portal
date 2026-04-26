import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

export default app;
