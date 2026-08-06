const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Uploaded images, stored in the database.
//
// Object storage would be the textbook answer, but it needs a bucket
// provisioned and credentials wired up, and this site's images are a few dozen
// avatars and product photos. Every upload is resized and re-encoded to WebP
// before it lands here (see mediaController), so a 6 MB phone photo becomes
// roughly 50-150 KB. At that size and count the database is the simpler,
// cheaper home, and it means uploads survive redeploys with nothing to
// configure.
//
// If this ever grows to thousands of images, move the bytes to a bucket and
// keep this table as the index — the public URL shape stays /api/media/:id.
module.exports = (sequelize) => {
  const Media = sequelize.define('Media', {
    id:       { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    mime:     { type: DataTypes.STRING, allowNull: false, defaultValue: 'image/webp' },
    size:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    width:    { type: DataTypes.INTEGER },
    height:   { type: DataTypes.INTEGER },
    data:     { type: DataTypes.BLOB('long'), allowNull: false },
  }, {
    tableName: 'media',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Media;
};
