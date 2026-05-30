import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('astrovyoma_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('astrovyoma_token');
      localStorage.removeItem('astrovyoma_user');
    }
    return Promise.reject(err);
  }
);

export const auth = {
  sendOtp: (data) => api.post('/auth/send-otp', data),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const kundali = {
  generate: (data) => api.post('/kundali/generate', data),
  getMyKundali: () => api.get('/kundali/mine'),
  getPersonality: () => api.get('/kundali/personality'),
  downloadSummaryPDF: () => api.get('/kundali/pdf/summary', { responseType: 'blob' }),
  downloadDetailedPDF: () => api.get('/kundali/pdf/detailed', { responseType: 'blob' }),
  getNamkaran: () => api.get('/kundali/namkaran'),
  downloadSummaryPDFHindi: () => api.get('/kundali/pdf/summary/hindi', { responseType: 'blob' }),
  downloadDetailedPDFHindi: () => api.get('/kundali/pdf/detailed/hindi', { responseType: 'blob' })
};

export const astrologers = {
  getAll: (params) => api.get('/astrologers', { params }),
  getById: (id) => api.get(`/astrologers/${id}`)
};

export const consultations = {
  start: (data) => api.post('/consultations/start', data),
  end: (id) => api.post(`/consultations/${id}/end`),
  getMessages: (id) => api.get(`/consultations/${id}/messages`),
  sendMessage: (id, data) => api.post(`/consultations/${id}/messages`, data),
  aiReply: (id, data) => api.post(`/consultations/${id}/ai-reply`, data),
  getMy: () => api.get('/consultations/my')
};

export const reviews = {
  submit: (data) => api.post('/reviews', data)
};

export const chatbot = {
  chat: (message) => api.post('/chatbot/chat', { message }),
  clearHistory: () => api.post('/chatbot/clear'),
  panditChat: (message) => api.post('/chatbot/pandit', { message }),
  panditClear: () => api.post('/chatbot/pandit-clear')
};

export const wallet = {
  getBalance: () => api.get('/wallet/balance'),
  recharge: (amount) => api.post('/wallet/recharge', { amount }),
  getTransactions: (params) => api.get('/wallet/transactions', { params })
};

export const horoscope = {
  getDaily:   (sign) => api.get(`/horoscope/daily/${sign}`),
  getAllDaily: ()     => api.get('/horoscope/daily'),
  getWeekly:  (sign) => api.get(`/horoscope/weekly/${sign}`),
  getMonthly: (sign) => api.get(`/horoscope/monthly/${sign}`),
  getYearly:  (sign, year) => api.get(`/horoscope/yearly/${sign}`, { params: year ? { year } : {} }),
};

export const geocode = {
  search: (q) => api.get('/geocode/search', { params: { q } })
};

export const panchang = {
  get:            (params) => api.get('/panchang',               { params }),
  calendar:       (params) => api.get('/panchang/calendar',      { params }),
  tithi:          (params) => api.get('/panchang/tithi',         { params }),
  nakshatra:      (params) => api.get('/panchang/nakshatra',     { params }),
  choghadiya:     (params) => api.get('/panchang/choghadiya',    { params }),
  rahuKaal:       (params) => api.get('/panchang/rahukaal',      { params }),
  shubhamuhurat:  (params) => api.get('/panchang/shubhamuhurat', { params }),
};

export const namkaran = {
  calculate: (data) => api.post('/namkaran/calculate', data),
};

export const remedies = {
  get: (data) => api.post('/remedies', data)
};

export const pooja = {
  getPaaths:      ()     => api.get('/pooja/paaths'),
  getVastuPujas:  ()     => api.get('/pooja/paaths?category=vastu'),
  createOrder:    (data) => api.post('/pooja/order', data),
  verifyPayment:  (data) => api.post('/pooja/verify', data),
};

export const mall = {
  getCategories: ()       => api.get('/mall/categories'),
  getProducts:   (params) => api.get('/mall/products', { params }),
  getProduct:    (id)     => api.get(`/mall/products/${id}`),
};

export const tarot = {
  reading: (data) => api.post('/tarot/reading', data),
};

export const numerology = {
  calculate: (data) => api.post('/numerology/calculate', data),
};

export const sadeSati = {
  calculate: (data) => api.post('/sade-sati/calculate', data),
};

export const mangalDosha = {
  calculate: (data) => api.post('/mangal-dosha/calculate', data),
};

export const lucky = {
  getToday:    (sign) => api.get(`/lucky/today/${sign}`),
  getAllToday:  ()     => api.get('/lucky/today'),
};

export const gochara = {
  calculate: (data) => api.post('/gochara/calculate', data),
};

export const gunaMilan = {
  calculate: (data) => api.post('/guna-milan/calculate', data),
};

export const lalKitab = {
  analyse: (data) => api.post('/lal-kitab/analyse', data),
};

export const domainReport = {
  generate: (data) => api.post('/domain-report/generate', data),
};

export const eventsCalendar = {
  get: (params) => api.get('/events/calendar', { params }),
};

export const appointments = {
  getSlots:  (astrologerId, params) => api.get(`/appointments/slots/${astrologerId}`, { params }),
  book:      (data)                 => api.post('/appointments/book', data),
  getMy:     ()                     => api.get('/appointments/my'),
  cancel:    (id, data)             => api.put(`/appointments/${id}/cancel`, data),
};

export const crystals = {
  list:       (params) => api.get('/crystals', { params }),
  getCrystal: (slug)   => api.get(`/crystals/${slug}`),
};

export const blog = {
  list:       (params) => api.get('/blog/articles', { params }),
  getArticle: (slug)   => api.get(`/blog/articles/${slug}`),
};

export const kpAstrology = {
  analyse: (data) => api.post('/kp/analyse', data),
};

export const dream = {
  interpret: (data) => api.post('/dream/interpret', data),
};

export const palmistry = {
  getOptions: ()     => api.get('/palmistry/options'),
  analyse:    (data) => api.post('/palmistry/analyse', data),
};

export const yoga = {
  analyse: (data) => api.post('/yoga/analyse', data),
};

export const muhurta = {
  getEventTypes: ()     => api.get('/muhurta/event-types'),
  calculate:     (data) => api.post('/muhurta/calculate', data),
};

export const reportHistory = {
  save:   (data) => api.post('/history/save', data),
  getAll: ()     => api.get('/history'),
  delete: (id)   => api.delete(`/history/${id}`),
};

export const subscriptions = {
  getPlans:      ()     => api.get('/subscriptions/plans'),
  getMy:         ()     => api.get('/subscriptions/my'),
  createOrder:   (data) => api.post('/subscriptions/order', data),
  verifyPayment: (data) => api.post('/subscriptions/verify', data),
};

export const admin = {
  setup:               (data) => api.post('/admin/setup', data),
  getStats:            ()     => api.get('/admin/stats'),
  getUsers:            (params) => api.get('/admin/users', { params }),
  updateUser:          (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:          (id) => api.delete(`/admin/users/${id}`),
  getAstrologers:      ()     => api.get('/admin/astrologers'),
  createAstrologer:    (data) => api.post('/admin/astrologers', data),
  updateAstrologer:    (id, data) => api.put(`/admin/astrologers/${id}`, data),
  deleteAstrologer:    (id) => api.delete(`/admin/astrologers/${id}`),
  getConsultations:    (params) => api.get('/admin/consultations', { params }),
  getTransactions:     (params) => api.get('/admin/transactions', { params }),
  getAppointments:     (params) => api.get('/admin/appointments', { params }),
  getRevenue:          ()     => api.get('/admin/revenue'),
  getSettings:         ()     => api.get('/admin/settings'),
  updateSettings:      (data) => api.put('/admin/settings', data),
};

export default api;
