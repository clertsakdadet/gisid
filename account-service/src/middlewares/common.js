const AppError = require('../utils/errors/appError')
const errorCode = require('../config/msgConfig.json')
const logger = require('../utils/logger/account_log')
const utils = require('../utils/utils')

async function handleError (ctx, next) {
  try {
    await next()
  } catch (err) {
    utils.parseSpecialErrorCode(err)
    ctx.status = (Number.isInteger(err.status) ? err.status : null) ||
    (Number.isInteger(err.code) ? err.code : null) || errorCode.InternalServerError
    if (err instanceof AppError || utils.isSpecialError(err)) {
      ctx.body = {
        success: !1,
        message: err.message,
        errors: err.causes
      }
    } else {
      if (err.message) {
        logger.error(err)
      }
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
