const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const MallOrder = sequelize.define('MallOrder', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    user_id:          { type: DataTypes.UUID, allowNull: true },
    customer_name:    { type: DataTypes.STRING, allowNull: false },
    customer_phone:   { type: DataTypes.STRING, allowNull: false },
    delivery_address: { type: DataTypes.TEXT, allowNull: false },
    items:            { type: DataTypes.JSON, allowNull: false },
    amount:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    razorpay_order_id:   { type: DataTypes.STRING, allowNull: true },
    razorpay_payment_id: { type: DataTypes.STRING, allowNull: true, unique: true },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
  }, {
    tableName: 'mall_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  });
  return MallOrder;
};
