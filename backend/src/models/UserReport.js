const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const UserReport = sequelize.define('UserReport', {
    id:      { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    type:    { type: DataTypes.STRING(50), allowNull: false }, // kundali | kp | muhurta | namkaran | yoga | lal_kitab | domain
    title:   { type: DataTypes.STRING(300), allowNull: false },
    meta: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() { const r = this.getDataValue('meta'); try { return r ? JSON.parse(r) : null; } catch { return null; } },
      set(v) { this.setDataValue('meta', v != null ? JSON.stringify(v) : null); }
    },
  }, {
    tableName: 'user_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
  return UserReport;
};
