const nodemailer = require('nodemailer')
const logger = require('../utils/logger/account_log')
const config = require('../config/appConfig')
// const AppError = require('../utils/errors/appError')

const mailConfig = config.getMailConfig()
const mailTransporter = nodemailer.createTransport(mailConfig)

const sentEmail = async (_from, _to, _subject, _text) => {
  mailTransporter.sendMail({
    from: _from,
    to: _to,
    subject: _subject,
    text: _text
  }, (err, info) => {
    if (err && err.message) {
      logger.error(err)
    }
  })
}

const sentConfirmEmail = async (email, token) => {
  let subject = 'Email address confirmation'
  let text = 'Click the link below to confirm your email and finish creating your account.\n\n\n\n' +
  'This link will expire in ' + config.mail.emailTokenValidFor + ' minutes and can only be used once.\n\n' +
  config.getEmailConfirmURL() + token + '\n\n'
  sentEmail(config.mail.senderEmail, email, subject, text)
}

const sentConfirmResetPassword = async (user, token) => {
  let subject = 'Password Reset'
  let text = user.getFullName() + ',\n\n' +
  'We received a request to change your password.\n\n' +
  'Click the link below to set a new password:\n\n' +
  config.getResetPasswordConfirmURL() + token + '\n\n' +
  'If you didn\'t mean to reset your password. then you can just ignore this email, your password will not change.'
  sentEmail(config.mail.senderEmail, user.get('email'), subject, text)
}

module.exports = {
  sentConfirmEmail,
  sentConfirmResetPassword
}
