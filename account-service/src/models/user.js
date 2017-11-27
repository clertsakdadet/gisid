'use strict'
const bcrypt = require('bcrypt')

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
        len: [4, 50]
      },
      set (val) {
        this.setDataValue('username', val.toLowerCase())
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

  User.encryptPassword = async function (password, cb) {
    if (!password) {
      cb(new Error('Password is required.'), null)
      return
    }

    try {
      let hash = await bcrypt.hash(password, 10)
      cb(null, hash)
    } catch (err) {
      cb(new Error('Unable to hash password'), null)
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

  User.createUser = async function (ctx, user, code) {
    let msg = ''
    let emailExist = await User.findUserByEmail(user.email)
    if (emailExist) {
      msg = 'The email address you have entered is already registered.'
      if (ctx) {
        ctx.throw(code.unprocessableEntity || 422, msg)
      } else throw new Error(msg)
    }
    let usernameExist = await User.findUserByUsername(user.username)
    if (usernameExist) {
      msg = 'Username \'' + user.username + '\' isn\'t available.'
      if (ctx) {
        ctx.throw(code.unprocessableEntity || 422, msg)
      } else throw new Error(msg)
    }

    let createdUser = await User.create({
      username: user.username,
      password: user.password,
      email: user.email,
      profile: {
        fullname: user.fullname
      }
    })

    if (!createdUser) {
      msg = 'Unable to create new User Account.'
      if (ctx) {
        ctx.throw(code.unprocessableEntity || 422, msg)
      } else throw new Error(msg)
    } else {
      if (ctx) {
        ctx.body = {
          success: !0,
          message: 'Check your inbox We just emailed a confirmation link to ' + user.email + '. Click the link to complete your account set-up.'
        }
      } else return createdUser
    }
  }

  return User
}
