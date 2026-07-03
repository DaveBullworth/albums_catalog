const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const albumController = require('../controllers/albumController.js');

router.get('/', authMiddleware, albumController.getPage);
router.get('/:id', authMiddleware, albumController.getOne);
router.post('/', authMiddleware, albumController.create);
router.delete('/:id', authMiddleware, albumController.delete);
router.patch('/:id', authMiddleware, albumController.update);

module.exports = router;
