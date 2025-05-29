class ApiError extends Error {
  constructor(status, message) {
    super(); //вызвали родительский конструктор
    this.status = status;
    this.message = message;
  }

  // Статический метод для создания ошибки 400(Неверный запрос)
  static badRequest(message) {
    return new ApiError(400, message);
  }

  // Статический метод для создания ошибки 401(Не авторизован)
  static unauthorized(message) {
    return new ApiError(401, message);
  }

  // Статический метод для создания ошибки 403 (Доступ запрещен)
  static forbidden(message) {
    return new ApiError(403, message);
  }

  // Статический метод для создания ошибки 404 (Не найдено)
  static notFound(message) {
    return new ApiError(404, message);
  }

  // Статический метод для создания ошибки 500 (Внутренняя ошибка сервера)
  static internal(message) {
    return new ApiError(500, message);
  }

  // Статический метод для ошибки 429 (слишком много запросов)
  static tooManyRequests(message) {
    return new ApiError(429, message);
  }
}

module.exports = ApiError;
