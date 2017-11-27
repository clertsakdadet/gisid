'use strict'
const bcrypt = require('bcryptjs')
const AppError = require('../utils/errors/appError')
const errorCode = require('../config/msgConfig.json')
const logger = require('../utils/logger/account_log')

module.exports = (sequelize, DataTypes) => {
  const _columns = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    profile: DataTypes.JSON,
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
    googleId: {
      type: DataTypes.STRING,
      unique: true
    },
    facebookId: {
      type: DataTypes.STRING,
      unique: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE
    },
    resetPasswordToken: {
      type: DataTypes.STRING
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
      type: DataTypes.STRING
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
      defaultValue: false
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

  User.encryptPassword = async function (password) {
    if (!password) {
      throw new AppError('Password is required.', errorCode.unprocessableEntity)
    }
    try {
      let hash = await bcrypt.hash(password, 10)
      logger.info('Start encryptPassword5')
      if (!hash) {
        logger.info('Start encryptPassword6')
        throw new AppError('Unable to hash password.')
      } else {
        logger.info('Start encryptPassword7')
        return hash
      }
    } catch (err) {
      logger.info('Start encryptPassword8')
      throw err
    }
  }

  User.findUserByEmail = async function (_email) {
    let user = await User.findOne({ where: {email: _email}, attributes: ['id'] })
    return user
  }

  User.findUserByUsername = async function (_username) {
    let user = await User.findOne({ where: {username: _username}, attributes: ['id'] })
    return user
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

      logger.info('Start encryptPassword')
      let encryptPassword = await User.encryptPassword(user.password)

      logger.info('Start createdUser')
      let createdUser = await User.create({
        username: user.username,
        password: encryptPassword,
        email: user.email,
        profile: {
          fullname: user.fullname
        }
      })
      logger.info('Done')

      if (!createdUser) {
        throw new AppError('Unable to create new User Account.')
      } else {
        return createdUser
      }
    } catch (err) {
      if (!(err instanceof AppError) && err.message) {
        logger.error(err)
      }
      throw err
    }
  }

  return User
}
