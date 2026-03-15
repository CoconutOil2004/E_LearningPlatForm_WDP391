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

  /**
   * Delete a comment
   * @param {string} id 
   */
  async deleteComment(id) {
    const res = await api.delete(`/comments/${id}`);
    return res.data;
  }
}

export default new CommentService();
