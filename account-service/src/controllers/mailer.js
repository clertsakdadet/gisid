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
  'This link will expire in ' + config.mail.confirmTokenValidFor + ' minutes and can only be used once.\n\n' +
  config.getEmailConfirmURL() + token + '\n\n'
  sentEmail(config.mail.senderEmail, email, subject, text)
}

module.exports = {
  sentConfirmEmail
}
