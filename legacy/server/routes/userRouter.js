const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { attemptLimiter } = require('../middleware/rateLimitMiddleware');

// User registration
router.post('/registration', attemptLimiter, userController.registration);

// User login
router.post('/login', attemptLimiter, userController.login);

// User logout
router.post('/logout', authMiddleware, userController.logout);

// Get user profile (protected route)
router.get('/profile', authMiddleware, userController.getOne);

// Update user password (protected route)
router.patch('/update', authMiddleware, userController.update);

// Delete user account (protected route)
router.delete('/delete', authMiddleware, userController.delete);

// Check user authentication
router.get('/check', userController.check);

module.exports = router;
