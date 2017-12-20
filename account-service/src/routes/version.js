const config = require('../config/appConfig')
const Router = require('koa-router')
const checkAPIConfig = config.getServiceConfig('checkAPI')

const router = Router({
  prefix: checkAPIConfig.prefix
})

router.post(checkAPIConfig.versions, async (ctx, _next) => {
  ctx.body = '1.1.1'
})
router.get(checkAPIConfig.versions, async (ctx, _next) => {
  ctx.body = '1.1.1'
})

module.exports = router
