import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import colors from 'colors';
import http from 'http';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { createRequestIdMiddleware } from './middleware/utilityMiddleware.js';
import { logger } from './utils/logger.js';
import apiRoutes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const port = process.env.PORT || 5001;
const nodeEnv = process.env.NODE_ENV || 'development';

// Connect to database
connectDB();

const app = express();

// Trust first proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// HTTP Parameter Pollution attacks prevention
app.use(hpp());

// Request logging
if (nodeEnv === 'development') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Request ID middleware for traceability
app.use(createRequestIdMiddleware());

// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Use centralized API routes
app.use('/api', apiRoutes);

// API Documentation on root path - serve static assets and setup
app.use('/', swaggerUi.serve);
app.get(
  '/',
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Serve static files (uploads only for backend API)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.warn(`🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('📪 HTTP server closed.');
    logger.info('✅ Graceful shutdown completed.'.green.bold);
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      '⚠️  Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:'.red.bold, promise);
  logger.error('Reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:'.red.bold, error);
  process.exit(1);
});

// Start the server
server.listen(port, () => {
  logger.info(`Server running in ${nodeEnv} mode on port ${port}`.green.bold);
});
