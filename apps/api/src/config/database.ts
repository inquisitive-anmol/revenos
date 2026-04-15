import mongoose from 'mongoose';
import logger from '@/config/logger';

const MONGODB_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  maxPoolSize: 20,
  minPoolSize: 2,
  connectTimeoutMS: 10000,
};

const registerConnectionEvents = (): void => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB: connected');
  });

  mongoose.connection.on('disconnected', () => {
    logger.error('MongoDB: disconnected — attempting to reconnect');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB: reconnected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB: connection error');
  });

  mongoose.connection.on('close', () => {
    logger.warn('MongoDB: connection closed');
  });
};

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    logger.fatal('MongoDB: DATABASE_URL is not set');
    process.exit(1);
  }

  registerConnectionEvents();

  try {
    await mongoose.connect(uri, MONGODB_OPTIONS);
    logger.info('MongoDB: connection established');
  } catch (err) {
    logger.fatal({ err }, 'MongoDB: failed to connect on startup');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB: disconnected gracefully');
  } catch (err) {
    logger.error({ err }, 'MongoDB: error during disconnect');
  }
};