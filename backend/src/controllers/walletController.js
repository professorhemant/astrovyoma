const { User, Transaction } = require('../models');
const { addToWallet } = require('../services/walletService');

async function getBalance(req, res) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['wallet_balance'] });
    res.json({ balance: parseFloat(user.wallet_balance) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
}

async function recharge(req, res) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

    const result = await addToWallet(req.user.id, parseFloat(amount), `Wallet recharge ₹${amount}`);
    res.json(result);
  } catch (err) {
    console.error('recharge error:', err);
    res.status(500).json({ error: 'Failed to recharge wallet' });
  }
}

async function getTransactions(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const transactions = await Transaction.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({ transactions: transactions.rows, total: transactions.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

module.exports = { getBalance, recharge, getTransactions };
