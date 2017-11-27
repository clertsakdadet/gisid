async function handleError (ctx, next) {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || err.code
    ctx.body = {
      success: false,
      message: err.message,
      errors: err.causes
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
