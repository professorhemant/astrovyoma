const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// JSON field factory — stores as TEXT, auto-parses on read
function jf(fieldName) {
  return {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue(fieldName);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return null; }
    },
    set(val) {
      this.setDataValue(fieldName, val != null ? JSON.stringify(val) : null);
    }
  };
}

module.exports = (sequelize) => {
  const Kundali = sequelize.define('Kundali', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    person_name: { type: DataTypes.STRING(200), allowNull: true },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    birth_time: { type: DataTypes.STRING, allowNull: true },
    birth_place: { type: DataTypes.STRING, allowNull: true },
    birth_lat: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
    birth_lng: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
    birth_timezone: { type: DataTypes.DECIMAL(5, 2), allowNull: true },

    // Core chart data
    nakshatra: { type: DataTypes.STRING, allowNull: true },
    nakshatra_lord: { type: DataTypes.STRING, allowNull: true },
    nakshatra_pada: { type: DataTypes.INTEGER, allowNull: true },
    lagna: { type: DataTypes.STRING, allowNull: true },
    lagna_degree: { type: DataTypes.FLOAT, allowNull: true },
    lagna_sign_index: { type: DataTypes.INTEGER, allowNull: true },
    moon_sign: { type: DataTypes.STRING, allowNull: true },
    sun_sign: { type: DataTypes.STRING, allowNull: true },
    julian_day: { type: DataTypes.FLOAT, allowNull: true },

    // JSON fields — all stored as TEXT, auto-parsed on read
    planetary_positions: jf('planetary_positions'),
    house_cusps: jf('house_cusps'),
    house_planets: jf('house_planets'),
    house_lords: jf('house_lords'),
    divisional_charts: jf('divisional_charts'),
    panchang: jf('panchang'),
    upgrahas: jf('upgrahas'),
    dasha_sequence: jf('dasha_sequence'),
    dasha_balance: jf('dasha_balance'),
    shadbala: jf('shadbala'),
    bhava_bala: jf('bhava_bala'),
    sidereal_time: jf('sidereal_time'),
    ayanamsha: jf('ayanamsha'),
    lmt_info: jf('lmt_info'),
    personality_traits: jf('personality_traits'),

    life_purpose: { type: DataTypes.TEXT, allowNull: true },
    swabhav: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'kundalis',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Kundali;
};
