import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { logger } from './utils/logger.js';

// Validate environment variables on startup
validateEnv();

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`Fake Job Detection Backend running on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`CORS allowed for: ${env.FRONTEND_URL}`);
  console.log('==================================================');
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Gracefully terminating backend server...`);
  server.close(() => {
    logger.info('HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception trapped:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection trapped:', reason);
});

export default server;
