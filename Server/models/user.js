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
      // define association here
      User.hasOne(models.Profile,{
        foreignKey:'user_id',
        id:'id',
        onDelete: 'CASCADE',
      })
      User.hasOne(models.wallet,{
        foreignKey:'user_id',
        id:'id',
        as:"reff",
        onDelete: 'CASCADE',
      })
      User.hasOne(models.User_profile,{
        foreignKey:'user_id',
        id:'id',
        // as:"reff",
        onDelete: 'CASCADE',
      })
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};