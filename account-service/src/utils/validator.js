// Document: https://github.com/RocksonZeta/koa-validate
const validator = {}

validator.validateUsername = (ctx, isGet) => {
  let field = 'username'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(4, 20, 'Username must be at least 4 characters.')
  .isAlphanumeric('Username not accepting special characters.')
}

validator.validatePassword = (ctx, isGet) => {
  let field = 'password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(6, 20, 'Password must be at least 4 characters.')
}

validator.validateCurrentPassword = (ctx, isGet) => {
  let field = 'current_password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.notEmpty('Current password is required.')
}

validator.validateConfirmPassword = (ctx, password, isGet) => {
  let field = 'confirm_password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.eq(password, 'Passwords must match.')
}

validator.validateEmail = (ctx, isGet) => {
  let field = 'email'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.isEmail('Please enter a valid email address.')
}

validator.validateFullname = (ctx, isGet) => {
  let field = 'fullname'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(4, 20, 'Full name must be at least 4 characters.')
}

validator.validateToken = (ctx, isGet) => {
  let field = 'token'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.notEmpty('Token is required.')
}

validator.validateAccountID = (ctx, isGet) => {
  let field = 'id'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.notEmpty('id is required.').isUUID('id is invalid', 4)
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
