const Router = require('express')
const router = new Router()
const trackController = require('../controllers/trackController.js')

router.get('/', trackController.get)
router.post('/', trackController.create)
router.delete('/', trackController.delete)

module.exports = router