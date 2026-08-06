const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// One table behind every editable list on the site — testimonials, FAQs, menu
// entries, homepage sections, and whatever comes next.
//
// A table per list would mean a migration, a model, a controller and an admin
// screen every time something new becomes editable, which is exactly the
// dependency this is meant to remove. Instead the shape of each list lives in
// config/contentSchema.js, the fields ride in `data` as JSON, and the admin UI
// renders itself from the schema.
//
// sort_order is what makes "shift up / shift down" work; is_active is what makes
// "hide this without deleting it" work.
module.exports = (sequelize) => {
  const ContentItem = sequelize.define('ContentItem', {
    id:         { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    list_key:   { type: DataTypes.STRING, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active:  { type: DataTypes.BOOLEAN, defaultValue: true },
    data:       { type: DataTypes.TEXT, allowNull: false, defaultValue: '{}' },
  }, {
    tableName: 'content_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['list_key', 'sort_order'] }],
  });

  return ContentItem;
};
