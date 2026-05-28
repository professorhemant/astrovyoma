import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Wallet, Plus, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { wallet as walletApi } from '../api';
import { useAuth } from '../context/AuthContext';

const RECHARGE_PACKS = [
  { amount: 100, label: '₹100', bonus: null },
  { amount: 300, label: '₹300', bonus: '+₹30 bonus' },
  { amount: 500, label: '₹500', bonus: '+₹75 bonus' },
  { amount: 1000, label: '₹1000', bonus: '+₹200 bonus' },
  { amount: 2000, label: '₹2000', bonus: '+₹500 bonus' },
];

export default function WalletPage() {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState(parseFloat(user?.wallet_balance || 0));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    Promise.all([
      walletApi.getBalance().then(res => setBalance(res.data.balance)),
      walletApi.getTransactions().then(res => setTransactions(res.data.transactions || []))
    ]).finally(() => setLoading(false));
  }, []);

  async function handleRecharge(amount) {
    setRecharging(true);
    try {
      const res = await walletApi.recharge(amount);
      setBalance(res.data.balance);
      updateUser({ wallet_balance: res.data.balance });
      toast.success(`?${amount} added to your wallet! ?`);
      const txRes = await walletApi.getTransactions();
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Recharge failed');
    } finally {
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
            {RECHARGE_PACKS.map(pack => (
              <button
                key={pack.amount}
                onClick={() => handleRecharge(pack.amount)}
                disabled={recharging}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gold-600/20 hover:border-gold-500 hover:bg-gold-600/10 transition-all disabled:opacity-50 group"
              >
                <span className="font-semibold text-gold-400 group-hover:text-gold-300">{pack.label}</span>
                {pack.bonus && <span className="text-green-400 text-xs">{pack.bonus}</span>}
              </button>
            ))}
          </div>
          <p className="text-gray-300 text-xs mt-3 text-center">Demo mode � recharge is instant. In production, Razorpay payment gateway will be integrated.</p>
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
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gold-600/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'recharge' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {tx.type === 'recharge' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-gray-300 text-sm">{tx.description}</div>
                      <div className="text-gray-300 text-xs">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${tx.type === 'recharge' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'recharge' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                    </div>
                    <div className="text-gray-300 text-xs">Bal: ₹{parseFloat(tx.balance_after).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
