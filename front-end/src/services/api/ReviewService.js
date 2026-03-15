import { api } from '../index';

class ReviewService {
  /**
   * Create a new review
   * @param {Object} reviewData { courseId, rating, comment }
   */
  async createReview(reviewData) {
    const res = await api.post("/reviews", reviewData);
    return res.data;
  }

  /**
   * Get reviews for a specific course
   * @param {string} courseId 
   * @param {number} page 
   * @param {number} limit 
   */
  async getCourseReviews(courseId, page = 1, limit = 10) {
    const res = await api.get(`/reviews/course/${courseId}`, {
      params: { page, limit }
    });
    return res.data;
  }

  /**
   * Get rating statistics for a course
   * @param {string} courseId 
   */
  async getCourseRatingStats(courseId) {
    const res = await api.get(`/reviews/course/${courseId}/stats`);
    return res.data;
  }

  /**
   * Reply to a review (Instructor only)
   * @param {string} reviewId 
   * @param {string} content 
   */
  async replyToReview(reviewId, content) {
    const res = await api.post(`/reviews/${reviewId}/reply`, { content });
    return res.data;
  }
}

export default new ReviewService();
