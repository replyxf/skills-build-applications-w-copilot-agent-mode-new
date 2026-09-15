import mongoose from 'mongoose';

import { log } from './logger.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';
const db = mongoose.connection;

mongoose
  .connect(connectionString)
  .then(() => {
    log('info', 'Connected to MongoDB');
  })
  .catch((error) => {
    log('error', 'MongoDB connection failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });

db.on('error', (error) => {
  log('error', 'MongoDB connection error', { error: error.message });
});

export default db;
