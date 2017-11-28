const models = require('../models')
const errorCode = require('../config/msgConfig.json')
const AppError = require('../utils/errors/appError')
const mailer = require('./mailer')

const confirmEmail = async (ctx, _next) => {
  const token = ctx.params.token
  ctx.checkParams('token').notEmpty('Token is required.')

  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.unprocessableEntity, ctx.errors)
  } else {
    try {
      let email = await models.User.activeEmail(token)
      ctx.body = {
        success: !0,
        message: 'You have successfully verified ' + email
      }
    } catch (err) {
      throw err
    }
  }
}

function normalizeEmail (email) {
  let rawParts = email.split('@')
  let domain = rawParts.pop()
  let user = rawParts.join('@')
  let parts = [user, domain]
  parts[1] = parts[1].toLowerCase()

  // remove sub-address
  parts[0] = parts[0].split('+')[0]
  if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
    // Gmail ignores the dots
    parts[0] = parts[0].replace(/\./g, '')
  }
  return parts.join('@')
}

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
      body.email = normalizeEmail(body.email)
      let user = await models.User.createUser(body)
      let token = await user.getValidConfirmEmailToken()
      mailer.sentConfirmEmail(user.get('email'), token)
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
  signUp,
  confirmEmail
}
