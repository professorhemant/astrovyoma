const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    id:                   { type: DataTypes.UUID,    defaultValue: () => uuidv4(), primaryKey: true },
    user_id:              { type: DataTypes.UUID,    allowNull: false },
    plan:                 { type: DataTypes.STRING,  allowNull: false },
    amount:               { type: DataTypes.INTEGER, allowNull: false },
    duration_months:      { type: DataTypes.INTEGER, allowNull: false },
    razorpay_order_id:    { type: DataTypes.STRING,  allowNull: true },
    razorpay_payment_id:  { type: DataTypes.STRING,  allowNull: true },
    razorpay_signature:   { type: DataTypes.STRING,  allowNull: true },
    status:               { type: DataTypes.STRING,  defaultValue: 'pending' },
    expires_at:           { type: DataTypes.DATE,    allowNull: true }
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  return Subscription;
};
