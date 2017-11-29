const config = {
  app: {
    host: process.env.HOSTNAME || 'localhost',
    port: process.env.PORT || 3000,
    name: process.env.APP_NAME || 'account service'
  },
  api: {
    accountAPI: {
      prefix: '/g/account',
      signUp: '/signup',
      forget: '/forget',
      changePassword: '/password',
      deleteAccount: '/remove',
      confirmEmail: '/confirm-email/:token',
      confirmResetPassword: '/confirm-password-reset/:token',
      confirmDeleteAccount: '/confirm-account-delete/:token'
    }
  },
  mail: {
    confirmEmailUrl: '/authenticate-email',
    passwordTokenValidFor: 15, // minutes
    emailTokenValidFor: 15, // minutes
    senderEmail: 'support@cdg.co.th',
    SMTPConfig: {
      host: process.env.SMPT_HOST || 'mailgateway.cdg.co.th',
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false // ignore self sign cert
      }
    },
    SMTPConfigDev: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'sxneepjzd23gupay@ethereal.email',
        pass: 'z4JVy8szbyTmCP4bwM'
      }
    }
  },
  logs: {
    requestLogConfig: {
      filename: './logs/req.log',
      datePattern: '/yyyy-MM/dd-',
      prepend: true,
      level: process.env.ENV === 'development' ? 'debug' : 'info',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      createTree: true,
      colorize: false
    },
    accountErrorLogConfig: {
      filename: './logs/acc.log',
      datePattern: '/yyyy-MM/dd-',
      prepend: true,
      level: 'error',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      createTree: true,
      colorize: false
    }
  }
}

config.getPort = function () {
  return this.app.port
}

config.getMailConfig = function () {
  return process.env.NODE_ENV === 'production' ? this.mail.SMTPConfig : this.mail.SMTPConfigDev
}

config.getEmailConfirmURL = function () {
  // https://gisid.co.th/g/account/confirm-email?token=dcaddf644369
  return 'https://' + this.app.host + this.api.accountAPI.prefix + this.api.accountAPI.confirmEmail.replace(':token', '')
}

config.getResetPasswordConfirmURL = function () {
  // https://gisid.co.th/g/account/confirm-password-reset?token=dcaddf644369
  return 'https://' + this.app.host + this.api.accountAPI.prefix + this.api.accountAPI.confirmResetPassword.replace(':token', '')
}

config.getLogConfig = function (name) {
  return this.logs[name]
}

config.getServiceConfig = function (name) {
  return this.api[name]
}

module.exports = config
