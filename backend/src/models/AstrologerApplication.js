const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const AstrologerApplication = sequelize.define('AstrologerApplication', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, allowNull: true },
    specialties: { type: DataTypes.TEXT, allowNull: true },
    languages: { type: DataTypes.TEXT, allowNull: true },
    experience_years: { type: DataTypes.INTEGER, allowNull: false },
    price_per_min: { type: DataTypes.DECIMAL(8, 2), defaultValue: 30 },
    photo_url: { type: DataTypes.STRING, allowNull: true },
    certifications: { type: DataTypes.TEXT, allowNull: true },
    why_join: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'astrologer_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return AstrologerApplication;
};
