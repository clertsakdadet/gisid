const AppError = require('../utils/errors/appError')
const errorCode = require('../config/msgConfig.json')

async function handleError (ctx, next) {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || err.code || errorCode.InternalServerError
    if (err instanceof AppError) {
      ctx.body = {
        success: !1,
        message: err.message,
        errors: err.causes
      }
    } else {
      ctx.body = {
        success: !1,
        message: 'Oops! Something went wrong. please try again later.'
      }
    }
  }
}

async function responseTime (ctx, next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
}

module.exports = {
  handleError,
  responseTime
}
