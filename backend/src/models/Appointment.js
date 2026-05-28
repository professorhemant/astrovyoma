const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id:                  { type: DataTypes.UUID,    defaultValue: () => uuidv4(), primaryKey: true },
    user_id:             { type: DataTypes.UUID,    allowNull: false },
    astrologer_id:       { type: DataTypes.UUID,    allowNull: false },
    scheduled_at:        { type: DataTypes.DATE,    allowNull: false },
    duration_mins:       { type: DataTypes.INTEGER, defaultValue: 60 },
    mode:                { type: DataTypes.STRING,  defaultValue: 'chat' },
    concern_category:    { type: DataTypes.STRING,  allowNull: true },
    concern_notes:       { type: DataTypes.TEXT,    allowNull: true },
    status:              { type: DataTypes.STRING,  defaultValue: 'confirmed' },
    amount:              { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    cancellation_reason: { type: DataTypes.STRING,  allowNull: true }
  }, {
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Appointment;
};
