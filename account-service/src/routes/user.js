const Router = require('koa-router')
const users = require('../controllers/user')
const config = require('../config/appConfig')
const accountAPIConfig = config.getServiceConfig('accountAPI')

const router = Router({
  prefix: accountAPIConfig.prefix
})

router.post(accountAPIConfig.signUp, users.signUp)
router.post(accountAPIConfig.resetPassword, users.resetPassword)
router.post(accountAPIConfig.updatePassword, users.updatePassword)
router.post(accountAPIConfig.updateAccount, users.updateAccount)
router.post(accountAPIConfig.forget, users.forgetPassword)
router.post(accountAPIConfig.delete, users.deleteAccount)

router.get(accountAPIConfig.confirmEmail, users.confirmEmail)
router.get(accountAPIConfig.confirmResetPassword, users.confirmPasswordReset)

module.exports = router
