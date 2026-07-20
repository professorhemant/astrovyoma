const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Persistent history for the standalone AI chats (AstroVyoma AI and the Pandit
// chatbot). These previously lived in module-scope Maps, so every Railway
// restart — which happens on each deploy — wiped them and the assistant forgot
// the conversation mid-thread. A second instance would also have kept its own
// separate copy.
//
// `scope` separates the two chats a user can hold at once, so they don't bleed
// into each other.
module.exports = (sequelize) => {
  const AiChatMessage = sequelize.define('AiChatMessage', {
    id:      { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    scope:   { type: DataTypes.STRING(20), allowNull: false }, // 'chatbot' | 'pandit'
    role:    { type: DataTypes.STRING(20), allowNull: false }, // 'user' | 'assistant'
    content: { type: DataTypes.TEXT, allowNull: false },
  }, {
    tableName: 'ai_chat_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['user_id', 'scope', 'created_at'] }],
  });
  return AiChatMessage;
};
