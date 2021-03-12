const winston = require('winston');
const { format } = require('winston');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const myFormat = format.printf(({
  level, message, metadata, timestamp,
}) => `${timestamp} [${metadata.service}] ${level}: ${message}`);

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.metadata(),
    format.json(),
  ),
  transports: [
    // new winston.transports.File({ filename: `logs/error/${d}.log`, level: 'error' }),
    // new winston.transports.File({ filename: `logs/combined/${d}.log`, level: 'debug' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        myFormat,
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        myFormat,
      ),
    }),
  ],
});

function setTransports() {
  const d = Date.now();
  console.log(d);
  if (config.logging.console) {
    logger.add(new winston.transports.Console({
      level: 'debug',
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        myFormat,
      ),
    }));
  }
  if (config.logging.file) {
    logger.add(new winston.transports.File({ filename: `logs/error/${d}.log`, level: 'error' }));
    logger.add(new winston.transports.File({ filename: `logs/combined/${d}.log`, level: 'debug' }));
  }
}

module.exports = { logger, setTransports };
