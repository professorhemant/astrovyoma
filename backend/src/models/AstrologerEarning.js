const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// One row per consultation an astrologer has actually been paid for.
//
// The commission rate is written into the row rather than read back from
// Business Settings when the figure is displayed. A rate is a decision taken on
// a date: changing it to 45 next month must not quietly restate what somebody
// earned last month. Every number an astrologer is ever shown comes out of this
// table as it was recorded.
//
// gross = commission + net, always, with no rounding drift — net is derived by
// subtraction rather than by a second rounding of its own.
//
// consultation_id is unique. Ending a consultation twice, a retry, or a
// duplicate request must not pay anyone twice.
module.exports = (sequelize) => {
  const AstrologerEarning = sequelize.define('AstrologerEarning', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    astrologer_id:   { type: DataTypes.UUID, allowNull: false },
    consultation_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    user_id:         { type: DataTypes.UUID, allowNull: true },

    duration_mins: { type: DataTypes.INTEGER, defaultValue: 0 },

    // What the seeker paid.
    gross_amount:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // The rate as it stood the moment this consultation ended.
    commission_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    // What the platform kept, and what the astrologer is owed.
    commission_amount:  { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    net_amount:         { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    // pending until a payout run marks it paid.
    status:            { type: DataTypes.STRING, defaultValue: 'pending' },
    paid_at:           { type: DataTypes.DATE, allowNull: true },
    payout_reference:  { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'astrologer_earnings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['astrologer_id'] },
      { fields: ['status'] },
    ],
  });
  return AstrologerEarning;
};
