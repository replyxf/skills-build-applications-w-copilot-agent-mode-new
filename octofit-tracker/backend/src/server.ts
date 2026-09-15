import 'dotenv/config';
import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';

import './config/database.js';
import { log } from './config/logger.js';
import apiRouter from './routes/api.js';

const app = express();
const port = Number(process.env.PORT) || 8000;
const codespaceName = process.env.CODESPACE_NAME;
const frontendUrl = codespaceName
  ? `https://${codespaceName}-5173.app.github.dev`
  : 'http://localhost:5173';
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS ?? frontendUrl)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}));
app.use(express.json({ limit: '100kb' }));
app.use((request, response, next) => {
  const startedAt = performance.now();

  response.on('finish', () => {
    log('info', 'HTTP request', {
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    });
  });

  next();
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/', (_request, response) => {
  response.json({ message: 'OctoFit Tracker API' });
});

app.use(apiRouter);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof mongoose.Error.ValidationError || error instanceof SyntaxError) {
    statusCode = 400;
    message = 'Invalid request';
  } else if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  log('error', 'Request failed', {
    method: request.method,
    path: request.originalUrl,
    statusCode,
    error: error instanceof Error ? error.message : String(error),
  });

  response.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && error instanceof Error ? { error: error.message } : {}),
  });
};

app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  const baseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : `http://localhost:${port}`;

  log('info', 'OctoFit Tracker API listening', { baseUrl, port });
});