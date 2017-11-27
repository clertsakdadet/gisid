const models = require('../models')
const errorCode = require('../config/msgConfig.json')

const signUp = async (ctx, _next) => {
  const body = ctx.request.body

  ctx.checkBody('fullname')
  .len(4, 20, 'Full name must be at least 4 characters.')
  .isAlphanumeric('Username not accepting special characters.')
  ctx.checkBody('username').len(4, 20, 'Username must be at least 4 characters.')
  ctx.checkBody('password').len(6, 20, 'Password must be at least 4 characters.')
  ctx.checkBody('email').isEmail('Please enter a valid email address.')

  if (ctx.errors) {
    ctx.throw(errorCode.unprocessableEntity, {message: 'Validation Failed.', causes: ctx.errors})
  } else {
    await models.User.createUser(ctx, body, errorCode.unprocessableEntity)
  }
}

module.exports = {
  signUp
}
