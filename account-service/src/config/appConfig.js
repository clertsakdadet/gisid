const config = {
  app: {
    host: process.env.HOSTNAME || 'localhost',
    port: process.env.PORT || 3000,
    name: process.env.APP_NAME || 'account service'
  },
  mail: {
    confirmEmailUrl: '/authenticate-email',
    SMTPConfig: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMPT_ACC || 'sxneepjzd23gupay@ethereal.email',
        pass: process.env.SMPT_PW || 'z4JVy8szbyTmCP4bwM'
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
  },
  api: {
    accountAPI: {
      prefix: '/g/account',
      signUp: '/signup',
      confirmEmail: '/confirm-email'
    }
  }
}

config.getPort = function () {
  return this.app.port
}

config.getMailConfig = function (type) {
  return this.mail[type]
}

config.getEmailConfirmURL = function () {
  // https://gisid.co.th/g/account/confirm-email?token=dcaddf644369
  return 'https://' + this.app.host + this.api.accountAPI.prefix + this.api.accountAPI.confirmEmail
}

config.getLogConfig = function (name) {
  return this.logs[name]
}

config.getServiceConfig = function (name) {
  return this.api[name]
}

module.exports = config
