const Router = require('express')
const router = new Router()
const albumController = require('../controllers/albumController.js')

router.get('/', albumController.getPage)
router.get('/:id', albumController.getOne)
router.post('/', albumController.create)
router.delete('/:id', albumController.delete)
router.patch('/:id', albumController.update)

module.exports = router