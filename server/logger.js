const { format } = require('winston');
const winston = require('winston');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const d = new Date().toISOString().replace(/[.:-]/gm, '');

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
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
});

const myFormat = format.printf(({
  level, message, metadata, timestamp,
}) => `${timestamp} [${metadata.service}] ${level}: ${message}`);

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    levels: winston.config.syslog.levels,
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

module.exports = { logger };
