'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User_profile.init({
    full_name: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    email: DataTypes.STRING,
    profile_img: DataTypes.STRING,
    email_opt: DataTypes.INTEGER,
    address: DataTypes.STRING,
    mobile_opt: DataTypes.INTEGER,
    activate: DataTypes.BOOLEAN,
    user_id:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User_profile',
  });
  return User_profile;
};