const models = require('../models')
const errorCode = require('../config/msgConfig.json')
const AppError = require('../utils/errors/appError')
const mailer = require('./mailer')
const validator = require('../utils/validator')

const confirmEmail = async (ctx, _next) => {
  const token = ctx.params.token
  validator.validateToken(ctx, !0)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.UnprocessableEntity, ctx.errors)
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
  validator.validateFullname(ctx)
  validator.validateUsername(ctx)
  validator.validatePassword(ctx)
  validator.validateEmail(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.UnprocessableEntity, ctx.errors)
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

const forgetPassword = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateEmail(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.UnprocessableEntity, ctx.errors)
  } else {
    try {
      body.email = normalizeEmail(body.email)
      let emailExist = await models.User.findValidOne({
        where: {
          email: body.email
        },
        attributes: ['id', 'email', 'profile']
      })
      if (!emailExist) {
        throw new AppError('The email address doesn\'t exist. Enter a different email address or get a new account.', errorCode.UnprocessableEntity)
      }
      let isInvalidate = emailExist.isInvalidate()
      if (isInvalidate) {
        throw new AppError(isInvalidate, errorCode.UnprocessableEntity)
      }
      let token = await emailExist.getValidResetPasswordToken(!0)
      mailer.sentConfirmResetPassword(emailExist, token)
      ctx.body = {
        success: !0,
        message: 'An email has been sent to ' + body.email + ' with further instructions on how to reset your password.'
      }
    } catch (err) {
      throw err
    }
  }
}

const confirmPasswordReset = async (ctx, _next) => {
  const token = ctx.params.token
  validator.validateToken(ctx, !0)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let tokenValid = await models.User.findValidOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpire: { $gt: new Date() }
        },
        attributes: ['username']
      })
      if (!tokenValid) {
        throw new AppError('Token is invalid or expired.', errorCode.UnprocessableEntity)
      }
      let isInvalidate = tokenValid.isInvalidate()
      if (isInvalidate) {
        throw new AppError(isInvalidate, errorCode.UnprocessableEntity)
      }
      ctx.body = {
        success: !0,
        username: tokenValid.get('username')
      }
    } catch (err) {
      throw err
    }
  }
}

const changePassword = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateToken(ctx)
  validator.validatePassword(ctx)
  validator.validateConfirmPassword(ctx, body.password)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let token = body.token
      let tokenValid = await models.User.findValidOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpire: { $gt: new Date() }
        },
        attributes: ['id']
      })
      if (!tokenValid) {
        throw new AppError('Token is invalid or expired.', errorCode.UnprocessableEntity)
      }
      let isInvalidate = tokenValid.isInvalidate()
      if (isInvalidate) {
        throw new AppError(isInvalidate, errorCode.UnprocessableEntity)
      }
      let encryptPassword = await models.User.encryptPassword(body.password)
      tokenValid.update({ password: encryptPassword, resetPasswordToken: null })
      ctx.body = {
        success: !0,
        message: 'Your password has been changed successfully! Thank you.'
      }
    } catch (err) {
      throw err
    }
  }
}

module.exports = {
  signUp,
  forgetPassword,
  changePassword,
  confirmEmail,
  confirmPasswordReset
}
