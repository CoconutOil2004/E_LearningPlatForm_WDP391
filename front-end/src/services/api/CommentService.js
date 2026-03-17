import { api } from '../index';

class CommentService {
  /**
   * Create a new comment for a lesson
   * @param {Object} commentData { courseId, lessonId, content, parentCommentId }
   */
  async createComment(commentData) {
    const res = await api.post("/comments", commentData);
    return res.data;
  }

  /**
   * Get comments for a specific lesson
   * @param {string} lessonId 
   */
  async getLessonComments(lessonId) {
    const res = await api.get(`/comments/lesson/${lessonId}`);
    return res.data;
  }

  async deleteComment(id) {
    const res = await api.delete(`/comments/${id}`);
    return res.data;
  }

  /**
   * Get all comments (Admin only)
   * @param {number} page 
   * @param {number} limit 
   */
  async getAllComments(page = 1, limit = 20) {
    const res = await api.get("/comments/admin/all", {
      params: { page, limit }
    });
    return res.data;
  }
}

export default new CommentService();
