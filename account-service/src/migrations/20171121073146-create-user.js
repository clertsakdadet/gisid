'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
      },
      profile: Sequelize.JSON,
      temp: Sequelize.JSON,
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      reserve_email: {
        type: Sequelize.STRING
      },
      googleId: {
        type: Sequelize.STRING
      },
      facebookId: {
        type: Sequelize.STRING
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
