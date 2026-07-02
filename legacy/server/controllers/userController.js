// Импорт вместо bcrypt
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const ApiError = require('../error/apiError');
const { TOKEN_EXPIRES_IN, COOKIE_OPTIONS } = require('../constants');
const { logError } = require('../utils/logger');

// Generate JWT token
const generateJwt = (id, login) => {
  return jwt.sign({ id, login }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
};

class UserController {
  async registration(req, res, next) {
    const { login, password } = req.body;

    try {
      // Динамический импорт scrypt-kdf
      const scrypt = (await import('scrypt-kdf')).default; // Используем default экспорт

      // Check if user already exists
      const candidate = await User.findOne({ where: { login } });
      if (candidate) {
        return next(ApiError.badRequest(req.t('user.registration.sameLogin')));
      }

      // Hash password
      const hashPasswordBuffer = await scrypt.kdf(password, { logN: 15 });
      const hashPassword = hashPasswordBuffer.toString('base64');

      // Create user
      const user = await User.create({ login, password: hashPassword });

      // Generate token
      const token = generateJwt(user.id, user.login);

      // Set HTTP-only cookie
      res.cookie('token', token, COOKIE_OPTIONS);

      return res.json({ id: user.id, login: user.login });
    } catch (error) {
      logError(error, 'UserController: ошибка при регистрации');
      next(ApiError.internal(req.t('user.registration.internalError')));
    }
  }

  async check(req, res, next) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return next(ApiError.unauthorized(req.t('user.check.unauthorized')));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return next(ApiError.unauthorized(req.t('user.check.unauthorized')));
      }

      return res.json({ isAuth: true, user: { id: user.id, login: user.login } });
    } catch (error) {
      logError(error, 'UserController: ошибка при проверке авторизации');
      return next(ApiError.unauthorized(req.t('user.check.unauthorized')));
    }
  }

  async login(req, res, next) {
    const { login, password } = req.body;
    try {
      // Динамический импорт scrypt-kdf
      const scrypt = (await import('scrypt-kdf')).default; // Используем default экспорт
      // Find user
      const user = await User.findOne({ where: { login } });
      if (!user) {
        return next(ApiError.badRequest(req.t('user.login.invalidCredentials')));
      }

      // Check password
      let comparePassword = await scrypt.verify(Buffer.from(user.password, 'base64'), password);
      if (!comparePassword) {
        return next(ApiError.badRequest(req.t('user.login.invalidCredentials')));
      }

      // Generate token
      const token = generateJwt(user.id, user.login);

      // Set HTTP-only cookie
      res.cookie('token', token, COOKIE_OPTIONS);

      return res.json({ id: user.id, login: user.login });
    } catch (error) {
      logError(error, 'UserController: ошибка при входе');
      next(ApiError.internal(req.t('user.login.internalError')));
    }
  }

  async logout(req, res, next) {
    try {
      // Clear the token cookie
      res.clearCookie('token');
      return res.json({ message: req.t('user.logout.success') });
    } catch (error) {
      logError(error, 'UserController: ошибка при выходе');
      next(ApiError.internal(req.t('user.logout.internalError')));
    }
  }

  async getOne(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'login'],
      });

      if (!user) {
        return next(ApiError.notFound(req.t('user.getOne.notFound')));
      }

      return res.json(user);
    } catch (error) {
      logError(error, 'UserController: ошибка при получении профиля');
      next(ApiError.internal(req.t('user.getOne.internalError')));
    }
  }

  async update(req, res, next) {
    const { login, newPassword } = req.body;
    try {
      // Динамический импорт scrypt-kdf
      const scrypt = (await import('scrypt-kdf')).default; // Используем default экспорт
      const userId = req.user.id;
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        return next(ApiError.notFound(req.t('user.update.notFound')));
      }

      // Prepare update object
      const updateData = {};

      // Check and update login if provided
      if (login && login !== user.login) {
        // Check if new login is already taken
        const existingUser = await User.findOne({ where: { login } });
        if (existingUser) {
          return next(ApiError.badRequest(req.t('user.update.sameLogin')));
        }
        updateData.login = login;
      }

      // Check and update password if provided
      if (newPassword) {
        // Hash new password
        const hash = await scrypt.kdf(newPassword, { logN: 15 });
        updateData.password = hash.toString('base64');
      }

      // Perform update if there are changes
      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
      }

      // Generate new token if login changed
      if (updateData.login) {
        const token = generateJwt(user.id, updateData.login);

        // Set new token in cookie
        res.cookie('token', token, COOKIE_OPTIONS);
      }

      // Return updated user info
      return res.json({
        id: user.id,
        login: updateData.login || user.login,
      });
    } catch (error) {
      logError(error, 'UserController: ошибка при обновлении профиля');
      next(ApiError.internal(req.t('user.update.internalError')));
    }
  }

  async delete(req, res, next) {
    try {
      const deletedCount = await User.destroy({
        where: { id: req.user.id },
      });

      if (deletedCount === 0) {
        return next(ApiError.notFound(req.t('user.delete.notFound')));
      }

      // Clear the token cookie
      res.clearCookie('token');

      return res.json({ message: req.t('user.delete.success') });
    } catch (error) {
      logError(error, 'UserController: ошибка при удалении пользователя');
      next(ApiError.internal(req.t('user.delete.internalError')));
    }
  }
}

module.exports = new UserController();
