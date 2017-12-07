const Router = require('koa-router')
const config = require('../config/appConfig')
const auth = require('../controllers/auth')
const authenticateAPIConfig = config.getServiceConfig('authenticateAPI')

const router = Router({
  prefix: authenticateAPIConfig.prefix
})

router.post(authenticateAPIConfig.signIn, auth.signIn)

router.get(authenticateAPIConfig.signInWithGoogle, auth.signInGoogle)
router.get(authenticateAPIConfig.googleCallback, auth.signInGoogleCallback)
router.get(authenticateAPIConfig.confirmLinkGoogle, auth.confirmLinkGoogle)
module.exports = router
