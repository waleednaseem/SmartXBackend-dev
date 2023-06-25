'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class total_income extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  total_income.init({
    user_id: DataTypes.STRING,
    income: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'total_income',
  });
  return total_income;
};