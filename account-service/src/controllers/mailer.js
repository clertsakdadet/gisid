const nodemailer = require('nodemailer')
const winston = require('winston')
const crypto = require('crypto-promise')
const config = require('../config/appConfig')

let mailConfig

if (process.env.MAIL_TYPE === 'SMTP') {
  mailConfig = config.getMailConfig('SMTPConfig')
  winston.log('info', 'Using SMTP Mail Server.')
} else {
  mailConfig = config.getMailConfig('gmailConfig')
  winston.log('info', 'Using GMAIL Mail Server.')
}

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
    return new Error('Unable to send an email.')
  }
}

const sentConfirmEmail = async (email) => {
  let rand = await crypto.randomBytes(12)
  let token = rand.toString('hex')
  let emailConfirmUrl = config.getEmailConfirmURL()
  let subject = 'Email address confirmation'
  let text = 'Click the link below to confirm your email and finish creating your Medium account.\n\n\n\n' +
  'This link will expire in 15 minutes and can only be used once.\n\n' +
  emailConfirmUrl + '?token=' + token + '\n\n'

  let res = await sentEmail(mailConfig.auth.user, email, subject, text)
  return res
}

module.exports = {
  sentConfirmEmail
}
