'use strict'
const bcrypt = require('bcryptjs')
const AppError = require('../utils/errors/appError')
const errorCode = require('../config/msgConfig.json')
const crypto = require('crypto-promise')
const config = require('../config/appConfig')
const utils = require('../utils/utils')
const minute = 60000

module.exports = (sequelize, DataTypes) => {
  const _columns = {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    profile: DataTypes.JSON,
    /*
    profile: {
      fullname: 'John Wick'
    }
    */
    tokens: DataTypes.JSON,
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isAlphanumeric: true,
        len: [4, 200]
      },
      set (val) {
        this.setDataValue('username', val.toLowerCase())
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true
      },
      set (val) {
        this.setDataValue('email', val.toLowerCase())
      }
    },
    reserve_email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      },
      set (val) {
        this.setDataValue('reserve_email', val ? val.toLowerCase() : null)
      }
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true
    },
    facebookId: {
      type: DataTypes.STRING,
      unique: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      set (val) {
        this.setDataValue('resetPasswordToken', val)
        this.setDataValue('resetPasswordExpire', val ? (Date.now() + config.mail.passwordTokenValidFor * minute) : null)
      }
    },
    resetPasswordExpire: {
      type: DataTypes.DATE
    },
    wrongPasswordCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    wrongPasswordCountExpire: {
      type: DataTypes.DATE
    },
    isEmailConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    tokenEmailConfirm: {
      type: DataTypes.STRING,
      set (val) {
        this.setDataValue('tokenEmailConfirm', val)
        this.setDataValue('tokenEmailConfirmExpire', val ? (Date.now() + config.mail.emailTokenValidFor * minute) : null)
      }
    },
    tokenEmailConfirmExpire: {
      type: DataTypes.DATE
    },
    locked: { // Lock account by admin
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    inActived: { // Deleting account
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      set (val) {
        this.setDataValue('inActived', val)
        this.setDataValue('inActivedAt', val ? Date.now() : null)
      }
    },
    inActivedAt: {
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }

  const User = sequelize.define('User', _columns)

  // Instance Method
  User.prototype.getFullName = function () {
    let profile = this.get('profile')
    return profile ? profile.fullname : ''
  }

  User.prototype.genValidConfirmEmailToken = async function () {
    try {
      let randLength = utils.getRandomIntInclusive(1, 4)
      let rand = await crypto.randomBytes(36 - randLength)
      let token = rand.toString('hex')
      await this.update({
        tokenEmailConfirm: token
      })
      return this.tokenEmailConfirm
    } catch (err) {
      throw err
    }
  }

  User.prototype.getValidResetPasswordToken = async function (renew) {
    try {
      if (renew || !(this.resetPasswordToken && this.resetPasswordExpire > Date.now())) {
        let randLength = utils.getRandomIntInclusive(1, 4)
        let rand = await crypto.randomBytes(36 - randLength)
        let token = rand.toString('hex')
        await this.update({
          resetPasswordToken: token
        })
      }
      return this.resetPasswordToken
    } catch (err) {
      throw err
    }
  }

  User.prototype.isInvalidate = function (ignoreEmail, ignoreDelete, ignoreLock) {
    if (!ignoreDelete && this.inActived) return 'This account has been deactivated.'
    if (!ignoreLock && this.locked) return 'This account is now locked.'
    if (!ignoreEmail && !this.isEmailConfirmed) return 'This account not yet confirmed your email address.'
    return ''
  }

  // Class Method
  User.encryptPassword = async function (password) {
    if (!password) {
      throw new AppError('Password is required.', errorCode.UnprocessableEntity)
    }
    try {
      let hash = await bcrypt.hash(password, 10)
      if (!hash) {
        throw new AppError('Unable to hash password.')
      } else {
        return hash
      }
    } catch (err) {
      throw err
    }
  }

  User.comparePassword = async function (password, hashPassword) {
    if (!password && hashPassword) {
      throw new AppError('Password is required.', errorCode.UnprocessableEntity)
    }
    try {
      let compare = await bcrypt.compare(password, hashPassword)
      if (!compare) {
        throw new AppError('Password isn\'t match')
      } else {
        return compare
      }
    } catch (err) {
      throw err
    }
  }

  User.findUserByEmail = async function (_email) {
    let user = await User.findValidOne({ where: {email: _email}, attributes: ['id'] })
    return user
  }

  User.findUserByUsername = async function (_username) {
    let user = await User.findValidOne({ where: {username: _username}, attributes: ['id'] })
    return user
  }

  User.findValidOne = async function (options) {
    if (options && options.attributes && options.attributes instanceof Array) {
      let attr = options.attributes
      if (!attr.includes('id')) attr.push('id')
      if (!attr.includes('isEmailConfirmed')) attr.push('isEmailConfirmed')
      if (!attr.includes('inActived')) attr.push('inActived')
      if (!attr.includes('locked')) attr.push('locked')
    }
    let res = await User.findOne(options)
    return res
  }

  User.createUser = async function (user) {
    try {
      let emailExist = await User.findUserByEmail(user.email)
      if (emailExist) {
        throw new AppError('The email address you have entered is already registered.', errorCode.DataAlreadyExists)
      }
      let usernameExist = await User.findUserByUsername(user.username)
      if (usernameExist) {
        throw new AppError('Username \'' + user.username + '\' isn\'t available.', errorCode.DataAlreadyExists)
      }

      let encryptPassword = await User.encryptPassword(user.password)
      let createdUser = await User.create({
        username: user.username,
        password: encryptPassword,
        email: user.email,
        profile: {
          fullname: user.fullname
        }
      })

      if (!createdUser) {
        throw new AppError('Unable to create new User Account.')
      } else {
        return createdUser
      }
    } catch (err) {
      throw err
    }
  }

  User.activeEmail = async function (token) {
    try {
      let tokenValid = await User.findValidOne({
        where: {
          tokenEmailConfirm: token,
          tokenEmailConfirmExpire: { $gt: new Date() }
        },
        attributes: ['id', 'email', 'isEmailConfirmed', 'reserve_email']
      })
      if (!tokenValid) {
        throw new AppError('Token is invalid or expired.', errorCode.UnprocessableEntity)
      }
      let isInvalidate = tokenValid.isInvalidate(true)
      if (isInvalidate) {
        throw new AppError(isInvalidate, errorCode.UnprocessableEntity)
      }
      let active
      let reserveEmail = tokenValid.get('reserve_email')
      if (reserveEmail) {
        // case confirm email that user changed
        active = await tokenValid.update({
          email: reserveEmail,
          reserve_email: null,
          tokenEmailConfirm: null
        })
      } else {
        if (tokenValid.get('isEmailConfirmed')) {
          throw new AppError('The Email address is already verified.', errorCode.UnprocessableEntity)
        }
        active = await tokenValid.update({
          isEmailConfirmed: !0,
          tokenEmailConfirm: null
        })
      }
      if (!active) {
        throw new AppError('Unable to active email adress.')
      }
      return tokenValid.get('email')
    } catch (err) {
      throw err
    }
  }

  return User
}
