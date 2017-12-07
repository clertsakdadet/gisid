const config = {
  app: {
    host: process.env.HOSTNAME || 'dev.cdg.co.th',
    port: process.env.PORT || 3000,
    name: process.env.APP_NAME || 'account service'
  },
  api: {
    accountAPI: {
      prefix: '/g/account',
      signUp: '/signup',
      forget: '/forget',
      delete: '/delete',
      updateAccount: '/update',
      updatePassword: '/update-password',
      createPassword: '/create-password',
      resetPassword: '/reset-password',
      deleteAccount: '/remove',
      confirmEmail: '/confirm-email/:token',
      confirmResetPassword: '/confirm-password-reset/:token',
      checkUserAvailable: '/username_available',
      checkEmailAvailable: '/email_available',
      unlinkGoogle: '/unlink-google'
    },
    authenticateAPI: {
      prefix: '/g/auth',
      signIn: '/login',
      signInWithGoogle: '/google',
      googleCallback: '/google/callback',
      confirmLinkGoogle: '/google/verify-password',
      confirmLinkGooglePage: '/verify-with-password/google-oauth2/'
    }
  },
  auth: {
    googleAuth: {
      clientID: process.env.GOOGLE_CLIENT_ID || '525584271682-l9q7af7ts8oimsa7oe9qtv3v6br5r4qf.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SETCRET || 'fZRn86w5knk2wSPoDsJbFUW3'
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

config.getPassportGoogleConfig = function () {
  // callbackURL: https://gisid.co.th/g/auth/google/callback
  return {
    clientID: this.auth.googleAuth.clientID,
    clientSecret: this.auth.googleAuth.clientSecret,
    callbackURL: 'http://' + this.app.host + this.api.authenticateAPI.prefix + this.api.authenticateAPI.googleCallback,
    passReqToCallback: true
  }
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
