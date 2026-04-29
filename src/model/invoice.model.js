import { DataTypes } from 'sequelize';
import sequelize from '../../database/db.js';
import User from './user.model.js';
import Business from './busness.model.js';

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  userId: { type: DataTypes.INTEGER, allowNull: false },
  businessId: { type: DataTypes.INTEGER, allowNull: false },

  invoiceType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Sale Invoice' },
  invoiceDate: { type: DataTypes.DATEONLY, allowNull: false },

  // Seller details (fetched from Business table)
  sellerNTNCNIC: { type: DataTypes.STRING, allowNull: false },
  sellerBusinessName: { type: DataTypes.STRING, allowNull: false },
  sellerProvince: { type: DataTypes.STRING, allowNull: false },
  sellerAddress: { type: DataTypes.STRING, allowNull: false },

  // Buyer details (from request)
  buyerNTNCNIC: { type: DataTypes.STRING },
  buyerBusinessName: { type: DataTypes.STRING, allowNull: false },
  buyerProvince: { type: DataTypes.STRING, allowNull: false },
  buyerAddress: { type: DataTypes.STRING, allowNull: false },
  buyerRegistrationType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Registered' },

  invoiceRefNo: { type: DataTypes.STRING },
  scenarioId: { type: DataTypes.STRING, defaultValue: 'SN001' },

  // FBR response
  fbrInvoiceNo: { type: DataTypes.STRING },
  qrCode: { type: DataTypes.TEXT },
  pdfPath: { type: DataTypes.STRING },

  totalAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  taxAmount: { type: DataTypes.FLOAT, defaultValue: 0 },

  status: {
  type: DataTypes.ENUM(
    'DRAFT',
    'PENDING',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'FAILED'
  ),
  defaultValue: 'DRAFT'
},

  // Items stored as JSON
  items: { type: DataTypes.JSON, allowNull: false }

}, { timestamps: true });

// Relations
User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.belongsTo(User, { foreignKey: 'userId' });

Business.hasMany(Invoice, { foreignKey: 'businessId' });
Invoice.belongsTo(Business, { foreignKey: 'businessId' });

export default Invoice;