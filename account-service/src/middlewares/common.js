const AppError = require('../utils/errors/appError')

async function handleError (ctx, next) {
  try {
    ctx.body = 'Welcome'
    await next()
  } catch (err) {
    ctx.status = err.status || err.code || 500
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
