const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Consultation = sequelize.define('Consultation', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    astrologer_id: { type: DataTypes.UUID, allowNull: false },
    mode: { type: DataTypes.STRING, allowNull: false },
    concern_category: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    agora_channel: { type: DataTypes.STRING, allowNull: true },
    started_at: { type: DataTypes.DATE, allowNull: true },
    // When the *astrologer* actually joined the call — not when the seeker
    // opened it. started_at is stamped as the record is created, before anything
    // has connected, so billing from it charges for a call that may never have
    // happened. Null here means the two never met and nothing is owed.
    connected_at: { type: DataTypes.DATE, allowNull: true },
    ended_at: { type: DataTypes.DATE, allowNull: true },
    duration_mins: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    is_free_trial: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'consultations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Consultation;
};
