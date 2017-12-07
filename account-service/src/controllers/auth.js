
const passport = require('koa-passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const config = require('../config/appConfig')
const validator = require('../utils/validator')
const AppError = require('../utils/errors/appError')
const errorCode = require('../config/msgConfig.json')
const utils = require('../utils/utils')
const models = require('../models')
const auth = {}

passport.use(new GoogleStrategy(config.getPassportGoogleConfig(), (ctx, accessToken, refreshToken, profile, done) => {
  done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  })
}))

auth.signIn = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validatePassword(ctx)
  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.UnprocessableEntity, ctx.errors)
  }
  let username = body.username
  let email = utils.normalizeEmail(body.email)
  if (!username && !email) {
    throw new AppError('Username or Email is required.', errorCode.UnprocessableEntity)
  }
  let options = { where: { } }
  if (username) options.where.username = username
  else options.where.email = email
  let account = await models.User.findValidOne(options)
  if (!account) {
    throw new AppError('This account doesn\'t exist.', errorCode.UnprocessableEntity)
  }
  let isInvalidate = account.isInvalidate(true)
  if (isInvalidate) {
    throw new AppError(isInvalidate, errorCode.UnprocessableEntity)
  }
  let password = account.get('password')
  if (!password) {
    throw new AppError('Before process this action. You need to create password for this account.', errorCode.UnprocessableEntity)
  }
  let isMatch = await models.User.comparePassword(body.password, account.get('password'))
  if (!isMatch) {
    throw new AppError('Your password isn\'t match', errorCode.UnprocessableEntity)
  }
  ctx.body = {
    success: !0,
    data: account.toJSON()
  }
}

auth.signInGoogle = passport.authenticate('google', { session: false, scope: 'profile email' })
auth.signInGoogleCallback = async (ctx, _next) => {
  await passport.authenticate('google', { session: false }, async(nah, info) => {
    let profile = info.profile
    let queryGoogleOptions = {
      where: {
        googleId: profile.id
      }
    }
    validator.onlyActive(queryGoogleOptions)
    let existGoogleUser = await models.User.findValidOne(queryGoogleOptions)
    if (existGoogleUser) {
      ctx.body = existGoogleUser
    } else {
      let _email = profile.emails ? utils.normalizeEmail(profile.emails[0].value) : null
      if (_email) {
        let queryEmailOptions = {
          where: {
            email: _email
          }
        }
        validator.onlyActive(queryEmailOptions)
        let existEmail = await models.User.findValidOne(queryEmailOptions)
        if (existEmail) {
          let _temp = existEmail.get('temp')
          if (!_temp) _temp = {}
          _temp.googleId = profile.ida
          await existEmail.update({temp: _temp})
          ctx.redirect(config.api.authenticateAPI.confirmLinkGooglePage + _email)
        } else {
          let createdUser = await models.User.create({
            email: _email,
            googleId: profile.id,
            isEmailConfirmed: !0,
            profile: {
              fullname: profile.displayName,
              gender: profile._json.gender,
              picture: profile._json.image.url
            }
          })
          ctx.body = {
            success: !0,
            data: createdUser.toJSON()
          }
        }
      } else {
        throw new AppError('Unable to receive information.', errorCode.UnprocessableEntity)
      }
    }
  })(ctx, _next)
}

auth.confirmLinkGoogle = async (ctx, _next) => {
  const body = ctx.request.body
  body.email = utils.normalizeEmail(body.email)
  validator.validateEmail(ctx)
  validator.validatePassword(ctx)
  if (ctx.errors) {
    throw new AppError('Validation Failed.', errorCode.UnprocessableEntity, ctx.errors)
  }
  let account = await models.User.User.findValidOne({ where: {email: body.email}, attributes: ['id', 'password', 'temp'] })
  if (!account) {
    throw new AppError('This email doesn\'t exist.', errorCode.UnprocessableEntity)
  }
  let isInvalidate = account.isInvalidate(true)
  if (isInvalidate) {
    throw new AppError(isInvalidate, errorCode.UnprocessableEntity)
  }
  let password = account.get('password')
  if (!password) {
    throw new AppError('Before process this action. You need to create password for this account.', errorCode.UnprocessableEntity)
  }
  let isMatch = await models.User.comparePassword(body.password, account.get('password'))
  if (!isMatch) {
    throw new AppError('Your password isn\'t match', errorCode.UnprocessableEntity)
  }
  let _temp = account.get('temp')
  if (!(_temp && _temp.googleId)) {
    throw new AppError('This account doesn\'t link to any Google Account', errorCode.UnprocessableEntity)
  }
  let _googleID = _temp.googleId
  delete _temp.googleId
  await account.update({
    googleId: _googleID,
    temp: _temp
  })
  ctx.body = {
    success: !0,
    data: account.toJSON()
  }
}

module.exports = auth
