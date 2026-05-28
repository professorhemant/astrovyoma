const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;
if (isProduction && process.env.DB_URL) {
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', 'astrovyoma.db'),
    logging: false
  });
}

const User = require('./User')(sequelize);
const Astrologer = require('./Astrologer')(sequelize);
const Kundali = require('./Kundali')(sequelize);
const Consultation = require('./Consultation')(sequelize);
const Message = require('./Message')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const Review = require('./Review')(sequelize);
const Subscription  = require('./Subscription')(sequelize);
const Appointment   = require('./Appointment')(sequelize);
const UserReport    = require('./UserReport')(sequelize);

User.hasOne(Astrologer, { foreignKey: 'user_id', as: 'astrologerProfile' });
Astrologer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Kundali, { foreignKey: 'user_id', as: 'kundali' });
Kundali.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Consultation, { foreignKey: 'user_id', as: 'consultations' });
Consultation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Astrologer.hasMany(Consultation, { foreignKey: 'astrologer_id', as: 'consultations' });
Consultation.belongsTo(Astrologer, { foreignKey: 'astrologer_id', as: 'astrologer' });

Consultation.hasMany(Message, { foreignKey: 'consultation_id', as: 'messages' });
Message.belongsTo(Consultation, { foreignKey: 'consultation_id', as: 'consultation' });

User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Consultation.hasOne(Review, { foreignKey: 'consultation_id', as: 'review' });
Review.belongsTo(Consultation, { foreignKey: 'consultation_id', as: 'consultation' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Astrologer.hasMany(Review, { foreignKey: 'astrologer_id', as: 'reviews' });

User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Appointment, { foreignKey: 'user_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Astrologer.hasMany(Appointment, { foreignKey: 'astrologer_id', as: 'appointments' });
Appointment.belongsTo(Astrologer, { foreignKey: 'astrologer_id', as: 'astrologer' });

User.hasMany(UserReport, { foreignKey: 'user_id', as: 'reports' });
UserReport.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, Astrologer, Kundali, Consultation, Message, Transaction, Review, Subscription, Appointment, UserReport };
