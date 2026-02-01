import winston from 'winston';
import colors from 'colors';

const { NODE_ENV } = process.env;

// Define custom settings for each transport
const options = {
  console: {
    level: 'info',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.label({
        label: 'task-management-api',
      }),
      winston.format.printf(
        ({ level, message, timestamp, label, stack }) => {
          const coloredLevel = level === 'info'
            ? colors.blue('info')
            : level === 'error'
              ? colors.red('error')
              : level === 'warn'
                ? colors.yellow('warn')
                : level === 'debug'
                  ? colors.gray('debug')
                  : level;

          // Message is already colored from the enhanced logger wrapper
          const displayMessage = message;

          if (stack) {
            return `[${colors.gray(timestamp)}] ${coloredLevel}:- ${displayMessage} -- ${colors.red(stack)}`;
          } else {
            return `[${colors.gray(timestamp)}] ${coloredLevel}:- ${displayMessage}`;
          }
        }
      )
    ),
  },
  file: {
    level: 'info',
    filename: 'logs/app.log',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  },
};

let env = NODE_ENV || 'development';

let logger;

try {
  logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.timestamp(),
      winston.format.label({
        label: 'task-management-api',
      })
    ),
    defaultMeta: {
      application: `task-management-api-${env}`,
      environment: env,
    },
    transports: [
      new winston.transports.Console(options.console),
      ...(NODE_ENV === 'production' ? [
        new winston.transports.File(options.file),
        new winston.transports.File({
          ...options.file,
          level: 'error',
          filename: 'logs/error.log',
        }),
      ] : [])
    ],
    exitOnError: false,
  });

  // Create a stream object for morgan
  logger.stream = {
    write: (message) => {
      logger.info(message.trim());
    },
  };

  // Store reference to original winston logger
  const originalLogger = logger;

  // Create enhanced logger wrapper that supports color syntax
  const enhancedLogger = {
    info: (message) => originalLogger.info(message),
    error: (message) => originalLogger.error(message),
    warn: (message) => originalLogger.warn(message),
    debug: (message) => originalLogger.debug(message),
    stream: originalLogger.stream
  };

  logger = enhancedLogger;

} catch (error) {
  console.error(colors.red('Logger initialization failed:'), error);
  // Fallback simple logger
  logger = {
    info: (message) => console.log(colors.blue('[INFO]:'), message),
    error: (message) => console.error(colors.red('[ERROR]:'), message),
    warn: (message) => console.warn(colors.yellow('[WARN]:'), message),
    debug: (message) => console.log(colors.gray('[DEBUG]:'), message),
    stream: {
      write: (message) => console.log(message.trim())
    }
  };
}

export { logger };