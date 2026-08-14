const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

function jsonArrayField(defaultVal = []) {
  return {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify(defaultVal),
    get() {
      const raw = this.getDataValue(this._modelOptions?.attributes ? undefined : arguments[0]);
      try { return JSON.parse(this.getDataValue(this.constructor.rawAttributes[arguments[0]]?.fieldName || arguments[0]) || '[]'); }
      catch { return defaultVal; }
    }
  };
}

module.exports = (sequelize) => {
  const Astrologer = sequelize.define('Astrologer', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: true },
    display_name: { type: DataTypes.STRING, allowNull: false },
    photo_url: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    specialties: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() { try { return JSON.parse(this.getDataValue('specialties') || '[]'); } catch { return []; } },
      set(val) { this.setDataValue('specialties', JSON.stringify(Array.isArray(val) ? val : [])); }
    },
    languages: {
      type: DataTypes.TEXT,
      defaultValue: '["Hindi","English"]',
      get() { try { return JSON.parse(this.getDataValue('languages') || '[]'); } catch { return ['Hindi','English']; } },
      set(val) { this.setDataValue('languages', JSON.stringify(Array.isArray(val) ? val : [])); }
    },
    experience_years: { type: DataTypes.INTEGER, defaultValue: 5 },
    price_per_min: { type: DataTypes.DECIMAL(8, 2), defaultValue: 30 },
    rating: { type: DataTypes.DECIMAL(3, 1), defaultValue: 5.0 },
    total_reviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    completed_orders: { type: DataTypes.INTEGER, defaultValue: 0 },
    response_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 100 },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_online: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    // Applications have always carried an email and approval used to throw it
    // away, because the astrologer record had nowhere to put it — so the only
    // way to reach an approved astrologer was the phone she signs in with.
    email: { type: DataTypes.STRING, allowNull: true },
    free_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    pin_hash: { type: DataTypes.STRING, allowNull: true },
    // When this astrologer works — see services/availabilityService.js. Empty
    // means "as it always was", 8 AM to 9 PM every day, so an astrologer who
    // never opens the hours screen is offered exactly as before.
    availability: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    concern_tags: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() { try { return JSON.parse(this.getDataValue('concern_tags') || '[]'); } catch { return []; } },
      set(val) { this.setDataValue('concern_tags', JSON.stringify(Array.isArray(val) ? val : [])); }
    }
  }, {
    tableName: 'astrologers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Astrologer;
};
