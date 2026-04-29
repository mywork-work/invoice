// models/Product.js
import { DataTypes } from 'sequelize';
import sequelize from '../../database/db.js';
import Business from './busness.model.js';
import User from './user.model.js';

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  itemName: { type: DataTypes.STRING, allowNull: false },
  hsCode: { type: DataTypes.STRING, allowNull: false },
  taxRate: { type: DataTypes.FLOAT, allowNull: false },
  uom: { type: DataTypes.STRING, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
});

// Relations
Business.hasMany(Product, { foreignKey: 'businessId' });
Product.belongsTo(Business, { foreignKey: 'businessId' });
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

export default Product;