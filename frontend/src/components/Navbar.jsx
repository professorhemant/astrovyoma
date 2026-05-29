import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Menu, X, LogOut, User, ChevronDown, ShoppingCart, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const FREE_TOOLS_ITEMS = [
  { to:'/lucky',         icon:'🍀', label:"Today's Lucky Info" },
  { to:'/gochara',       icon:'🌍', label:'Gochara (Transit)' },
  { to:'/lal-kitab',    icon:'📖', label:'Lal Kitab' },
  { to:'/muhurta',              icon:'🕐', label:'Muhurta Calculator' },
  { to:'/palmistry',            icon:'🖐️', label:'Palmistry & Face Reading' },
  { to:'/yoga-finder',          icon:'🔱', label:'Yoga Finder' },
];

const PANCHANG_ITEMS = [
  { to:'/panchang/calendar',     icon:'📅', label:'Panchang Calendar' },
  { to:'/panchang',              icon:'🕉️', label:"Today's Panchang", dividerAfter: true },
  { to:'/panchang/tithi',        icon:'🌙', label:"Today's Tithi" },
  { to:'/panchang/shubhamuhurat',icon:'✨', label:"Today's Shubhamuhurat" },
  { to:'/panchang/nakshatra',    icon:'⭐', label:"Today's Nakshatra" },
  { to:'/panchang/choghadiya',   icon:'⏰', label:"Today's Choghadiya" },
  { to:'/panchang/rahukaal',     icon:'🐉', label:"Today's Rahu Kaal" },
];

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/horoscope', label: 'Horoscope' },
  { to: '/sade-sati', label: 'Sade Sati' },
  { to: '/mangal-dosha', label: 'Mangal Dosha' },
  { to: '/remedies', label: 'Remedies' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobilePanchangOpen, setMobilePanchangOpen] = useState(false);
  const [mobileFreeToolsOpen, setMobileFreeToolsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = React.useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setMobilePanchangOpen(false); setMobileFreeToolsOpen(false); setUserDropdownOpen(false); }, [location]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPanchangActive = location.pathname.startsWith('/panchang');

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${scrolled ? 'bg-cosmic-900/95 shadow-lg shadow-black/30' : 'bg-cosmic-900/75'}`}>
      <div className="w-full pl-0 pr-4 md:pr-8 h-16 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <Link to="/" className="flex items-center gap-2 self-start mt-2">
          <span className="text-gold-400 text-2xl">✦</span>
          <span className="font-serif text-gold-400 text-2xl font-semibold text-glow-gold">AstroVyoma</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map(link => {
            const isActive = location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-all flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                  isActive
                    ? 'border-gold-400/80 bg-gold-400/15 text-gold-400 font-medium'
                    : link.highlightColor === 'saffron'
                      ? 'border-orange-400/70 bg-orange-500/15 text-orange-300 hover:bg-orange-500/25 hover:text-orange-200 hover:border-orange-400'
                      : link.highlightColor === 'violet'
                        ? 'border-violet-400/70 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 hover:text-violet-200 hover:border-violet-400'
                        : link.highlight
                          ? 'border-amber-500/70 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 hover:text-amber-200 hover:border-amber-400'
                          : 'border-white/30 text-gray-300 hover:text-gold-400 hover:border-gold-400/70 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <PanchangDropdown isPanchangActive={isPanchangActive} location={location} />
          {[
            { to: '/numerology', label: 'Numerology' },
            { to: '/tarot', label: 'Tarot Reader' },
            { to: '/plans', label: 'Plans', highlightColor: 'violet' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm transition-all flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                location.pathname === link.to || location.pathname.startsWith(link.to)
                  ? 'border-gold-400/80 bg-gold-400/15 text-gold-400 font-medium'
                  : link.highlightColor === 'violet'
                    ? 'border-violet-400/70 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 hover:text-violet-200 hover:border-violet-400'
                    : 'border-white/30 text-gray-300 hover:text-gold-400 hover:border-gold-400/70 hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Cart icon */}
          <Link to="/cart" className="relative text-gray-300 hover:text-gold-400 transition-colors p-1">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-cosmic-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/wallet" className="flex items-center gap-2 text-gold-400 text-sm hover:text-gold-300 transition-colors">
                <Wallet className="w-4 h-4" />
                <span>₹{parseFloat(user.wallet_balance || 0).toFixed(0)}</span>
              </Link>

              {/* User dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(o => !o)}
                  className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-3 py-1.5 hover:bg-gold-500/20 transition-colors"
                >
                  <User className="w-4 h-4 text-gold-400" />
                  <span className="text-gold-300 text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gold-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden py-1"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.75)' }}
                    >
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/my-appointments" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors">
                        <span className="w-4 text-center flex-shrink-0">📅</span>
                        <span>Appointments</span>
                      </Link>
                      <Link to="/history" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors">
                        <span className="w-4 text-center flex-shrink-0">📜</span>
                        <span>History</span>
                      </Link>
                      <div className="mx-3 my-0.5 border-t border-gold-600/10" />
                      <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <span className="w-4 text-center flex-shrink-0">🚪</span>
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-gold-400 text-sm transition-colors">Login</Link>
              <Link to="/register" className="btn-gold px-5 py-2 text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile cart icon */}
        <Link to="/cart" className="md:hidden relative text-gray-300 hover:text-gold-400 transition-colors p-1 mr-1">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-500 text-cosmic-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
        <button className="md:hidden text-gold-400 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Free Tools sub-bar — desktop only, second row */}
      <div className="hidden md:block" style={{ borderBottom: '1px solid rgba(201,168,76,0.18)', background: scrolled ? 'transparent' : 'rgba(6,4,18,0.55)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-1 py-1.5 overflow-x-auto pl-[60px] pr-4" style={{ scrollbarWidth: 'none' }}>
          {FREE_TOOLS_ITEMS.map(item => (
            <Link key={item.to} to={item.to}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 text-[13px] font-medium transition-all ${
                location.pathname === item.to
                  ? 'border-gold-400/70 bg-gold-400/15 text-gold-400'
                  : 'hover:bg-gold-500/10 hover:border-gold-400/60 hover:text-gold-300'
              }`}
              style={{
                color: location.pathname === item.to ? undefined : '#ffffff',
                border: '1px solid rgba(201,168,76,0.60)',
              }}>
              {item.label}
            </Link>
          ))}
        </div>

      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cosmic-900/95 backdrop-blur-md border-t border-gold-600/20"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to}
                  className={`text-sm py-2.5 px-3 rounded-xl border-b border-gold-600/05 flex items-center gap-2 ${
                    location.pathname === link.to ? 'text-gold-400' : link.highlightColor === 'saffron' ? 'text-orange-300' : link.highlightColor === 'violet' ? 'text-violet-300' : link.highlight ? 'text-amber-300' : 'text-gray-300'
                  }`}>
                  {link.icon && <span>{link.icon}</span>}
                  {link.label}
                  {link.highlightColor === 'saffron' && <span className="ml-auto text-[10px] bg-orange-500/20 border border-orange-500/40 text-orange-300 px-2 py-0.5 rounded-full">Tool</span>}
                  {link.highlightColor === 'violet' && <span className="ml-auto text-[10px] bg-violet-500/20 border border-violet-500/40 text-violet-300 px-2 py-0.5 rounded-full">New</span>}
                  {link.highlight && !link.highlightColor && <span className="ml-auto text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full">New</span>}
                </Link>
              ))}


              {/* Mobile Panchang accordion */}
              <div>
                <button
                  onClick={() => setMobilePanchangOpen(o => !o)}
                  className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-xl ${isPanchangActive ? 'text-gold-400' : 'text-gray-300'}`}
                >
                  <span>Panchang</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobilePanchangOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobilePanchangOpen && (
                    <motion.div
                      initial={{ opacity:0, height:0 }}
                      animate={{ opacity:1, height:'auto' }}
                      exit={{ opacity:0, height:0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-3 border-l border-gold-600/20 pl-3 pb-1">
                        {PANCHANG_ITEMS.map(item => (
                          <Link key={item.to} to={item.to}
                            className={`flex items-center gap-2.5 text-sm py-2 ${location.pathname === item.to ? 'text-gold-400' : 'text-gray-200'}`}>
                            <span className="w-4 text-center">{item.icon}</span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Free Tools accordion */}
              <div>
                <button
                  onClick={() => setMobileFreeToolsOpen(o => !o)}
                  className="w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-xl text-gray-300"
                >
                  <span className="flex items-center gap-2">🛠️ Free Tools</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileFreeToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileFreeToolsOpen && (
                    <motion.div
                      initial={{ opacity:0, height:0 }}
                      animate={{ opacity:1, height:'auto' }}
                      exit={{ opacity:0, height:0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-3 border-l border-gold-600/20 pl-3 pb-1 grid grid-cols-2 gap-0.5">
                        {FREE_TOOLS_ITEMS.map(item => (
                          <Link key={item.to} to={item.to}
                            className={`flex items-center gap-2 text-sm py-2 px-1 ${location.pathname === item.to ? 'text-gold-400' : 'text-gray-200'}`}>
                            <span className="text-base flex-shrink-0">{item.icon}</span>
                            <span className="text-xs leading-tight">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[
                { to: '/numerology', label: 'Numerology' },
                { to: '/tarot', label: 'Tarot Reader' },
                { to: '/plans', label: 'Plans', highlightColor: 'violet' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className={`text-sm py-2.5 px-3 rounded-xl border-b border-gold-600/05 flex items-center gap-2 ${
                    location.pathname === link.to ? 'text-gold-400' : link.highlightColor === 'violet' ? 'text-violet-300' : 'text-gray-300'
                  }`}>
                  {link.label}
                  {link.highlightColor === 'violet' && <span className="ml-auto text-[10px] bg-violet-500/20 border border-violet-500/40 text-violet-300 px-2 py-0.5 rounded-full">New</span>}
                </Link>
              ))}

              {user ? (
                <div className="pt-2 mt-1 space-y-2 border-t border-gold-600/10">
                  <div className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-xl px-3 py-2">
                    <User className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span className="text-gold-300 text-sm font-medium truncate">{user.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link to="/wallet" className="text-gold-400 text-sm flex items-center gap-1"><Wallet className="w-4 h-4" /> ₹{parseFloat(user.wallet_balance || 0).toFixed(0)}</Link>
                    <Link to="/history" className="text-gray-300 text-sm hover:text-gold-400">History</Link>
                    <Link to="/my-appointments" className="text-gray-300 text-sm hover:text-gold-400">Appointments</Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="text-red-400 text-sm">Logout</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 pt-2 mt-1 border-t border-gold-600/10">
                  <Link to="/login" className="btn-outline-gold px-4 py-2 text-sm flex-1 text-center">Login</Link>
                  <Link to="/register" className="btn-gold px-4 py-2 text-sm flex-1 text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


// h-full makes the wrapper span the entire navbar height (64px).
// The panel sits at top-full = bottom of navbar — zero gap, zero dead zone.
// Cursor anywhere in the 64px wrapper → group hovered → panel shows instantly.
// visibility (not in transition) flips to hidden at frame 0 on leave = instant close.
function PanchangDropdown({ isPanchangActive, location }) {
  return (
    <div className="group relative h-full flex items-center">
      <button className={`flex items-center gap-1.5 text-sm transition-all px-3 py-1 rounded-full border ${isPanchangActive ? 'border-gold-400/80 bg-gold-400/15 text-gold-400 font-medium' : 'border-white/30 text-gray-300 hover:text-gold-400 hover:border-gold-400/70 hover:bg-white/5'}`}>
        Panchang
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
      </button>

      <div className="absolute top-full left-0 w-52 invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-75">
        <div
          className="bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden py-1"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.75)' }}
        >
          {PANCHANG_ITEMS.map((item) => (
            <React.Fragment key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-75 hover:bg-white/5 hover:text-gold-400 ${location.pathname === item.to ? 'text-gold-400 bg-white/5' : 'text-gray-300'}`}
              >
                <span className="w-5 text-center flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
              {item.dividerAfter && <div className="mx-3 my-0.5 border-t border-gold-600/10" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
