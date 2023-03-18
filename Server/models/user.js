'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      User.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        id: 'id',
        onDelete: 'CASCADE',
      });

      User.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        as: 'referral',
      });

      User.hasOne(models.Refferal, {
        foreignKey: 'placement_id',
        id:'id',
        as: 'placement_user',
      });

      User.hasOne(models.Refferal, {
        foreignKey: 'placement_id',
        as: 'both_user',
      });

      User.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        sourceKey: 'left',
        as: 'left_placement',
      });
      User.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        sourceKey: 'right',
        as: 'right_placement',
      });
      User.hasOne(models.wallet,{
        foreignKey:'user_id',
        id:'id'
      })
      User.hasOne(models.Pakage,{
        foreignKey:'user_id',
        id:'id'
      })
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    left: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    right: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pkg: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};