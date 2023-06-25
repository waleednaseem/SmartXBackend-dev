'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class total_withdraw extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  total_withdraw.init({
    user_id: DataTypes.STRING,
    withdraw: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'total_withdraw',
  });
  return total_withdraw;
};