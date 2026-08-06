const { DataTypes } = require('sequelize');

// Site settings used to live in a module-level object in adminController, which
// meant every restart — and Railway restarts on each deploy — silently reverted
// maintenance mode, the announcement, commission and wallet limits to their
// defaults. Saving appeared to work and then quietly undid itself.
//
// One row per setting, value carried as JSON text so a setting can be a string,
// number, boolean or list without a schema change per type.
module.exports = (sequelize) => {
  const SiteSetting = sequelize.define('SiteSetting', {
    key:   { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'site_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return SiteSetting;
};
