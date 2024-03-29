'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Upgrade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Upgrade.belongsTo(models.Profile,{
        foreignKey:'user_id'
      })
    }
  }
  Upgrade.init({
    upgrade: DataTypes.STRING,
    pkg_price: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    profile_id: DataTypes.INTEGER,
    package: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Upgrade',
  });
  return Upgrade;
};