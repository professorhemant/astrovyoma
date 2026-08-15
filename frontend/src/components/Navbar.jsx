import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Menu, X, User, ChevronDown, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { content as contentApi } from '../api';

// One source of truth for the whole menu — desktop dropdowns and the mobile
// accordions both render from this, so a link can never exist on one and not
// the other. Adding a page to the nav is adding a line here.
//
// /lal-kitab and /yoga-finder are deliberately absent: both pages are still
// routed and reachable by URL, they are just off the menu.
const NAV_GROUPS = [
  {
    label: 'Kundali',
    items: [
      { to: '/kundali',   icon: '🪐', label: 'Free Kundali' },
      { to: '/matching',  icon: '💫', label: 'Kundali Matching' },
      { to: '/nakshatra', icon: '⭐', label: 'Nakshatra Reading' },
      { to: '/dasha',     icon: '🌙', label: 'Dasha Timeline' },
      { to: '/purpose',   icon: '☯',  label: 'Find Your Purpose' },
    ],
  },
  {
    label: 'Horoscope',
    items: [
      { to: '/horoscope',          icon: '⭐', label: 'Daily Horoscope' },
      { to: '/horoscope/extended', icon: '📅', label: 'Weekly & Extended', dividerAfter: true },
      { to: '/sade-sati',          icon: '🪐', label: 'Sade Sati' },
      { to: '/mangal-dosha',       icon: '🔴', label: 'Mangal Dosha' },
      { to: '/remedies',           icon: '🙏', label: 'Remedies' },
    ],
  },
  {
    label: 'Panchang',
    items: [
      { to: '/panchang/calendar',      icon: '📅', label: 'Panchang Calendar' },
      { to: '/panchang',               icon: '🕉️', label: "Today's Panchang", dividerAfter: true },
      { to: '/panchang/tithi',         icon: '🌙', label: "Today's Tithi" },
      { to: '/panchang/shubhamuhurat', icon: '✨', label: "Today's Shubhamuhurat" },
      { to: '/panchang/nakshatra',     icon: '⭐', label: "Today's Nakshatra" },
      { to: '/panchang/choghadiya',    icon: '⏰', label: "Today's Choghadiya" },
      { to: '/panchang/rahukaal',      icon: '🐉', label: "Today's Rahu Kaal", dividerAfter: true },
      { to: '/muhurta',                icon: '🕐', label: 'Muhurta Calculator' },
      { to: '/lucky',                  icon: '🍀', label: "Today's Lucky Info" },
      { to: '/gochara',                icon: '🌍', label: 'Gochara (Transit)' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/numerology', icon: '🔢', label: 'Numerology' },
      { to: '/tarot',      icon: '🔮', label: 'Tarot Reader' },
      { to: '/vastu',      icon: '🏠', label: 'Vastu Shastra' },
      { to: '/namkaran',   icon: '🍼', label: 'Namkaran Tool' },
      { to: '/festivals',  icon: '🗓️', label: 'Festival Calendar' },
      { to: '/crystals',   icon: '💎', label: 'Crystal & Gem Guide' },
    ],
  },
  {
    label: 'Shop',
    items: [
      { to: '/mall',        icon: '🛍️', label: 'Astro Mall' },
      { to: '/book-pooja',  icon: '🪔', label: 'Book Pooja' },
      { to: '/vastu-pooja', icon: '🏡', label: 'Vastu Pooja', dividerAfter: true },
      { to: '/plans',       icon: '💎', label: 'Plans' },
    ],
  },
];

// `startsWith` alone would light up Kundali on /kundali-anything and leave
// /mall dark on /mall/product/:id. Match the segment boundary instead.
const isPathActive = (pathname, to) =>
  pathname === to || pathname.startsWith(`${to}/`);

// A group with a child on the current page reads as active, except for '/'
// which would otherwise match everything.
const isGroupActive = (pathname, group) =>
  group.items.some(item => item.to !== '/' && isPathActive(pathname, item.to));

// Rebuilds NAV_GROUPS from the admin's Menu lists. Links whose "Belongs to"
// does not match any dropdown are dropped rather than silently creating a stray
// menu — a typo should lose one link, not add a phantom heading.
function groupsFromCms(groups, items) {
  if (!groups?.length || !items?.length) return null;
  const built = groups.map(g => ({
    label: g.label,
    items: items
      .filter(i => (i.group || '').trim().toLowerCase() === (g.label || '').trim().toLowerCase())
      .map(i => ({ id: i.id, to: i.to, icon: i.icon, label: i.label })),
  })).filter(g => g.items.length);
  return built.length ? built : null;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { lang, setLang } = useLanguage();
  const [cmsGroups, setCmsGroups] = useState(null);

  // The hardcoded NAV_GROUPS above stays as the fallback: a failed request must
  // not leave the site with no navigation at all.
  useEffect(() => {
    contentApi.bundle(['nav_groups', 'nav_items'])
      .then(r => setCmsGroups(groupsFromCms(r.data.lists?.nav_groups, r.data.lists?.nav_items)))
      .catch(() => {});
  }, [lang]);

  const navGroups = cmsGroups || NAV_GROUPS;
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = React.useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setOpenMobileGroup(null); setUserDropdownOpen(false); }, [location]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${scrolled ? 'bg-cosmic-900/95 shadow-lg shadow-black/30' : 'bg-cosmic-900/75'}`}>
      <div className="w-full pl-4 pr-4 md:pr-8 h-16 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gold-400 text-2xl">✦</span>
          <span className="font-serif text-gold-400 text-2xl font-semibold text-glow-gold">AstroVyoma</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
          {navGroups.map(group => (
            <NavDropdown key={group.label} group={group} pathname={location.pathname} />
          ))}

          {/* Talk to AstroVyoma AI — blinking highlight.
              Three CTAs plus five dropdowns do not fit a 1280px bar at full
              size, so the pills run compact and the AI label drops its verb
              until there is room for it at 2xl. */}
          <Link
            to="/chat"
            className="text-xs 2xl:text-sm transition-all flex items-center gap-1.5 px-2.5 2xl:px-3 py-1 rounded-full border border-gold-400/80 bg-gold-400/15 text-gold-300 font-medium whitespace-nowrap hover:bg-gold-400/25 animate-blink-ai"
          >
            {/* Each piece is its own flex item so the gap-1.5 spaces them —
                a literal space here would stack on top of that gap. */}
            <span>✦</span>
            <span className="hidden 2xl:inline">Talk to</span>
            <span>AstroVyoma AI</span>
          </Link>

          {/* The paid path — a solid button so it outranks the dropdowns */}
          <Link
            to="/astrologers"
            className="btn-gold text-xs 2xl:text-sm px-3 2xl:px-4 py-1.5 whitespace-nowrap"
          >
            Talk to Astrologer
          </Link>

          {/* Supply side. Outlined rather than solid so it reads as the
              secondary ask next to the paid path it sits beside. */}
          <Link
            to="/join-as-astrologer"
            className="btn-outline-gold text-xs 2xl:text-sm px-3 2xl:px-4 py-1.5 whitespace-nowrap"
          >
            Join As Astrologer
          </Link>
        </div>

        <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
          {/* Reading language. Two words rather than a globe icon and a
              dropdown: there are two choices, and each is written in the
              language it selects, which is the only label that needs no
              translating. It switches the readings, not the buttons — see
              context/LanguageContext.jsx for why that line is drawn there. */}
          <div className="flex items-center rounded-full border border-gold-600/25 overflow-hidden text-[11px]"
            title="Language of the readings">
            {[['en', 'EN'], ['hi', 'हिन्दी']].map(([code, label]) => (
              <button key={code} onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`px-2.5 py-1 transition-colors ${
                  lang === code ? 'bg-gold-500/20 text-gold-300' : 'text-gray-400 hover:text-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>

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
                      className="absolute right-0 top-full mt-2 w-52 bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden py-1"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.75)' }}
                    >
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 transition-colors">
                          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                          <span>Admin Panel</span>
                          <span className="ml-auto text-[10px] bg-purple-500/20 border border-purple-500/40 text-purple-300 px-1.5 py-0.5 rounded-full">Admin</span>
                        </Link>
                      )}
                      <Link to="/my-appointments" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors">
                        <span className="w-4 text-center flex-shrink-0">📅</span>
                        <span>Appointments</span>
                      </Link>
                      <Link to="/history" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors">
                        <span className="w-4 text-center flex-shrink-0">📜</span>
                        <span>History</span>
                      </Link>
                      <div className="mx-3 my-0.5 border-t border-gold-600/10" />
                      <Link to="/join-as-astrologer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors">
                        <span className="w-4 text-center flex-shrink-0">⭐</span>
                        <span>Join As Astrologer</span>
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
              <Link to="/register" className="btn-gold px-5 py-2 text-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile cart icon */}
        <Link to="/cart" className="xl:hidden relative text-gray-300 hover:text-gold-400 transition-colors p-1 ml-auto mr-1">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-500 text-cosmic-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
        <button className="xl:hidden text-gold-400 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-cosmic-900/95 backdrop-blur-md border-t border-gold-600/20 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {/* The reading language, on a phone too. It sat only in the
                  desktop bar at first, which put it above 1280px — invisible on
                  every phone and most laptops, and the readers most likely to
                  want Hindi are the ones on phones. */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-gray-500">Readings in</span>
                <div className="flex items-center rounded-full border border-gold-600/25 overflow-hidden text-xs">
                  {[['en', 'English'], ['hi', 'हिन्दी']].map(([code, label]) => (
                    <button key={code} onClick={() => setLang(code)}
                      aria-pressed={lang === code}
                      className={`px-3 py-1.5 transition-colors ${
                        lang === code ? 'bg-gold-500/20 text-gold-300' : 'text-gray-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Both CTAs sit above the fold — they are why most people open this menu */}
              <Link
                to="/chat"
                className="text-sm py-2.5 px-3 rounded-xl flex items-center gap-2 border border-gold-400/80 bg-gold-400/15 text-gold-300 font-medium animate-blink-ai"
              >
                <span>✦</span>
                Talk to AstroVyoma AI
              </Link>
              <Link to="/astrologers" className="btn-gold text-sm py-2.5 px-3 text-center mb-1">
                Talk to Astrologer
              </Link>

              {navGroups.map(group => {
                const open = openMobileGroup === group.label;
                return (
                  <div key={group.label}>
                    <button
                      onClick={() => setOpenMobileGroup(o => (o === group.label ? null : group.label))}
                      className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-xl ${isGroupActive(location.pathname, group) ? 'text-gold-400' : 'text-gray-300'}`}
                    >
                      <span>{group.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-3 border-l border-gold-600/20 pl-3 pb-1">
                            {group.items.map((item, i) => (
                              <Link key={item.id || `${item.to}-${i}`} to={item.to}
                                className={`flex items-center gap-2.5 text-sm py-2 ${isPathActive(location.pathname, item.to) ? 'text-gold-400' : 'text-gray-200'}`}>
                                <span className="w-4 text-center flex-shrink-0">{item.icon}</span>
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

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
                  <Link to="/join-as-astrologer" className="flex items-center gap-2 text-gray-300 text-sm py-1 hover:text-gold-400">
                    <span>⭐</span> Join As Astrologer
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-3 py-2 text-purple-300 hover:bg-purple-500/20 transition-colors">
                      <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Admin Panel</span>
                      <span className="ml-auto text-[10px] bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 rounded-full">Admin</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="pt-2 mt-1 space-y-2 border-t border-gold-600/10">
                  <Link to="/join-as-astrologer" className="flex items-center gap-2 text-gray-300 text-sm py-1 hover:text-gold-400">
                    <span>⭐</span> Join As Astrologer
                  </Link>
                  <div className="flex gap-3">
                    <Link to="/login" className="btn-outline-gold px-4 py-2 text-sm flex-1 text-center">Login</Link>
                    <Link to="/register" className="btn-gold px-4 py-2 text-sm flex-1 text-center">Sign Up</Link>
                  </div>
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
function NavDropdown({ group, pathname }) {
  const active = isGroupActive(pathname, group);
  return (
    <div className="group relative h-full flex items-center">
      <button className={`flex items-center gap-1.5 text-sm transition-all px-3 py-1 rounded-full border whitespace-nowrap ${active ? 'border-gold-400/80 bg-gold-400/15 text-gold-400 font-medium' : 'border-white/30 text-gray-300 hover:text-gold-400 hover:border-gold-400/70 hover:bg-white/5'}`}>
        {group.label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
      </button>

      <div className="absolute top-full left-0 w-56 invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-75">
        <div
          className="bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden py-1"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.75)' }}
        >
          {group.items.map((item, i) => (
            <React.Fragment key={item.id || `${item.to}-${i}`}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-75 hover:bg-white/5 hover:text-gold-400 ${isPathActive(pathname, item.to) ? 'text-gold-400 bg-white/5' : 'text-gray-300'}`}
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
