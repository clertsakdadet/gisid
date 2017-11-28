const models = require('../models')
const errorCode = require('../config/msgConfig.json')
const AppError = require('../utils/errors/appError')
const mailer = require('./mailer')

const signUp = async (ctx, _next) => {
  const body = ctx.request.body

  ctx.checkBody('fullname')
  .len(4, 20, 'Full name must be at least 4 characters.')
  ctx.checkBody('username').len(4, 20, 'Username must be at least 4 characters.')
  .isAlphanumeric('Username not accepting special characters.')
  ctx.checkBody('password').len(6, 20, 'Password must be at least 4 characters.')
  ctx.checkBody('email').isEmail('Please enter a valid email address.')

  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.unprocessableEntity, ctx.errors)
  } else {
    try {
      let user = await models.User.createUser(body)
      let token = await user.getValidConfirmEmailToken()
      await mailer.sentConfirmEmail(user.get('email'), token)
      ctx.body = {
        success: !0,
        message: 'Check your inbox We just emailed a confirmation link to ' + body.email + '. Click the link to complete your account set-up.'
      }
    } catch (err) {
      throw err
    }
  }
}

module.exports = {
  signUp
}
