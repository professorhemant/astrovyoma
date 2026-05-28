const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: true, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING, unique: true, allowNull: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    birth_time: { type: DataTypes.STRING, allowNull: true },
    birth_place: { type: DataTypes.STRING, allowNull: true },
    birth_lat: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
    birth_lng: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
    birth_timezone: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    wallet_balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    onboarding_complete: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.STRING, defaultValue: 'user' },
    subscription_plan: { type: DataTypes.STRING, defaultValue: 'free' },
    subscription_expires_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return User;
};
