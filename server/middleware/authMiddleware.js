const jwt = require('jsonwebtoken');
const { ApiError } = require('../error/apiError');

module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    // Read token from cookies instead of headers
    const token = req.cookies.token;

    if (!token) {
      throw ApiError.unauthorized('User is not authorized');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    throw ApiError.unauthorized('User is not authorized');
  }
};
