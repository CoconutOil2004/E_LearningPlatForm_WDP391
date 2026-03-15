import { api } from '../index';

class AnalyticsService {
  /**
   * Get platform-wide analytics for Admin
   */
  async getAdminAnalytics() {
    const res = await api.get("/analytics/admin");
    return res.data;
  }

  /**
   * Get analytics for the logged-in Instructor
   */
  async getInstructorAnalytics() {
    const res = await api.get("/analytics/instructor");
    return res.data;
  }
}

export default new AnalyticsService();
