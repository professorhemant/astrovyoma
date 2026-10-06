const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const PoojaBooking = sequelize.define('PoojaBooking', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    ref_id:          { type: DataTypes.STRING, allowNull: false, unique: true },
    paath_id:        { type: DataTypes.STRING, allowNull: false },
    paath_name:      { type: DataTypes.STRING, allowNull: false },
    variant:         { type: DataTypes.STRING, allowNull: true },
    customer_name:   { type: DataTypes.STRING, allowNull: false },
    customer_mobile: { type: DataTypes.STRING, allowNull: false },
    preferred_date:  { type: DataTypes.STRING, allowNull: false },
    time_slot:       { type: DataTypes.STRING, allowNull: true },
    gotra:           { type: DataTypes.STRING, allowNull: true },
    intention:       { type: DataTypes.TEXT,   allowNull: true },

    // What customer paid
    gross_amount:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // Rate locked at booking time — changing the platform setting never restates old bookings
    commission_percent: { type: DataTypes.DECIMAL(5,  2), allowNull: false, defaultValue: 40 },
    commission_amount:  { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // Pandit Ji's 60% share
    net_amount:         { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    // confirmed → completed (pandit marks done) → paid (admin marks paid)
    status:            { type: DataTypes.STRING, defaultValue: 'confirmed' },

    pandit_id:             { type: DataTypes.UUID,   allowNull: true },
    razorpay_order_id:     { type: DataTypes.STRING, allowNull: true },
    razorpay_payment_id:   { type: DataTypes.STRING, allowNull: true },
    paid_at:               { type: DataTypes.DATE,   allowNull: true },
    payout_reference:      { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'pooja_bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['pandit_id'] },
      { fields: ['status'] },
      { unique: true, fields: ['ref_id'] },
    ],
  });
  return PoojaBooking;
};
