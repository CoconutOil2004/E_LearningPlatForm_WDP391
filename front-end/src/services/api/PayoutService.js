import { api } from "../index";

const PayoutService = {
  /**
   * Request payout
   * @param {Object} data - { amount, notes }
   */
  requestPayout: async (data) => {
    const response = await api.post("/instructor/payout/request", data);
    return response.data;
  },

  /**
   * Get payout history
   * @param {Object} params - { status, page, limit }
   */
  getPayoutHistory: async (params = {}) => {
    const response = await api.get("/instructor/payout/history", { params });
    return response.data;
  },

  /**
   * Get payout detail
   * @param {String} id - Payout ID
   */
  getPayoutDetail: async (id) => {
    const response = await api.get(`/instructor/payout/${id}`);
    return response.data;
  },

  /**
   * Cancel payout request
   * @param {String} id - Payout ID
   */
  cancelPayout: async (id) => {
    const response = await api.put(`/instructor/payout/${id}/cancel`);
    return response.data;
  },

  /**
   * Get payment settings
   */
  getPaymentSettings: async () => {
    const response = await api.get("/instructor/payment-settings");
    return response.data;
  },

  /**
   * Update payment settings
   * @param {Object} data - Payment settings data
   */
  updatePaymentSettings: async (data) => {
    const response = await api.put("/instructor/payment-settings", data);
    return response.data;
  },

  // Admin APIs
  getPendingPayouts: async (params = {}) => {
    const response = await api.get("/instructor/payout/admin/pending", { params });
    return response.data;
  },

  getAllPayouts: async (params = {}) => {
    const response = await api.get("/instructor/payout/admin/all", { params });
    return response.data;
  },

  getPayoutStatistics: async (params = {}) => {
    const response = await api.get("/instructor/payout/admin/statistics", { params });
    return response.data;
  },

  approvePayout: async (id, data) => {
    const response = await api.post(`/instructor/payout/admin/${id}/approve`, data);
    return response.data;
  },

  rejectPayout: async (id, data) => {
    const response = await api.post(`/instructor/payout/admin/${id}/reject`, data);
    return response.data;
  },

  getAllPaymentSettings: async (params = {}) => {
    const response = await api.get("/instructor/payment-settings/admin/all", { params });
    return response.data;
  },

  verifyPaymentSettings: async (instructorId, data) => {
    const response = await api.put(`/instructor/payment-settings/admin/${instructorId}/verify`, data);
    return response.data;
  },
};

export default PayoutService;
