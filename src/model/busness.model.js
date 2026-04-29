// models/Business.js
import { DataTypes } from 'sequelize';
import sequelize from '../../database/db.js';
import User from './user.model.js';

const Business = sequelize.define('Business', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // link to user
  name: { type: DataTypes.STRING, allowNull: false },
  ntn: { type: DataTypes.STRING, allowNull: false, unique: true },
  address: { type: DataTypes.STRING, allowNull: false },
  province: { type: DataTypes.STRING, allowNull: false },
  fbrToken: { type: DataTypes.STRING, allowNull: false },
  posId: { type: DataTypes.STRING, allowNull: true },
  isFbrEnabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: true
},
   isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

// Relations
User.hasMany(Business, { foreignKey: 'userId' });
Business.belongsTo(User, { foreignKey: 'userId' });

export default Business;