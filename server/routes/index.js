const Router = require('express')
const router = new Router()
const albumRouter = require('./albumRouter')
const trackRouter = require('./trackRouter')
const parseRouter = require('./parseRouter')

router.use('/album', albumRouter)
router.use('/track', trackRouter)
router.use('/parse', parseRouter)

module.exports = router