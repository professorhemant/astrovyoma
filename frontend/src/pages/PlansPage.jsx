import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { subscriptions } from '../api';
import { useAuth } from '../context/AuthContext';

const PLAN_STYLES = {
  free:     { border:'border-cosmic-700',       badge:'',                        btn:'bg-white/10 hover:bg-white/15 text-white border border-white/20' },
  silver:   { border:'border-cosmic-600',       badge:'',                        btn:'bg-slate-500 hover:bg-slate-400 text-white' },
  gold:     { border:'border-gold-500/60',      badge:'Most Popular',            btn:'bg-gold-500 hover:bg-gold-400 text-cosmic-950 font-bold' },
  platinum: { border:'border-violet-500/60',    badge:'Best Value',              btn:'bg-violet-600 hover:bg-violet-500 text-white font-bold' },
};

const ICON_BG = {
  free:     'bg-gray-500/20 text-gray-400',
  silver:   'bg-slate-500/20 text-slate-300',
  gold:     'bg-gold-500/20 text-gold-400',
  platinum: 'bg-violet-500/20 text-violet-400',
};

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PlansPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [plans,    setPlans]    = useState([]);
  const [myPlan,   setMyPlan]   = useState(null);
  const [billing,  setBilling]  = useState('monthly');
  const [loading,  setLoading]  = useState(false);
  const [paying,   setPaying]   = useState(null);

  useEffect(() => {
    subscriptions.getPlans().then(r => setPlans(r.data.plans)).catch(() => {});
    if (user) subscriptions.getMy().then(r => setMyPlan(r.data)).catch(() => {});
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user) { navigate('/login'); return; }
    if (planId === 'free') return;

    setPaying(planId);
    try {
      const { data: orderData } = await subscriptions.createOrder({ planId, billing });

      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Could not load payment gateway. Please try again.'); setPaying(null); return; }

      const options = {
        key:          orderData.key,
        amount:       orderData.amount,
        currency:     orderData.currency,
        name:         'AstroVyoma',
        description:  `${orderData.plan_name} Plan — ${billing === 'yearly' ? 'Annual' : 'Monthly'}`,
        order_id:     orderData.order_id,
        image:        '/logo192.png',
        prefill: {
          name:  user.name  || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: { color: '#e8c547' },
        handler: async (response) => {
          try {
            await subscriptions.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            toast.success(`✦ ${orderData.plan_name} plan activated!`);
            const r = await subscriptions.getMy();
            setMyPlan(r.data);
          } catch {
            toast.error('Payment verification failed. Contact support if amount was deducted.');
          } finally {
            setPaying(null);
          }
        },
        modal: { ondismiss: () => setPaying(null) }
      };

      new window.Razorpay(options).open();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to initiate payment';
      if (msg.includes('not configured')) {
        toast('Payment gateway coming soon — Razorpay keys not yet added.', { icon: '🔧' });
      } else {
        toast.error(msg);
      }
      setPaying(null);
    }
  };

  const displayPrice = (plan) => {
    if (plan.id === 'free') return '₹0';
    const p = billing === 'yearly' ? plan.yearlyPrice : plan.price;
    return `₹${p}`;
  };

  const perMonth = (plan) => {
    if (plan.id === 'free') return 'Forever free';
    if (billing === 'yearly') return `₹${Math.round(plan.yearlyPrice / 12)}/mo`;
    return '/month';
  };

  const saving = (plan) => {
    if (!plan.price || !plan.yearlyPrice || billing !== 'yearly') return null;
    const saved = (plan.price * 12) - plan.yearlyPrice;
    return saved > 0 ? `Save ₹${saved}` : null;
  };

  const isCurrent = (planId) => myPlan?.plan === planId;

  // relative z-10: CosmicBackground is a fixed z-0 layer, so it paints over any
  // in-flow content that has no stacking context of its own. The cards kept
  // their transforms and stayed visible; this header lost its one the moment
  // its entry animation finished, and vanished.
  return (
    <div className="relative z-10 min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-12">
          <div className="text-5xl mb-4">💎</div>
          <h1 className="text-3xl sm:text-4xl font-serif text-gold-400 mb-3">Choose Your Cosmic Plan</h1>
          <p className="text-cosmic-300 max-w-xl mx-auto text-sm">
            Unlock the full power of Vedic astrology — from AI-powered kundali insights to live consultations with expert astrologers.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-1 bg-cosmic-900 border border-gold-500/20 rounded-full p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-gold-500/20 text-gold-400' : 'text-cosmic-400 hover:text-cosmic-200'}`}>
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-gold-500/20 text-gold-400' : 'text-cosmic-400 hover:text-cosmic-200'}`}>
              Yearly
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Save ~17%</span>
            </button>
          </div>
        </motion.div>

        {/* Current plan banner */}
        {myPlan && myPlan.plan !== 'free' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card-cosmic p-4 mb-8 flex flex-wrap items-center gap-4 border-gold-500/30">
            <div>
              <span className="text-xs text-cosmic-400">Your current plan</span>
              <div className="text-gold-400 font-semibold">{myPlan.plan_name}</div>
            </div>
            {myPlan.expires_at && (
              <div className="ml-auto text-xs text-cosmic-400">
                Renews {new Date(myPlan.expires_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              </div>
            )}
          </motion.div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, idx) => {
            const styles  = PLAN_STYLES[plan.id] || PLAN_STYLES.free;
            const iconBg  = ICON_BG[plan.id] || ICON_BG.free;
            const current = isCurrent(plan.id);
            const sv      = saving(plan);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity:0, y:24 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: idx * 0.07 }}
                className={`relative card-cosmic flex flex-col border-2 ${styles.border} ${plan.popular ? 'ring-2 ring-gold-500/40' : ''}`}>

                {/* Badge */}
                {styles.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-cosmic-950 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {styles.badge}
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  {/* Icon + name */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${iconBg}`}>
                    {plan.icon}
                  </div>
                  <div className="text-lg font-serif text-cosmic-100 mb-1">{plan.name}</div>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-gold-400">{displayPrice(plan)}</span>
                    {plan.id !== 'free' && billing === 'yearly' && (
                      <span className="text-cosmic-500 text-xs ml-2 line-through">
                        ₹{plan.price * 12}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-cosmic-400 mb-4 flex items-center gap-2">
                    {perMonth(plan)}
                    {sv && <span className="text-emerald-400 font-medium">{sv}</span>}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-cosmic-200">
                        <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{f}
                      </li>
                    ))}
                    {plan.notIncluded?.map((f, i) => (
                      <li key={`no-${i}`} className="flex items-start gap-2 text-xs text-cosmic-600 line-through">
                        <span className="text-cosmic-700 mt-0.5 shrink-0">✗</span>{f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {current ? (
                    <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                      ✓ Current Plan
                    </div>
                  ) : plan.id === 'free' ? (
                    <div className="w-full py-2.5 rounded-xl text-center text-sm text-cosmic-500 border border-cosmic-700">
                      Always Free
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={!!paying}
                      className={`w-full py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 ${styles.btn}`}>
                      {paying === plan.id ? '✦ Processing…' : `Get ${plan.name}`}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="mt-14 max-w-2xl mx-auto">
          <h2 className="text-gold-400 font-serif text-xl text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q:'Can I cancel anytime?', a:'Yes. Cancellation takes effect at the end of your current billing cycle. No hidden charges.' },
              { q:'What payment methods are accepted?', a:'UPI, credit/debit cards, net banking, and wallets via Razorpay — the most trusted payment gateway in India.' },
              { q:'Is my birth data secure?', a:'Absolutely. Your kundali data is encrypted at rest and never shared with third parties.' },
              { q:'Can I upgrade from Silver to Gold later?', a:'Yes, you can upgrade at any time. The remaining balance of your current plan will be pro-rated.' },
              { q:'Do I get a refund if I\'m not satisfied?', a:'We offer a 7-day refund guarantee on your first purchase. Contact support at support@astrovyoma.com.' },
            ].map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-cosmic">
      <button className="w-full text-left p-4 flex items-center justify-between gap-3" onClick={() => setOpen(o => !o)}>
        <span className="text-cosmic-200 text-sm font-medium">{q}</span>
        <span className={`text-gold-400 text-lg transition-transform shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-cosmic-400 leading-relaxed border-t border-gold-500/10 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}
