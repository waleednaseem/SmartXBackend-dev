'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class timer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  timer.init({
    user: DataTypes.INTEGER,
    visitor: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'timer',
  });
  return timer;
};