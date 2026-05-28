const { User, Transaction } = require('../models');
const { sequelize } = require('../models/index');

async function deductPerMinute(userId, astrologerId, amountPerMin) {
  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t, lock: true });
    if (!user || parseFloat(user.wallet_balance) < parseFloat(amountPerMin)) {
      return { success: false, reason: 'Insufficient balance' };
    }
    const newBalance = parseFloat(user.wallet_balance) - parseFloat(amountPerMin);
    await user.update({ wallet_balance: newBalance }, { transaction: t });
    await Transaction.create({
      user_id: userId,
      type: 'debit',
      amount: amountPerMin,
      description: 'Consultation with astrologer',
      balance_after: newBalance
    }, { transaction: t });
    return { success: true, balance: newBalance };
  });
}

async function addToWallet(userId, amount, description = 'Wallet recharge') {
  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t, lock: true });
    const newBalance = parseFloat(user.wallet_balance) + parseFloat(amount);
    await user.update({ wallet_balance: newBalance }, { transaction: t });
    await Transaction.create({
      user_id: userId,
      type: 'recharge',
      amount,
      description,
      balance_after: newBalance
    }, { transaction: t });
    return { success: true, balance: newBalance };
  });
}

module.exports = { deductPerMinute, addToWallet };
