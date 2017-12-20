// Document: https://github.com/RocksonZeta/koa-validate
const msg = require('../config/msgConfig.json')
const validator = {}

validator.validateUsername = (ctx, isGet) => {
  let field = 'username'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(4, 20, msg.CheckUsernameLen)
  .isAlphanumeric(msg.UsernameNotAcceptSpecialChars)
}

validator.validatePassword = (ctx, isGet) => {
  let field = 'password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(6, 20, ctx.CheckPasswordLen)
}

validator.validateCurrentPassword = (ctx, isGet) => {
  let field = 'current_password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.notEmpty(msg.ReqCurrentPassword)
}

validator.validateConfirmPassword = (ctx, password, isGet) => {
  let field = 'confirm_password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.eq(password, msg.CheckMatchPassword)
}

validator.validateEmail = (ctx, isGet) => {
  let field = 'email'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.isEmail(msg.CheckValidEmail)
}

validator.validateFullname = (ctx, isGet) => {
  let field = 'fullname'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(4, 20, msg.CheckFullNameLen)
}

validator.validateToken = (ctx, isGet) => {
  let field = 'token'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.notEmpty(msg.ReqToken)
}

validator.validateAccountID = (ctx, isGet) => {
  let field = 'id'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.notEmpty(msg.ReqID).isUUID(msg.CheckValidID, 4)
}

validator.enableSecureFields = (options) => {
  if (options && options.attributes && options.attributes instanceof Array) {
    let attr = options.attributes
    if (!attr.includes('id')) attr.push('id')
    if (!attr.includes('isEmailConfirmed')) attr.push('isEmailConfirmed')
    if (!attr.includes('inActived')) attr.push('inActived')
    if (!attr.includes('locked')) attr.push('locked')
  }
}

validator.onlyActive = (options) => {
  if (!options) options = {}
  if (!options.where) options.where = {}
  options.where.inActived = !1
  options.where.locked = !1
}

module.exports = validator
