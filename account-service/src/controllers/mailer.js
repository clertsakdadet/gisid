const nodemailer = require('nodemailer')
const logger = require('../utils/logger/account_log')
const config = require('../config/appConfig')
const AppError = require('../utils/errors/appError')

const mailConfig = config.getMailConfig()
const mailTransporter = nodemailer.createTransport(mailConfig)

const sentEmail = async (_from, _to, _subject, _text) => {
  try {
    let success = await mailTransporter.sendMail({
      from: _from,
      to: _to,
      subject: _subject,
      text: _text
    })
    return success
  } catch (err) {
    if (err.message) {
      logger.error(err)
    }
    throw new AppError('Unable to send an email.')
  }
}

const sentConfirmEmail = async (email, token) => {
  let emailConfirmUrl = config.getEmailConfirmURL()
  let subject = 'Email address confirmation'
  let text = 'Click the link below to confirm your email and finish creating your account.\n\n\n\n' +
  'This link will expire in ' + config.mail.confirmTokenValidFor + ' minutes and can only be used once.\n\n' +
  emailConfirmUrl + '?token=' + token + '\n\n'

  let res = await sentEmail(config.mail.senderEmail, email, subject, text)
  return res
}

module.exports = {
  sentConfirmEmail
}
