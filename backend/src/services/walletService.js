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

// Credit a wallet against a *settled* Razorpay payment.
//
// referenceId is the razorpay_payment_id. Razorpay can deliver the same payment
// to us more than once — the browser handler fires and a webhook retry follows,
// or the user double-submits — so the credit has to be idempotent. The row lock
// on the user serialises concurrent attempts for that user, and the reference_id
// lookup inside the lock turns the second one into a no-op that reports the
// balance the first attempt produced.
//
// The paid amount and the promo bonus are written as separate transactions so
// the ledger keeps saying what the user actually paid.
async function creditRecharge(userId, { paid, bonus = 0, referenceId, description }) {
  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t, lock: true });
    if (!user) return { success: false, reason: 'User not found' };

    const existing = await Transaction.findOne({
      where: { user_id: userId, reference_id: referenceId, type: 'recharge' },
      transaction: t
    });
    if (existing) {
      return { success: true, balance: parseFloat(user.wallet_balance), duplicate: true };
    }

    let balance = parseFloat(user.wallet_balance) + parseFloat(paid);
    await Transaction.create({
      user_id:       userId,
      type:          'recharge',
      amount:        paid,
      description:   description || `Wallet recharge ₹${paid}`,
      balance_after: balance,
      reference_id:  referenceId
    }, { transaction: t });

    if (parseFloat(bonus) > 0) {
      balance += parseFloat(bonus);
      await Transaction.create({
        user_id:       userId,
        type:          'bonus',
        amount:        bonus,
        description:   `Recharge bonus on ₹${paid}`,
        balance_after: balance,
        reference_id:  referenceId
      }, { transaction: t });
    }

    await user.update({ wallet_balance: balance }, { transaction: t });
    return { success: true, balance, duplicate: false };
  });
}

module.exports = { deductPerMinute, addToWallet, creditRecharge };
