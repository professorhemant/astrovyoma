const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Password-reset / signup codes, and the per-identifier send throttle.
//
// These lived in two module-scope Maps (otpService's otpStore and
// authController's lastResetRequest). Railway restarts on every deploy, which
// silently invalidated every code already emailed out — a user following a
// legitimate link got "OTP not found" for a code they had just received. With
// more than one instance it would fail roughly half the time regardless of
// restarts, since the code written on one instance is invisible to the other.
//
// The code is stored hashed: an OTP is a short-lived credential, and there is
// no reason for a database dump to contain usable ones.
module.exports = (sequelize) => {
  const OtpCode = sequelize.define('OtpCode', {
    id:         { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    identifier: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    otp_hash:   { type: DataTypes.STRING(255), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    // Drives the resend throttle, so it survives a restart along with the code.
    last_sent_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'otp_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['identifier'] }],
  });
  return OtpCode;
};
