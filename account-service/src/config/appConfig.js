const config = {
  app: {
    host: process.env.HOSTNAME || 'dev.cdg.co.th',
    port: process.env.PORT || 3000,
    name: process.env.APP_NAME || 'account service'
  },
  web: {
    domain: process.env.WEB_DOMAIN || 'dev.cdg.co.th',
    confirmEmailPage: '/confirm-email',
    confirmResetPasswordPage: 'confirm-password-reset'
  },
  path: {
    upload: '/upload'
  },
  api: {
    accountAPI: {
      prefix: '/g/account',
      signUp: '/signup',
      forget: '/forget',
      delete: '/delete',
      uploadAvatar: '/upload/avatar',
      updateAccount: '/update',
      updatePassword: '/update-password',
      createPassword: '/create-password',
      resetPassword: '/reset-password',
      deleteAccount: '/remove',
      confirmEmail: '/confirm-email/:token',
      confirmResetPassword: '/confirm-password-reset/:token',
      checkUserAvailable: '/username_available',
      checkEmailAvailable: '/email_available',
      unlinkGoogle: '/unlink-google',
      unlinkFacebook: '/unlink-facebook'
    },
    authenticateAPI: {
      prefix: '/g/auth',
      signIn: '/login',
      signInWithGoogle: '/google',
      googleCallback: '/google/callback',
      confirmLinkGoogle: '/google/verify-password',
      confirmLinkGooglePage: '/verify-with-password/google-oauth2/',
      signInWithFacebook: '/facebook',
      facebookCallback: '/facebook/callback',
      confirmLinkFacebook: '/facebook/verify-password',
      confirmLinkFacebookPage: '/verify-with-password/facebook-oauth2/'
    },
    checkAPI: {
      prefix: '/g/check',
      versions: '/version'
    }
  },
  auth: {
    googleAuth: {
      clientID: process.env.GOOGLE_CLIENT_ID || '525584271682-l9q7af7ts8oimsa7oe9qtv3v6br5r4qf.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'fZRn86w5knk2wSPoDsJbFUW3'
    },
    facebookAuth: {
      clientID: process.env.FACEBOOK_CLIENT_ID || '512865165757780',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '1ec37c38f335266e750f5c8a0f3be8b9'
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
        user: 'tdfoeettzxxgoszb@ethereal.email',
        pass: 'BxmzvYv1TNGfsWaZP1'
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

config.getPassportGoogleConfig = function () {
  // callbackURL: https://gisid.co.th/g/auth/google/callback
  return {
    clientID: this.auth.googleAuth.clientID,
    clientSecret: this.auth.googleAuth.clientSecret,
    callbackURL: 'http://' + this.app.host + this.api.authenticateAPI.prefix + this.api.authenticateAPI.googleCallback,
    passReqToCallback: true
  }
}

config.getPassportFacebookConfig = function () {
  // callbackURL: https://gisid.co.th/g/auth/facebook/callback
  return {
    clientID: this.auth.facebookAuth.clientID,
    clientSecret: this.auth.facebookAuth.clientSecret,
    callbackURL: 'http://' + this.app.host + this.api.authenticateAPI.prefix + this.api.authenticateAPI.facebookCallback,
    profileFields: ['id', 'email', 'first_name', 'last_name', 'displayName', 'photos'],
    passReqToCallback: true,
    enableProof: true
    // authOptions: { scope: ['email', 'user_location'] }
    // profileURL: 'https://graph.facebook.com/v2.11/me',
    // authorizationURL: 'https://www.facebook.com/v2.11/dialog/oauth',
    // tokenURL: 'https://graph.facebook.com/v2.11/oauth/access_token'
  }
}

config.getWebPageUrl = function (page) {
  return 'https://' + this.web.domain + (this.web[page] ? this.web[page] : '/error')
}

config.getLogConfig = function (name) {
  return this.logs[name]
}

config.getServiceConfig = function (name) {
  return this.api[name]
}

module.exports = config
