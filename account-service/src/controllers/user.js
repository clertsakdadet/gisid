const userController = {}
const fileName = __filename.slice(__dirname.length + 1)
const fs = require('fs-extra')
const path = require('path')
const models = require('../models')
const msg = require('../config/msgConfig.json')
const AppError = require('../utils/errors/appError')
const mailer = require('./mailer')
const validator = require('../utils/validator')
const utils = require('../utils/utils')
const sharp = require('sharp')
const config = require('../config/appConfig')

userController.confirmEmail = async (ctx, _next) => {
  const token = ctx.params.token
  validator.validateToken(ctx, !0)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
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

userController.signUp = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateFullname(ctx)
  validator.validateUsername(ctx)
  validator.validatePassword(ctx)
  validator.validateEmail(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      body.email = utils.normalizeEmail(body.email)
      let user = await models.User.createUser(body)
      let token = await user.genValidConfirmEmailToken()
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

userController.forgetPassword = async (ctx, _next) => {
  const body = ctx.request.body
  try {
    let username = body.username
    let email = utils.normalizeEmail(body.email)
    if (!username && !email) {
      throw new AppError('Username or Email is required.', msg.UnprocessableEntity)
    }
    let options = { where: { }, attributes: ['id', 'email', 'profile'] }
    if (username) options.where.username = username
    else {
      options.where.email = email
    }
    let account = await models.User.findValidOne(options)
    if (!account) {
      throw new AppError('This account doesn\'t exist.', msg.UnprocessableEntity)
    }
    let isInvalidate = account.isInvalidate()
    if (isInvalidate) {
      throw new AppError(isInvalidate, msg.UnprocessableEntity)
    }
    let token = await account.getValidResetPasswordToken(!0)
    mailer.sentConfirmResetPassword(account, token)
    ctx.body = {
      success: !0,
      message: 'An email has been sent to ' + email + ' with further instructions on how to reset your password.'
    }
  } catch (err) {
    throw err
  }
}

userController.confirmPasswordReset = async (ctx, _next) => {
  const token = ctx.params.token
  validator.validateToken(ctx, !0)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let tokenValid = await models.User.findValidOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpire: { $gt: new Date() }
        },
        attributes: ['username', 'email']
      })
      if (!tokenValid) {
        throw new AppError('Token is invalid or expired.', msg.UnprocessableEntity)
      }
      let isInvalidate = tokenValid.isInvalidate()
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      ctx.body = {
        success: !0,
        username: tokenValid.get('username'),
        email: tokenValid.get('email')
      }
    } catch (err) {
      throw err
    }
  }
}

userController.resetPassword = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateToken(ctx)
  validator.validatePassword(ctx)
  validator.validateConfirmPassword(ctx, body.password)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
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
        throw new AppError('Token is invalid or expired.', msg.UnprocessableEntity)
      }
      let isInvalidate = tokenValid.isInvalidate()
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      let encryptPassword = await models.User.encryptPassword(body.password)
      await tokenValid.update({ password: encryptPassword, resetPasswordToken: null })
      ctx.body = {
        success: !0,
        message: 'Your password has been changed successfully! Thank you.'
      }
    } catch (err) {
      throw err
    }
  }
}

userController.deleteAccount = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateUsername(ctx)
  validator.validatePassword(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let account = await models.User.findValidOne({
        where: {
          username: body.username
        },
        attributes: ['id', 'password']
      })
      if (!account) {
        throw new AppError('This account doesn\'t exist', msg.UnprocessableEntity)
      }
      let isInvalidate = account.isInvalidate(true, false, true)
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      let isMatch = await models.User.comparePassword(body.password, account.get('password'))
      if (!isMatch) {
        throw new AppError('Your password isn\'t match', msg.UnprocessableEntity)
      }
      await account.update({ inActived: !0 })
      ctx.body = {
        success: !0,
        message: 'Your account has been successfully deleted'
      }
    } catch (err) {
      throw err
    }
  }
}

userController.updatePassword = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateAccountID(ctx)
  validator.validateCurrentPassword(ctx)
  validator.validatePassword(ctx)
  validator.validateConfirmPassword(ctx, body.password)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let account = await models.User.findValidOne({
        where: {
          uuid: body.id
        },
        attributes: ['id', 'password']
      })
      if (!account) {
        throw new AppError('This account doesn\'t exist', msg.UnprocessableEntity)
      }
      let isInvalidate = account.isInvalidate(true)
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      let password = account.get('password')
      if (!password) {
        throw new AppError('Before process this action. You need to create password for this account.', msg.UnprocessableEntity)
      }
      let isMatch = await models.User.comparePassword(body.current_password, account.get('password'))
      if (!isMatch) {
        throw new AppError('Your password isn\'t match', msg.UnprocessableEntity)
      }
      let encryptPassword = await models.User.encryptPassword(body.password)
      await account.update({ password: encryptPassword })
      ctx.body = {
        success: !0,
        message: 'Your password has been successfully updated.'
      }
    } catch (err) {
      throw err
    }
  }
}

userController.createPassword = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateAccountID(ctx)
  validator.validatePassword(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let account = await models.User.findValidOne({
        where: {
          uuid: body.id
        },
        attributes: ['id', 'username', 'email', 'password']
      })
      if (!account) {
        throw new AppError('This account doesn\'t exist.', msg.UnprocessableEntity)
      }
      let isInvalidate = account.isInvalidate(true)
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      let password = account.get('password')
      if (password) {
        throw new AppError('This account is already created password.', msg.DataAlreadyExists)
      }
      let username = account.get('username')
      let email = account.get('email')
      if (!username && !email) {
        throw new AppError('Username or Email is required.', msg.UnprocessableEntity)
      }
      let encryptPassword = await models.User.encryptPassword(body.password)
      await account.update({ password: encryptPassword })
      ctx.body = {
        success: !0,
        message: 'Your password has been successfully created.'
      }
    } catch (err) {
      throw err
    }
  }
}

userController.unlinkGoogle = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateAccountID(ctx)
  validator.validatePassword(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let account = await models.User.findValidOne({
        where: {
          uuid: body.id
        },
        attributes: ['id', 'username', 'email', 'password', 'googleId']
      })
      if (!account) {
        throw new AppError('This account doesn\'t exist.', msg.UnprocessableEntity)
      }
      let isInvalidate = account.isInvalidate(true)
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      let gmailAcc = account.get('googleId')
      if (!gmailAcc) {
        throw new AppError('This account doesn\'t link to any Google account.', msg.UnprocessableEntity)
      }
      let username = account.get('username')
      let email = account.get('email')
      if (!username && !email) {
        throw new AppError('Username or Email is required.', msg.UnprocessableEntity)
      }
      let password = account.get('password')
      if (!password) {
        throw new AppError('Before process this action. You need to create password for this account.', msg.UnprocessableEntity)
      }
      let isMatch = await models.User.comparePassword(body.password, account.get('password'))
      if (!isMatch) {
        throw new AppError('Your password isn\'t match', msg.UnprocessableEntity)
      }
      await account.update({ googleId: null })
      ctx.body = {
        success: !0,
        message: 'Your linked Gmail accounts has been successfully removed.'
      }
    } catch (err) {
      throw err
    }
  }
}

userController.unlinkFacebook = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateAccountID(ctx)
  validator.validatePassword(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      let account = await models.User.findValidOne({
        where: {
          uuid: body.id
        },
        attributes: ['id', 'username', 'email', 'password', 'facebookId']
      })
      if (!account) {
        throw new AppError('This account doesn\'t exist.', msg.UnprocessableEntity)
      }
      let isInvalidate = account.isInvalidate(true)
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      let gmailAcc = account.get('facebookId')
      if (!gmailAcc) {
        throw new AppError('This account doesn\'t link to any Facebook account.', msg.UnprocessableEntity)
      }
      let username = account.get('username')
      let email = account.get('email')
      if (!username && !email) {
        throw new AppError('Username or Email is required.', msg.UnprocessableEntity)
      }
      let password = account.get('password')
      if (!password) {
        throw new AppError('Before process this action. You need to create password for this account.', msg.UnprocessableEntity)
      }
      let isMatch = await models.User.comparePassword(body.password, account.get('password'))
      if (!isMatch) {
        throw new AppError('Your password isn\'t match', msg.UnprocessableEntity)
      }
      await account.update({ facebookId: null })
      ctx.body = {
        success: !0,
        message: 'Your linked Facebook accounts has been successfully removed.'
      }
    } catch (err) {
      throw err
    }
  }
}

userController.updateAccount = async (ctx, _next) => {
  const body = ctx.request.body
  validator.validateAccountID(ctx)
  validator.validateUsername(ctx)
  validator.validateEmail(ctx)
  validator.validateFullname(ctx)
  validator.validatePassword(ctx)

  if (ctx.errors) {
    throw new AppError('Validation Failed.', msg.UnprocessableEntity, ctx.errors)
  } else {
    try {
      body.email = utils.normalizeEmail(body.email)
      let account = await models.User.findValidOne({
        where: {
          id: body.id
        },
        attributes: ['id', 'email', 'profile', 'reserve_email', 'password']
      })
      if (!account) {
        throw new AppError('This account doesn\'t exist', msg.UnprocessableEntity)
      }
      let isInvalidate = account.isInvalidate()
      if (isInvalidate) {
        throw new AppError(isInvalidate, msg.UnprocessableEntity)
      }
      let isMatch = await models.User.comparePassword(body.password, account.get('password'))
      if (!isMatch) {
        throw new AppError('Your password isn\'t match', msg.UnprocessableEntity)
      }
      let userExist = await models.User.findValidOne({
        where: {
          username: body.username
        },
        attributes: ['id']
      })
      if (userExist && userExist.get('id') !== body.id) {
        throw new AppError('Username has already been taken.', msg.DataAlreadyExists)
      }
      let emailExist = await models.User.findValidOne({
        where: {
          email: body.email
        },
        attributes: ['id']
      })
      if (emailExist && emailExist.get('id') !== body.id) {
        throw new AppError('Email has already been taken.', msg.DataAlreadyExists)
      }
      let _profile = account.get('profile')
      if (!_profile) _profile = {}
      _profile.fullname = body.fullname

      if (account.get('email') === body.email) {
        await account.update({
          email: body.email,
          username: body.username,
          profile: _profile
        })
      } else {
        // Case Email has been changed
        await account.update({
          reserve_email: body.email,
          username: body.username,
          profile: _profile
        })
        let token = await account.genValidConfirmEmailToken()
        mailer.sentConfirmEmail(account.get('reserve_email'), token)
        ctx.body = {
          success: !0,
          message: 'Check your inbox We just emailed a confirmation link to ' + body.email + '. Click the link to complete your account set-up.'
        }
      }
      ctx.body = {
        success: !0,
        message: 'Check your inbox We just emailed a confirmation link to ' + body.email + '. Click the link to complete your account set-up.'
      }
    } catch (err) {
      throw err
    }
  }
}

userController.uploadAvatar = async (ctx, _next) => {
  const body = ctx.req.body
  try {
    if (!(body && body.id)) {
      throw new AppError(msg.ValidateFail, msg.UnprocessableEntitys)
    }
    let fileName = ctx.req.file.filename
    let filePath = ctx.req.file.path
    let dir = path.join(utils.getRootPath(), config.path.upload, body.id)
    await fs.ensureDir(dir)
    //let resize = await sharp(filePath).resize(180).toFile(path.join(dir, fileName))
    let resize = await sharp(filePath).extract({
      left: parseInt(body.left),
      top: parseInt(body.top),
      width: parseInt(body.width),
      height: parseInt(body.height)}).resize(180).toFile(path.join(dir, fileName))
    sharp.cache(!1)
    await fs.remove(filePath)
    ctx.body = {
      success: resize ? !0 : !1
    }
  } catch (err) {
    utils.trackError(err, fileName, 'uploadAvatar')
    throw err
  }
}

module.exports = userController
