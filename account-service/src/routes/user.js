const Router = require('koa-router')
const users = require('../controllers/user')
const config = require('../config/appConfig')
const accountAPIConfig = config.getServiceConfig('accountAPI')

const router = Router({
  prefix: accountAPIConfig.prefix
})

router.post(accountAPIConfig.signUp, users.signUp)

module.exports = router
