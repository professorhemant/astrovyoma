const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');
const aiRateLimit = require('../middleware/aiRateLimit');

const authController = require('../controllers/authController');
const kundaliController = require('../controllers/kundaliController');
const astrologerController = require('../controllers/astrologerController');
const consultationController = require('../controllers/consultationController');
const consultationAiController = require('../controllers/consultationAiController');
const chatbotController = require('../controllers/chatbotController');
const walletController = require('../controllers/walletController');
const horoscopeController = require('../controllers/horoscopeController');
const geocodeController = require('../controllers/geocodeController');
const reviewController = require('../controllers/reviewController');
const panchangController = require('../controllers/panchangController');
const remediesController = require('../controllers/remediesController');
const namkaranController = require('../controllers/namkaranController');
const mallController = require('../controllers/mallController');
const poojaController = require('../controllers/poojaController');
const tarotController = require('../controllers/tarotController');
const numerologyController = require('../controllers/numerologyController');
const sadeSatiController = require('../controllers/sadeSatiController');
const mangalDoshaController = require('../controllers/mangalDoshaController');
const extendedHoroscopeController = require('../controllers/extendedHoroscopeController');
const luckyController = require('../controllers/luckyController');
const gochraController   = require('../controllers/gochraController');
const gunaMilanController  = require('../controllers/gunaMilanController');
const lalKitabController   = require('../controllers/lalKitabController');
const domainReportController    = require('../controllers/domainReportController');
const eventsCalendarController  = require('../controllers/eventsCalendarController');
const subscriptionController    = require('../controllers/subscriptionController');
const blogController            = require('../controllers/blogController');
const crystalController         = require('../controllers/crystalController');
const appointmentController     = require('../controllers/appointmentController');
const kpController              = require('../controllers/kpController');
const dreamController           = require('../controllers/dreamController');
const yogaController            = require('../controllers/yogaController');
const muhurtaController         = require('../controllers/muhurtaController');
const reportHistoryController   = require('../controllers/reportHistoryController');
const agoraService = require('../services/agoraService');
const panditController = require('../controllers/panditController');
const adminController = require('../controllers/adminController');
const payoutController = require('../controllers/payoutController');
const astrologerApplicationController = require('../controllers/astrologerApplicationController');
const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

function panditAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Pandit token required' });
  try {
    req.pandit = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Admin setup (one-time, requires ADMIN_SECRET)
router.post('/admin/setup', adminController.setupAdmin);

// Admin routes (require auth + admin role)
router.get('/admin/stats',                      auth, adminAuth, adminController.getStats);
router.get('/admin/users',                      auth, adminAuth, adminController.getUsers);
router.put('/admin/users/:id',                  auth, adminAuth, adminController.updateUser);
router.delete('/admin/users/:id',               auth, adminAuth, adminController.deleteUser);
router.get('/admin/astrologers',                auth, adminAuth, adminController.getAstrologers);
router.post('/admin/astrologers',               auth, adminAuth, adminController.createAstrologer);
router.put('/admin/astrologers/:id',            auth, adminAuth, adminController.updateAstrologer);
router.delete('/admin/astrologers/:id',         auth, adminAuth, adminController.deleteAstrologer);
router.post('/admin/astrologers/:id/reset-pin', auth, adminAuth, adminController.resetAstrologerPin);
router.post('/admin/astrologers/cleanup-demo', auth, adminAuth, adminController.cleanupDemoAstrologers);
router.get('/admin/consultations',              auth, adminAuth, adminController.getConsultations);
router.get('/admin/transactions',               auth, adminAuth, adminController.getTransactions);
router.get('/admin/settings',                   auth, adminAuth, adminController.getSiteSettings);
router.put('/admin/settings',                   auth, adminAuth, adminController.updateSiteSettings);
router.get('/admin/appointments',               auth, adminAuth, adminController.getAppointments);
router.get('/admin/revenue',                    auth, adminAuth, adminController.getRevenue);
router.get('/admin/payouts',                    auth, adminAuth, payoutController.getPending);
router.post('/admin/payouts/pay',               auth, adminAuth, payoutController.payAstrologer);
router.post('/admin/payouts/undo',              auth, adminAuth, payoutController.undoPayout);

// Astrologer application routes
router.post('/astrologer/apply', astrologerApplicationController.submitApplication);
router.get('/admin/applications', auth, adminAuth, astrologerApplicationController.getApplications);
router.post('/admin/applications/:id/approve', auth, adminAuth, astrologerApplicationController.approveApplication);
router.post('/admin/applications/:id/reject', auth, adminAuth, astrologerApplicationController.rejectApplication);
router.delete('/admin/applications/:id', auth, adminAuth, astrologerApplicationController.deleteApplication);

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.patch('/auth/me/contact', auth, authController.completeContact);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Kundali routes
router.post('/kundali/generate-public', kundaliController.generatePublicKundali);
router.post('/kundali/generate', auth, kundaliController.generateKundali);
router.get('/kundali/mine', auth, kundaliController.getMyKundali);
router.get('/kundali/personality', auth, kundaliController.getPersonalityReport);
router.get('/kundali/pdf/summary', auth, kundaliController.downloadSummaryPDF);
router.get('/kundali/pdf/detailed', auth, kundaliController.downloadDetailedPDF);
router.get('/kundali/namkaran', auth, kundaliController.getNamkaran);
router.post('/kundali/namkaran-public', kundaliController.getNamkaranPublic);
router.get('/kundali/pdf/summary/hindi', auth, kundaliController.downloadSummaryPDFHindi);
router.get('/kundali/pdf/detailed/hindi', auth, kundaliController.downloadDetailedPDFHindi);

// Pandit portal routes
router.post('/pandit/login', panditController.panditLogin);
router.get('/pandit/me', panditAuth, panditController.getStatus);
router.patch('/pandit/status', panditAuth, panditController.toggleStatus);
router.get('/pandit/earnings', panditAuth, panditController.getEarnings);
router.patch('/pandit/contact',     panditAuth, panditController.setContact);
router.get('/pandit/availability',  panditAuth, panditController.getAvailability);
router.put('/pandit/availability',  panditAuth, panditController.setAvailability);
router.get('/pandit/appointments',  panditAuth, panditController.getAppointments);
// Incoming calls. Polled by the portal while the astrologer is online.
router.get('/pandit/calls', panditAuth, panditController.getIncomingCalls);
router.post('/pandit/calls/:id/accept', panditAuth, panditController.acceptCall);
router.post('/pandit/calls/:id/decline', panditAuth, panditController.declineCall);
router.post('/pandit/calls/:id/end', panditAuth, panditController.endCall);

// Astrologer routes
router.get('/astrologers', astrologerController.getAstrologers);
router.get('/astrologers/:id', astrologerController.getAstrologerById);
router.patch('/astrologers/status', auth, astrologerController.updateOnlineStatus);

// Consultation routes
router.get('/consultations/my', auth, consultationAiController.getMyConsultations);
router.post('/consultations/start', auth, consultationController.startConsultation);
router.get('/consultations/:id/status', auth, consultationController.getConsultationStatus);
router.post('/consultations/:id/connected', auth, consultationController.markConnected);
router.post('/consultations/:id/end', auth, consultationController.endConsultation);
router.get('/consultations/:id/messages', auth, consultationController.getMessages);
router.post('/consultations/:id/messages', auth, consultationController.sendMessage);
// /consultations/:id/ai-reply is withdrawn. It took an astrologer's name and
// prompted a language model to answer as that person, and its replies were
// stored as if the astrologer had written them. Nothing should be able to reach
// it, so it is unrouted rather than merely unused by the front end.

// Review routes
router.post('/reviews', auth, reviewController.submitReview);

// Chatbot routes
router.post('/chatbot/chat', auth, chatbotController.chat);
router.post('/chatbot/clear', auth, chatbotController.clearHistory);
router.post('/chatbot/pandit', auth, chatbotController.panditChat);
router.post('/chatbot/pandit-clear', auth, chatbotController.clearPanditHistory);

// Wallet routes
router.get('/wallet/balance', auth, walletController.getBalance);
router.get('/wallet/packs', walletController.getPacks);
router.post('/wallet/recharge/order',  auth, walletController.createRechargeOrder);
router.post('/wallet/recharge/verify', auth, walletController.verifyRecharge);
router.post('/wallet/recharge', auth, walletController.legacyRecharge); // withdrawn — see controller
router.get('/wallet/transactions', auth, walletController.getTransactions);

// Horoscope routes
router.get('/horoscope/daily/:sign', horoscopeController.getDailyHoroscope);
router.get('/horoscope/daily', horoscopeController.getAllDailyHoroscopes);

// Geocode routes
router.get('/geocode/search', geocodeController.searchPlace);

// Panchang routes
router.get('/panchang/calendar',      panchangController.getPanchangCalendar);
router.get('/panchang/tithi',         panchangController.getTodayTithi);
router.get('/panchang/nakshatra',     panchangController.getTodayNakshatra);
router.get('/panchang/choghadiya',    panchangController.getTodayChoghadiya);
router.get('/panchang/rahukaal',      panchangController.getTodayRahuKaal);
router.get('/panchang/shubhamuhurat', panchangController.getTodayShubhamuhurat);
router.get('/panchang',               panchangController.getPanchang);

// Namkaran Sanskar — standalone tool (no kundali required)
router.post('/namkaran/calculate', auth, namkaranController.calculateNamkaran);

// Remedies route
router.post('/remedies', optionalAuth, aiRateLimit, remediesController.getRemedies);

// Tarot reading route (no auth required — public discovery feature)
router.post('/tarot/reading', optionalAuth, aiRateLimit, tarotController.getTarotReading);

// Numerology — pure math, no auth, no DB
router.post('/numerology/calculate', numerologyController.calculate);

// Sade Sati — pure math, no auth, no DB
router.post('/sade-sati/calculate', sadeSatiController.calculate);

// Mangal Dosha — pure math, no auth, no DB
router.post('/mangal-dosha/calculate', mangalDoshaController.calculate);

// Extended horoscopes (weekly / monthly / yearly)
router.get('/horoscope/weekly/:sign',  extendedHoroscopeController.getWeekly);
router.get('/horoscope/monthly/:sign', extendedHoroscopeController.getMonthly);
router.get('/horoscope/yearly/:sign',  extendedHoroscopeController.getYearly);

// Today's Lucky Info
router.get('/lucky/today/:sign', luckyController.getToday);
router.get('/lucky/today',       luckyController.getAllToday);

// Gochara (Transit) Predictions — pure math, no auth
router.post('/gochara/calculate', gochraController.calculate);

// Guna Milan (Kundali Matching) — pure math, no auth
router.post('/guna-milan/calculate', gunaMilanController.calculate);

// Lal Kitab analysis — pure math, no auth
router.post('/lal-kitab/analyse', lalKitabController.analyse);

// Life Domain Reports — pure math, no auth
router.post('/domain-report/generate', domainReportController.generate);

// Festival & Planetary Events Calendar — static data, no auth
router.get('/events/calendar', eventsCalendarController.getCalendar);
router.get('/events/year',     eventsCalendarController.getYearEvents);

// ─── editable content ────────────────────────────────────────────────────────
// Public reads for the site to render from; everything that writes is admin-only.
const contentController = require('../controllers/contentController');
router.get('/content/bundle',           contentController.publicBundle);
// Settings on their own, for a page that needs a figure but no lists — asking
// for the bundle with no keys would fetch every list on the site to get them.
// Must stay above /content/:listKey or that route swallows it.
router.get('/content/settings',         contentController.publicSettings);
router.get('/content/:listKey',         contentController.publicList);

router.get('/admin/content/schema',     auth, adminAuth, contentController.getSchema);
router.get('/admin/content/:listKey',   auth, adminAuth, contentController.adminList);
router.post('/admin/content/:listKey',  auth, adminAuth, contentController.create);
router.post('/admin/content/:listKey/reorder', auth, adminAuth, contentController.reorder);
router.post('/admin/content/:listKey/reset',   auth, adminAuth, contentController.reset);
router.put('/admin/content/:listKey/:id',      auth, adminAuth, contentController.update);
router.delete('/admin/content/:listKey/:id',   auth, adminAuth, contentController.remove);

// ─── image uploads ───────────────────────────────────────────────────────────
const mediaController = require('../controllers/mediaController');
router.get('/media/:id',      mediaController.serve);          // public
router.get('/admin/media',    auth, adminAuth, mediaController.list);
router.post('/admin/media',   auth, adminAuth, mediaController.uploadMiddleware, mediaController.create);
router.delete('/admin/media/:id', auth, adminAuth, mediaController.remove);

// Appointments / Scheduling
router.get('/appointments/slots/:astrologerId',           appointmentController.getSlots);
router.get('/appointments/my',                            auth, appointmentController.getMyAppointments);
router.post('/appointments/book',                         auth, appointmentController.bookAppointment);
router.put('/appointments/:id/cancel',                    auth, appointmentController.cancelAppointment);
router.get('/appointments/astrologer/:astrologerId',      auth, appointmentController.getAstrologerAppointments);

// Crystal Guide — static content, no auth
router.get('/crystals',       crystalController.listCrystals);
router.get('/crystals/:slug', crystalController.getCrystal);

// Blog / Articles — static content, no auth
router.get('/blog/articles',       blogController.listArticles);
router.get('/blog/articles/:slug', blogController.getArticle);

// Subscription plans
router.get('/subscriptions/plans',   subscriptionController.getPlans);
router.get('/subscriptions/my',      auth, subscriptionController.getMy);
router.post('/subscriptions/order',  auth, subscriptionController.createOrder);
router.post('/subscriptions/verify', auth, subscriptionController.verifyPayment);

// Book a Pooja routes
router.get('/pooja/paaths',    poojaController.getPaaths);
router.post('/pooja/order',    poojaController.createOrder);
router.post('/pooja/verify',   poojaController.verifyAndBook);

// Astro Mall routes
router.get('/mall/categories',    mallController.getCategories);
router.get('/mall/products',      mallController.getProducts);
router.get('/mall/products/:id',  mallController.getProductById);

// KP Astrology
router.post('/kp/analyse', kpController.analyse);

// Dream Interpretation
router.post('/dream/interpret', optionalAuth, aiRateLimit, dreamController.interpret);


// Planetary Yoga Finder
router.post('/yoga/analyse', yogaController.analyse);

// Muhurta Calculator
router.get('/muhurta/event-types', muhurtaController.getEventTypes);
router.post('/muhurta/calculate',  muhurtaController.calculate);
router.post('/muhurta/best-dates', muhurtaController.bestDates);

// Report History — save any report, retrieve all
router.post('/history/save',   auth, reportHistoryController.saveReport);
router.get('/history',         auth, reportHistoryController.getHistory);
router.delete('/history/:id',  auth, reportHistoryController.deleteReport);

// Agora token route
router.post('/agora/token', auth, (req, res) => {
  const { channel, uid } = req.body;
  if (!channel) return res.status(400).json({ error: 'channel is required' });
  if (!agoraService.isConfigured() && process.env.NODE_ENV === 'production') {
    return res.status(503).json({ error: 'Voice and video calls are temporarily unavailable.' });
  }
  const result = agoraService.generateToken(channel, uid || 0);
  res.json(result);
});

module.exports = router;
