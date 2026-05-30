import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CosmicBackground from './components/CosmicBackground';
import Navbar from './components/Navbar';
import FloatingAIButton from './components/FloatingAIButton';

import HomePage from './pages/HomePage';
import KundaliPage from './pages/KundaliPage';
import PurposePage from './pages/PurposePage';
import AstrologersPage from './pages/AstrologersPage';
import PanditPortalPage from './pages/PanditPortalPage';
import AstrologerDetailPage from './pages/AstrologerDetailPage';
import ConsultationPage from './pages/ConsultationPage';
import ChatbotPage from './pages/ChatbotPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import HoroscopePage from './pages/HoroscopePage';
import HoroscopeSignPage from './pages/HoroscopeSignPage';
import KundaliMatchingPage from './pages/KundaliMatchingPage';
import NakshatraPage from './pages/NakshatraPage';
import DashaPage from './pages/DashaPage';
import PanchangPage from './pages/PanchangPage';
import PanchangCalendarPage from './pages/PanchangCalendarPage';
import TodayTithiPage from './pages/TodayTithiPage';
import TodayNakshatraPage from './pages/TodayNakshatraPage';
import TodayChoghadiyaPage from './pages/TodayChoghadiyaPage';
import TodayRahuKaalPage from './pages/TodayRahuKaalPage';
import TodayShubhamuhuratPage from './pages/TodayShubhamuhuratPage';
import ConsultationHistoryPage from './pages/ConsultationHistoryPage';
import RemediesPage from './pages/RemediesPage';
import AstroMallPage from './pages/AstroMallPage';
import BookPoojaPage from './pages/BookPoojaPage';
import AstroMallProductPage from './pages/AstroMallProductPage';
import CartPage from './pages/CartPage';
import NotFoundPage from './pages/NotFoundPage';
import NamkaranPage from './pages/NamkaranPage';
import PanditJiPage from './pages/PanditJiPage';
import TarotPage from './pages/TarotPage';
import NumerologyPage from './pages/NumerologyPage';
import SadeSatiPage from './pages/SadeSatiPage';
import MangalDoshaPage from './pages/MangalDoshaPage';
import WeeklyHoroscopePage from './pages/WeeklyHoroscopePage';
import GochraPage from './pages/GochraPage';
import VastuPage from './pages/VastuPage';
import LalKitabPage from './pages/LalKitabPage';
import LuckyPage from './pages/LuckyPage';
import FestivalCalendarPage from './pages/FestivalCalendarPage';
import PlansPage from './pages/PlansPage';
import ChatConsultPage from './pages/ChatConsultPage';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import CrystalGuidePage from './pages/CrystalGuidePage';
import CrystalDetailPage from './pages/CrystalDetailPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MuhurtaPage              from './pages/MuhurtaPage';
import VastuPoojaPage           from './pages/VastuPoojaPage';
import PalmistryPage            from './pages/PalmistryPage';
import YogaFinderPage           from './pages/YogaFinderPage';
import AboutUsPage              from './pages/AboutUsPage';
import JoinAsAstrologerPage    from './pages/JoinAsAstrologerPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-cosmic-950 flex items-center justify-center">
      <div className="text-gold-400 text-2xl font-serif animate-pulse">✦ AstroVyoma</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  const location = useLocation();
  const isConsultation = location.pathname.startsWith('/consult/') || location.pathname.startsWith('/chat-consult/');
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {/* Persistent background — never unmounts on navigation */}
      <CosmicBackground />
      {!isConsultation && !isAdmin && <Navbar />}
      {!isAdmin && <FloatingAIButton />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/kundali" element={<KundaliPage />} />
            <Route path="/purpose" element={<PurposePage />} />
            <Route path="/astrologers" element={<AstrologersPage />} />
            <Route path="/pandit" element={<PanditPortalPage />} />
            <Route path="/astrologers/:id" element={<AstrologerDetailPage />} />
            <Route path="/consult/:id" element={<ProtectedRoute><ConsultationPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/pandit" element={<PanditJiPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/horoscope/extended" element={<WeeklyHoroscopePage />} />
            <Route path="/horoscope/:sign" element={<HoroscopeSignPage />} />
            <Route path="/horoscope" element={<HoroscopePage />} />
            <Route path="/matching" element={<KundaliMatchingPage />} />
            <Route path="/nakshatra" element={<NakshatraPage />} />
            <Route path="/dasha" element={<DashaPage />} />
            <Route path="/panchang/calendar"      element={<PanchangCalendarPage />} />
            <Route path="/panchang/tithi"         element={<TodayTithiPage />} />
            <Route path="/panchang/nakshatra"     element={<TodayNakshatraPage />} />
            <Route path="/panchang/choghadiya"    element={<TodayChoghadiyaPage />} />
            <Route path="/panchang/rahukaal"      element={<TodayRahuKaalPage />} />
            <Route path="/panchang/shubhamuhurat" element={<TodayShubhamuhuratPage />} />
            <Route path="/panchang"               element={<PanchangPage />} />
            <Route path="/history" element={<ProtectedRoute><ConsultationHistoryPage /></ProtectedRoute>} />
            <Route path="/remedies" element={<ProtectedRoute><RemediesPage /></ProtectedRoute>} />
            <Route path="/book-pooja" element={<BookPoojaPage />} />
            <Route path="/mall" element={<AstroMallPage />} />
            <Route path="/mall/product/:id" element={<AstroMallProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/namkaran" element={<NamkaranPage />} />
            <Route path="/tarot" element={<TarotPage />} />
            <Route path="/numerology" element={<NumerologyPage />} />
            <Route path="/sade-sati" element={<SadeSatiPage />} />
            <Route path="/mangal-dosha" element={<MangalDoshaPage />} />
            <Route path="/gochara" element={<GochraPage />} />
            <Route path="/vastu" element={<VastuPage />} />
            <Route path="/lal-kitab" element={<LalKitabPage />} />
            <Route path="/lucky" element={<LuckyPage />} />
            <Route path="/festivals" element={<FestivalCalendarPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/chat-consult/:id" element={<ProtectedRoute><ChatConsultPage /></ProtectedRoute>} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/crystals" element={<CrystalGuidePage />} />
            <Route path="/crystals/:slug" element={<CrystalDetailPage />} />
            <Route path="/book-appointment/:astrologerId" element={<ProtectedRoute><BookAppointmentPage /></ProtectedRoute>} />
            <Route path="/my-appointments" element={<ProtectedRoute><MyAppointmentsPage /></ProtectedRoute>} />
            <Route path="/muhurta"               element={<MuhurtaPage />} />
            <Route path="/vastu-pooja"           element={<VastuPoojaPage />} />
            <Route path="/palmistry"             element={<PalmistryPage />} />
            <Route path="/yoga-finder"           element={<YogaFinderPage />} />
            <Route path="/about"                 element={<AboutUsPage />} />
            <Route path="/join-as-astrologer"   element={<JoinAsAstrologerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppLayout />
      </CartProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1540',
            color: '#E8C547',
            border: '1px solid rgba(160,120,50,0.3)',
            fontFamily: 'Inter, sans-serif'
          },
          success: { iconTheme: { primary: '#E8C547', secondary: '#0F1540' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0F1540' } }
        }}
      />
    </AuthProvider>
  );
}
