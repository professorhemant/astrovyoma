import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Wallet, Plus, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { wallet as walletApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { loadRazorpay } from '../utils/razorpay';

// Fallback only — the live pack list (price and bonus) comes from the server.
const FALLBACK_PACKS = [
  { amount: 100,  bonus: 0   },
  { amount: 300,  bonus: 30  },
  { amount: 500,  bonus: 75  },
  { amount: 1000, bonus: 200 },
  { amount: 2000, bonus: 500 },
];

export default function WalletPage() {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState(parseFloat(user?.wallet_balance || 0));
  const [transactions, setTransactions] = useState([]);
  const [packs, setPacks] = useState(FALLBACK_PACKS);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    walletApi.getPacks().then(res => setPacks(res.data.packs || FALLBACK_PACKS)).catch(() => {});
    Promise.all([
      walletApi.getBalance().then(res => setBalance(res.data.balance)),
      walletApi.getTransactions().then(res => setTransactions(res.data.transactions || []))
    ]).finally(() => setLoading(false));
  }, []);

  async function refreshLedger() {
    const txRes = await walletApi.getTransactions();
    setTransactions(txRes.data.transactions || []);
  }

  async function handleRecharge(amount) {
    setRecharging(true);
    try {
      const { data: order } = await walletApi.createRechargeOrder(amount);

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Could not load payment gateway. Please check your connection.');
        setRecharging(false);
        return;
      }

      const options = {
        key:         order.key,
        amount:      order.amount,
        currency:    order.currency,
        name:        'AstroVyoma',
        description: `Wallet recharge ₹${amount}`,
        order_id:    order.order_id,
        image:       '/logo192.png',
        prefill: {
          name:    user?.name  || '',
          email:   user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#e8c547' },
        handler: async (response) => {
          try {
            const { data } = await walletApi.verifyRecharge({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            setBalance(data.balance);
            updateUser({ wallet_balance: data.balance });
            toast.success(
              data.bonus > 0
                ? `₹${amount} + ₹${data.bonus} bonus added to your wallet ✦`
                : `₹${amount} added to your wallet ✦`
            );
            await refreshLedger();
          } catch (err) {
            toast.error(err.response?.data?.error || 'Payment verification failed. Contact support if the amount was deducted.');
          } finally {
            setRecharging(false);
          }
        },
        modal: { ondismiss: () => setRecharging(false) }
      };

      new window.Razorpay(options).open();
    } catch (err) {
      const msg = err.response?.data?.error || 'Recharge failed';
      if (msg.includes('not configured')) {
        toast('Payment gateway coming soon — Razorpay keys not yet added.', { icon: '🔧' });
      } else {
        toast.error(msg);
      }
      setRecharging(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-gold-500 text-sm uppercase tracking-widest mb-2">Your Cosmic Wallet</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gold-400">Wallet & Recharge</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-cosmic p-8 text-center mb-6 border border-gold-600/30">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-gold-400" />
            <div className="font-serif text-5xl text-gold-400">₹{parseFloat(balance).toFixed(2)}</div>
          </div>
          <p className="text-gray-300 text-sm">Available Balance</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-cosmic p-6 mb-6">
          <h2 className="font-serif text-gold-400 text-xl mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Recharge Your Wallet
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {packs.map(pack => (
              <button
                key={pack.amount}
                onClick={() => handleRecharge(pack.amount)}
                disabled={recharging}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gold-600/20 hover:border-gold-500 hover:bg-gold-600/10 transition-all disabled:opacity-50 group"
              >
                <span className="font-semibold text-gold-400 group-hover:text-gold-300">₹{pack.amount}</span>
                {pack.bonus > 0 && <span className="text-green-400 text-xs">+₹{pack.bonus} bonus</span>}
              </button>
            ))}
          </div>
          <p className="text-gray-300 text-xs mt-3 text-center">🔒 Payments secured by Razorpay — UPI, cards, net banking & wallets.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-cosmic p-6">
          <h2 className="font-serif text-gold-400 text-xl mb-4 flex items-center justify-between">
            <span>Transaction History</span>
            <button onClick={() => walletApi.getTransactions().then(res => setTransactions(res.data.transactions || []))}
              className="text-gray-300 hover:text-gold-400"><RefreshCw className="w-4 h-4" /></button>
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gold-400 animate-pulse">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-gray-300 text-sm">No transactions yet. Recharge to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => {
                // Anything that isn't a debit adds to the balance — recharge, bonus, refund.
                const credit = tx.type !== 'debit';
                return (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gold-600/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${credit ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {credit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-gray-300 text-sm">{tx.description}</div>
                      <div className="text-gray-300 text-xs">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${credit ? 'text-green-400' : 'text-red-400'}`}>
                      {credit ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                    </div>
                    <div className="text-gray-300 text-xs">Bal: ₹{parseFloat(tx.balance_after).toFixed(2)}</div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
