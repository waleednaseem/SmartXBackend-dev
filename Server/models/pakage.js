'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pakage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pakage.belongsTo(models.User,{
        foreignKey:'user_id',
        sourceKey:'user_id',
      })
    }
  }
  Pakage.init({
    pkg_name: DataTypes.STRING,
    pkg_price: DataTypes.INTEGER,
    // pkg_img: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pakage',
  });
  return Pakage;
};