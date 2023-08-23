'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull:true
      },
      username: {
        type: Sequelize.STRING,
        allowNull:true
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull:true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull:true
      },
      left: {
        type: Sequelize.STRING,
        allowNull:true
      },
      right: {
        type: Sequelize.STRING,
        allowNull:true
      },
      refferal: {
        type: Sequelize.INTEGER,
        allowNull:true
      },
      refferal_code: {
        type: Sequelize.STRING,
        allowNull:true
      },
      pkg: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull:false
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profiles');
  }
};