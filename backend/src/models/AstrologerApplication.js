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
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.STRING(10), allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    skills: { type: DataTypes.TEXT, allowNull: true },
    astrology_learned_from: { type: DataTypes.TEXT, allowNull: true },
    highest_qualification: { type: DataTypes.TEXT, allowNull: true },
    degree: { type: DataTypes.TEXT, allowNull: true },
    college: { type: DataTypes.TEXT, allowNull: true },
    other_platform: { type: DataTypes.BOOLEAN, allowNull: true },
    fulltime_job: { type: DataTypes.BOOLEAN, allowNull: true },
    daily_hours: { type: DataTypes.STRING(20), allowNull: true },
    youtube_channel: { type: DataTypes.TEXT, allowNull: true },
    linkedin_url: { type: DataTypes.TEXT, allowNull: true },
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
