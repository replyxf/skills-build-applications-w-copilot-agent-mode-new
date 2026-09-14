import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import './config/database.js';

const app = express();
const port = Number(process.env.PORT) || 8000;
const codespaceName = process.env.CODESPACE_NAME;
const frontendUrl = codespaceName
  ? `https://${codespaceName}-5173.app.github.dev`
  : 'http://localhost:5173';

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get('/api/', (_request, response) => {
  response.json({ message: 'OctoFit Tracker API' });
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.listen(port, '0.0.0.0', () => {
  const baseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : `http://localhost:${port}`;

  console.log(`OctoFit Tracker API listening at ${baseUrl}`);
});