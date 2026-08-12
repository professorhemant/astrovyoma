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
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me')
};

export const kundali = {
  generatePublic: (data) => api.post('/kundali/generate-public', data),
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
  getPacks: () => api.get('/wallet/packs'),
  createRechargeOrder: (amount) => api.post('/wallet/recharge/order', { amount }),
  verifyRecharge: (payload) => api.post('/wallet/recharge/verify', payload),
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

export const yoga = {
  analyse: (data) => api.post('/yoga/analyse', data),
};

export const muhurta = {
  getEventTypes: ()     => api.get('/muhurta/event-types'),
  calculate:     (data) => api.post('/muhurta/calculate', data),
  bestDates:     (data) => api.post('/muhurta/best-dates', data),
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
  deleteAstrologer:    (id, force) => api.delete(`/admin/astrologers/${id}${force ? '?force=true' : ''}`),
  cleanupDemoAstrologers: () => api.post('/admin/astrologers/cleanup-demo'),
  resetAstrologerPin:  (id) => api.post(`/admin/astrologers/${id}/reset-pin`),

  // Editable content — one generic set of calls for every list on the site.
  contentSchema:       ()            => api.get('/admin/content/schema'),
  contentList:         (key)         => api.get(`/admin/content/${key}`),
  contentCreate:       (key, data)   => api.post(`/admin/content/${key}`, data),
  contentUpdate:       (key, id, d)  => api.put(`/admin/content/${key}/${id}`, d),
  contentDelete:       (key, id)     => api.delete(`/admin/content/${key}/${id}`),
  contentReorder:      (key, ids)    => api.post(`/admin/content/${key}/reorder`, { ids }),
  contentReset:        (key)         => api.post(`/admin/content/${key}/reset`),

  // Image uploads. Let the browser set the multipart boundary itself — naming
  // the Content-Type by hand omits it and the server cannot parse the body.
  uploadImage:         (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/admin/media', fd);
  },
  listMedia:           ()   => api.get('/admin/media'),
  deleteMedia:         (id) => api.delete(`/admin/media/${id}`),
  getConsultations:    (params) => api.get('/admin/consultations', { params }),
  getTransactions:     (params) => api.get('/admin/transactions', { params }),
  getAppointments:     (params) => api.get('/admin/appointments', { params }),
  getRevenue:          ()     => api.get('/admin/revenue'),
  getPayouts:          (params) => api.get('/admin/payouts', { params }),
  payAstrologer:       (data) => api.post('/admin/payouts/pay', data),
  undoPayout:          (data) => api.post('/admin/payouts/undo', data),
  getSettings:         ()     => api.get('/admin/settings'),
  updateSettings:      (data) => api.put('/admin/settings', data),
};

// Public content feed the site renders from.
export const content = {
  bundle: (keys) => api.get('/content/bundle', { params: keys ? { keys: keys.join(',') } : {} }),
  list:   (key)  => api.get(`/content/${key}`),
};

export const astrologerApplications = {
  submit: (data) => api.post('/astrologer/apply', data),
  getAll: (params) => api.get('/admin/applications', { params }),
  approve: (id) => api.post(`/admin/applications/${id}/approve`),
  reject: (id, data) => api.post(`/admin/applications/${id}/reject`, data),
};

export default api;
