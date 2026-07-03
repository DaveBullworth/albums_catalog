const winston = require('winston');
const path = require('path');

// Форматирование для ошибок
const errorFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  // Если есть stack trace, добавляем его в лог
  return `${timestamp} ${level}: ${message}${stack ? '\n' + stack : ''}`;
});

const logger = winston.createLogger({
  level: 'error', // Логируем только ошибки
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Включаем stack trace
    errorFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
  ],
});

// Создаем функцию-обертку для удобного логирования ошибок
const logError = (error, context = '') => {
  const errorMessage = error instanceof Error ? error : new Error(error);
  logger.error(`${context}: ${errorMessage.message}`, { stack: errorMessage.stack });
};

module.exports = { logError };
