
const fileName = __filename.slice(__dirname.length + 1)
const passport = require('koa-passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const config = require('../config/appConfig')
const validator = require('../utils/validator')
const AppError = require('../utils/errors/appError')
const msg = require('../config/msgConfig.json')
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

passport.use(new FacebookStrategy(config.getPassportFacebookConfig(), (ctx, accessToken, refreshToken, profile, done) => {
  done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  })
}))

auth.signIn = async (ctx, _next) => {
  const body = ctx.request.body
  try {
    validator.validateAccount(ctx)
    validator.validatePassword(ctx)
    if (ctx.errors) {
      throw new AppError(msg.ValidateFail, msg.UnprocessableEntity, ctx.errors)
    }
    let acc = body.account
    let options = { where: { } }
    if (acc && validator.check.isEmail(acc)) {
      let email = utils.normalizeEmail(body.email)
      options.where.email = email
    } else {
      options.where.username = acc
    }
    let account = await models.User.findValidOne(options)
    if (!account) {
      throw new AppError(msg.AccountNotExist, msg.UnprocessableEntity)
    }
    let isInvalidate = account.isInvalidate(true)
    if (isInvalidate) {
      throw new AppError(isInvalidate, msg.UnprocessableEntity)
    }
    let password = account.get('password')
    if (!password) {
      throw new AppError(msg.ReqPassword, msg.UnprocessableEntity)
    }
    let isMatch = await models.User.comparePassword(body.password, account.get('password'))
    if (!isMatch) {
      throw new AppError(msg.WrongPassword, msg.UnprocessableEntity)
    }
    ctx.body = {
      success: !0,
      data: account.toJSON()
    }
  } catch (err) {
    utils.trackError(err, fileName, 'signIn')
    throw err
  }
}

auth.signInGoogle = passport.authenticate('google', { session: false, scope: 'profile email' })
auth.signInGoogleCallback = async (ctx, _next) => {
  try {
    await passport.authenticate('google', { session: false }, async(nah, info) => {
      if (!info) {
        throw new AppError(msg.NotReceiveInfo, msg.UnprocessableEntity)
      }
      let profile = info.profile
      let queryOptions = {
        where: {
          googleId: profile.id
        }
      }
      validator.onlyActive(queryOptions)
      let existGoogleUser = await models.User.findValidOne(queryOptions)
      if (existGoogleUser) {
        ctx.body = existGoogleUser
      } else {
        let _email = profile.emails && profile.emails.length > 0 && profile.emails[0] ? utils.normalizeEmail(profile.emails[0].value) : null
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
            _temp.googleId = profile.id
            await existEmail.update({temp: _temp})
            ctx.redirect(config.api.authenticateAPI.confirmLinkGooglePage + _email)
          } else {
            let _profile = {
              fullname: profile.displayName,
              gender: profile.gender || profile._json.gender
            }
            utils.addAvatarToProfile('google', (profile._json.image ? profile._json.image.url : ''), _profile)
            let createdUser = await models.User.create({
              email: _email,
              googleId: profile.id,
              isEmailConfirmed: !0,
              profile: _profile
            })
            ctx.body = {
              success: !0,
              data: createdUser.toJSON()
            }
          }
        } else {
          throw new AppError(msg.NotReceiveInfo, msg.UnprocessableEntity)
        }
      }
    })(ctx, _next)
  } catch (err) {
    utils.trackError(err, fileName, 'signInGoogleCallback')
    throw err
  }
}

auth.confirmLinkGoogle = async (ctx, _next) => {
  const body = ctx.request.body
  try {
    body.email = utils.normalizeEmail(body.email)
    validator.validateEmail(ctx)
    validator.validatePassword(ctx)
    if (ctx.errors) {
      throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
    }
    let account = await models.User.User.findValidOne({ where: {email: body.email}, attributes: ['id', 'password', 'temp'] })
    if (!account) {
      throw new AppError('This email doesn\'t exist.', msg.UnprocessableEntity)
    }
    let isInvalidate = account.isInvalidate(true)
    if (isInvalidate) {
      throw new AppError(isInvalidate, msg.UnprocessableEntity)
    }
    let password = account.get('password')
    if (!password) {
      throw new AppError('Before process this action. You need to create password for this account.', msg.UnprocessableEntity)
    }
    let isMatch = await models.User.comparePassword(body.password, account.get('password'))
    if (!isMatch) {
      throw new AppError('Your password isn\'t match', msg.UnprocessableEntity)
    }
    let _temp = account.get('temp')
    if (!(_temp && _temp.googleId)) {
      throw new AppError('This account doesn\'t link to any Google Account', msg.UnprocessableEntity)
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
  } catch (err) {
    err && (err.fnTrack = 'confirmLinkGoogle') && (err.fileTrack = fileName)
    throw err
  }
}

auth.signInFacebook = passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
auth.signInFacebookCallback = async (ctx, _next) => {
  try {
    await passport.authenticate('facebook', { scope: ['email', 'public_profile'] }, async(nah, info) => {
      if (!info) {
        throw new AppError(msg.NotReceiveInfo, msg.UnprocessableEntity)
      }
      let profile = info.profile
      let queryOptions = {
        where: {
          facebookId: profile.id
        }
      }
      validator.onlyActive(queryOptions)
      let existFacebookUser = await models.User.findValidOne(queryOptions)
      if (existFacebookUser) {
        ctx.body = existFacebookUser
      } else {
        let _email = profile.emails && profile.emails.length > 0 && profile.emails[0] ? utils.normalizeEmail(profile.emails[0].value) : null
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
            _temp.facebookId = profile.id
            await existEmail.update({temp: _temp})
            ctx.redirect(config.api.authenticateAPI.confirmLinkFacebookPage + _email)
          } else {
            let _profile = {
              fullname: profile.displayName,
              gender: profile.gender || profile._json.gender
            }
            utils.addAvatarToProfile('facebook', 'https://graph.facebook.com/' + profile.id + '/picture?type=large', _profile)
            let createdUser = await models.User.create({
              email: _email,
              facebookId: profile.id,
              isEmailConfirmed: !0,
              profile: _profile
            })
            ctx.body = {
              success: !0,
              data: createdUser.toJSON()
            }
          }
        } else {
          throw new AppError(msg.NotReceiveInfo, msg.UnprocessableEntity)
        }
      }
    })(ctx, _next)
  } catch (err) {
    utils.trackError(err, fileName, 'signInFacebookCallback')
    throw err
  }
}

auth.confirmLinkFacebook = async (ctx, _next) => {
  const body = ctx.request.body
  try {
    body.email = utils.normalizeEmail(body.email)
    validator.validateEmail(ctx)
    validator.validatePassword(ctx)
    if (ctx.errors) {
      throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
    }
    let account = await models.User.User.findValidOne({ where: {email: body.email}, attributes: ['id', 'password', 'temp'] })
    if (!account) {
      throw new AppError('This email doesn\'t exist.', msg.UnprocessableEntity)
    }
    let isInvalidate = account.isInvalidate(true)
    if (isInvalidate) {
      throw new AppError(isInvalidate, msg.UnprocessableEntity)
    }
    let password = account.get('password')
    if (!password) {
      throw new AppError('Before process this action. You need to create password for this account.', msg.UnprocessableEntity)
    }
    let isMatch = await models.User.comparePassword(body.password, account.get('password'))
    if (!isMatch) {
      throw new AppError('Your password isn\'t match', msg.UnprocessableEntity)
    }
    let _temp = account.get('temp')
    if (!(_temp && _temp.facebookId)) {
      throw new AppError('This account doesn\'t link to any Facebook Account', msg.UnprocessableEntity)
    }
    let _facebookId = _temp.facebookId
    delete _temp.facebookId
    await account.update({
      facebookId: _facebookId,
      temp: _temp
    })
    ctx.body = {
      success: !0,
      data: account.toJSON()
    }
  } catch (err) {
    err && (err.fnTrack = 'confirmLinkFacebook') && (err.fileTrack = fileName)
    throw err
  }
}

module.exports = auth
