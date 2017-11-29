const Router = require('koa-router')
const users = require('../controllers/user')
const config = require('../config/appConfig')
const accountAPIConfig = config.getServiceConfig('accountAPI')

const router = Router({
  prefix: accountAPIConfig.prefix
})

router.post(accountAPIConfig.signUp, users.signUp)
router.post(accountAPIConfig.changePassword, users.changePassword)
router.post(accountAPIConfig.forget, users.forgetPassword)

router.get(accountAPIConfig.confirmEmail, users.confirmEmail)
router.get(accountAPIConfig.confirmResetPassword, users.confirmPasswordReset)
router.get(accountAPIConfig.confirmDeleteAccount, users.confirmPasswordReset)

module.exports = router
