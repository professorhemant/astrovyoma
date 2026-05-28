const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    consultation_id: { type: DataTypes.UUID, allowNull: false },
    sender_type: { type: DataTypes.STRING, allowNull: false },
    sender_id: { type: DataTypes.UUID, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    message_type: { type: DataTypes.STRING, defaultValue: 'text' }
  }, {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  return Message;
};
