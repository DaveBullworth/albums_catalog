const Router = require('express')
const router = new Router()
const parseController = require('../controllers/parseController.js')

router.get('/', parseController.get)

module.exports = router