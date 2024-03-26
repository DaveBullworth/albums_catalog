const Router = require('express')
const router = new Router()
const albumRouter = require('./albumRouter')
const trackRouter = require('./trackRouter')

router.use('/album', albumRouter)
router.use('/track', trackRouter)

module.exports = router