'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profile: Sequelize.JSON,
      tokens: Sequelize.JSON,
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      googleId: {
        type: Sequelize.STRING,
        unique: true
      },
      facebookId: {
        type: Sequelize.STRING,
        unique: true
      },
      resetPasswordToken: {
        type: Sequelize.STRING
      },
      resetPasswordExpire: {
        type: Sequelize.DATE
      },
      wrongPasswordCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      wrongPasswordCountExpire: {
        type: Sequelize.DATE
      },
      isEmailConfirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      tokenEmailConfirm: {
        type: Sequelize.STRING
      },
      tokenEmailConfirmExpire: {
        type: Sequelize.DATE
      },
      locked: { // Lock account by admin
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      inActived: { // Deleting account
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      inActivedAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
