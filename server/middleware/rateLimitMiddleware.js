const rateLimit = require('express-rate-limit');
const ApiError = require('../error/apiError'); // Подключаем наш класс ошибок

const attemptLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 5, // Максимум 5 попыток
  standardHeaders: true, // Возвращает заголовки RateLimit-*
  legacyHeaders: false, // Отключает X-RateLimit-*

  // Кастомный обработчик ошибки
  handler: (req, res, next) => {
    return next(ApiError.tooManyRequests(req.t('user.login.tooManyAttempts')));
  },
});

module.exports = { attemptLimiter };
