import { api } from "../index";

const InstructorEarningService = {
  /**
   * Get earning summary
   */
  getEarningSummary: async () => {
    const response = await api.get("/instructor/earnings/summary");
    return response.data;
  },

  /**
   * Get earnings list with filters
   * @param {Object} params - { status, courseId, from, to, page, limit }
   */
  getMyEarnings: async (params = {}) => {
    const response = await api.get("/instructor/earnings", { params });
    return response.data;
  },

  /**
   * Get earnings by course
   */
  getEarningsByCourse: async () => {
    const response = await api.get("/instructor/earnings/by-course");
    return response.data;
  },

  /**
   * Get earning statistics for charts
   * @param {Object} params - { groupBy, from, to }
   */
  getEarningStats: async (params = {}) => {
    const response = await api.get("/instructor/earnings/stats", { params });
    return response.data;
  },

  /**
   * Get earning detail
   * @param {String} id - Earning ID
   */
  getEarningDetail: async (id) => {
    const response = await api.get(`/instructor/earnings/${id}`);
    return response.data;
  },

  // Admin APIs
  /**
   * Get all instructor earnings (admin)
   * @param {Object} params - { status, instructorId, from, to, page, limit }
   */
  getAllInstructorEarnings: async (params = {}) => {
    const response = await api.get("/instructor/earnings/admin/all", { params });
    return response.data;
  },
};

export default InstructorEarningService;
