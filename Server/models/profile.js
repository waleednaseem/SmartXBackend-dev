'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      Profile.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        id: 'id',
        onDelete: 'CASCADE',
      });

      Profile.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        as: 'referral',
        onDelete: 'CASCADE',
      });

      Profile.hasOne(models.Refferal, {
        foreignKey: 'placement_id',
        id:'id',
        onDelete: 'CASCADE',
        as: 'placement_user',
      });

      Profile.hasOne(models.Refferal, {
        foreignKey: 'placement_id',
        as: 'both_user',
        onDelete: 'CASCADE',
      });

      Profile.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        sourceKey: 'left',
        onDelete: 'CASCADE',
        as: 'left_placement',
      });
      Profile.hasOne(models.Refferal, {
        foreignKey: 'user_id',
        sourceKey: 'right',
        onDelete: 'CASCADE',
        as: 'right_placement',
      });
      Profile.hasOne(models.wallet,{
        foreignKey:'user_id',
        sourceKey:'user_id',
        onDelete: 'CASCADE',
      })
      Profile.hasOne(models.Pakage,{
        foreignKey:'user_id',
        sourceKey:'user_id',
        onDelete: 'CASCADE',
      })
      Profile.hasOne(models.Upgrade,{
        foreignKey:'profile_id',
        id:'id',
        onDelete: 'CASCADE',
      })
      Profile.hasOne(models.Refferal, {
        foreignKey: 'refferal',
        id: 'id',
        as:'Reff',
        onDelete: 'CASCADE',
      });
      Profile.belongsTo(models.User, {
        foreignKey: 'refferal',
        id: 'id',
        as:'User',
        onDelete: 'CASCADE',
      });
      Profile.belongsTo(models.User, {
        foreignKey: 'user_id',
        id: 'id',
        as:'find_Direct_Reff_Transactions',
        onDelete: 'CASCADE',
      });
    }
  }
  Profile.init({
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    full_name: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    left: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    right: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    refferal: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    refferal_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pkg: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};