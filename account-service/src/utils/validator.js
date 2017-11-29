// Document: https://github.com/RocksonZeta/koa-validate

function validateUsername (ctx, isGet) {
  let field = 'username'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(4, 20, 'Username must be at least 4 characters.')
  .isAlphanumeric('Username not accepting special characters.')
}

function validatePassword (ctx, isGet) {
  let field = 'password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(6, 20, 'Password must be at least 4 characters.')
}

function validateConfirmPassword (ctx, password, isGet) {
  let field = 'confirm_password'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.eq(password, 'Passwords must match.')
}

function validateEmail (ctx, isGet) {
  let field = 'email'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.isEmail('Please enter a valid email address.')
}

function validateFullname (ctx, isGet) {
  let field = 'fullname'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.len(4, 20, 'Full name must be at least 4 characters.')
}

function validateToken (ctx, isGet) {
  let field = 'token'
  let chk = isGet ? ctx.checkParams(field) : ctx.checkBody(field)
  chk.notEmpty('Token is required.')
}

module.exports = {
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
  validateFullname,
  validateToken
}
