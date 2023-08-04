'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Refferal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Refferal.belongsTo(models.Profile, {
        foreignKey: 'refferal',
        id: 'id',
        as:'directReff',
        onDelete: 'CASCADE',
      });
      Refferal.belongsTo(models.User, {
        foreignKey: 'refferal',
        id: 'id',
        as:'directReffUser',
        onDelete: 'CASCADE',
      });
      Refferal.belongsTo(models.User, {
        foreignKey: 'user_id',
        id: 'id',
        as:'User',
        onDelete: 'CASCADE',
      });
      Refferal.belongsTo(models.Profile, {
        foreignKey: 'user_id',
        id: 'id',
        as:'ReffUsers',
        onDelete: 'CASCADE',
      });
      Refferal.belongsTo(models.Profile,{
        foreignKey:'placement_id',
        id:'id',
        as:'placement',
        onDelete: 'CASCADE',
      })
      Refferal.belongsTo(models.Profile,{
        foreignKey:'user_id',
        sourceKey: 'left',
        as:'leftUser',
        onDelete: 'CASCADE',
      })
      
      Refferal.belongsTo(models.Profile,{
        foreignKey:'level_id',
        id:'id',
        as:'level',
        onDelete: 'CASCADE',
      })
    }
  }
  Refferal.init({
    refferal: DataTypes.INTEGER,
    refferal_code: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    level_id: DataTypes.INTEGER,
    placement_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Refferal',
  });
  return Refferal;
};