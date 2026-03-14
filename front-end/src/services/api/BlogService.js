import { api } from "../index";

/**
 * BlogService
 * Kết nối với BE blog routes:
 *   POST   /blogs              → createBlog (instructor)
 *   PUT    /blogs/:id          → updateOwnBlog (instructor)
 *   PATCH  /blogs/:id/submit   → submitBlogForReview (instructor)
 *   GET    /blogs/:id          → getBlogById
 */
class BlogService {
  /**
   * Instructor tạo blog mới
   * @param {{ title, summary, category, content, status, thumbnail, images }} payload
   * status: "draft" | "pending"
   */
  async createBlog(payload) {
    const { data } = await api.post("/blogs", payload);
    return data; // { success, message, data: Blog }
  }

  /**
   * Instructor cập nhật blog của mình
   * @param {string} id
   * @param {{ title?, summary?, category?, content?, status?, thumbnail?, images? }} payload
   */
  async updateBlog(id, payload) {
    const { data } = await api.put(`/blogs/${id}`, payload);
    return data; // { success, message, data: Blog }
  }

  /**
   * Instructor gửi blog chờ admin duyệt
   * @param {string} id
   */
  async submitForReview(id) {
    const { data } = await api.patch(`/blogs/${id}/submit`);
    return data; // { success, message, data: Blog }
  }

  /**
   * Lấy chi tiết blog theo id
   * @param {string} id
   */
  async getBlogById(id) {
    const { data } = await api.get(`/blogs/${id}`);
    return data; // { success, data: Blog }
  }

  /**
   * Lấy danh sách blog của instructor đang đăng nhập
   * (dùng manageBlogs route với filter author)
   * @param {{ page?, limit?, status?, search? }} params
   */
  async getMyBlogs({ page = 1, limit = 10, status, search } = {}) {
    const params = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    const { data } = await api.get("/blogs/my", { params });
    return data; // { success, data: Blog[], pagination }
  }
}

export default new BlogService();