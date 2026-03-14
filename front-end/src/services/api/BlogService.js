import { api } from "../index";

/**
 * BlogService
 * BE blog routes:
 *   GET    /blogs/public           → getPublicBlogs (no auth)
 *   GET    /blogs/public/:id       → getPublicBlogById (no auth)
 *   POST   /blogs                  → createBlog (instructor)
 *   GET    /blogs/my               → getMyBlogs (instructor)
 *   PUT    /blogs/:id              → updateOwnBlog (instructor)
 *   PATCH  /blogs/:id/submit       → submitBlogForReview (instructor)
 *   DELETE /blogs/:id              → deleteOwnBlog (instructor)
 *   GET    /blogs/:id              → getBlogById (auth)
 *   GET    /blogs/admin/manage     → manageBlogs (admin)
 *   PATCH  /blogs/admin/:id/approve → approveBlog (admin)
 *   PATCH  /blogs/admin/:id/reject  → rejectBlog (admin)
 *   DELETE /blogs/admin/:id         → softDeleteBlog (admin)
 */
class BlogService {
  // ─── PUBLIC ─────────────────────────────────────────────────────────────────

  /** Lấy danh sách blog đã approved (public, no auth) */
  async getPublicBlogs({ page = 1, limit = 9, search, category } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (category) params.category = category;
    const { data } = await api.get("/blogs/public", { params });
    return data; // { success, data: Blog[], pagination }
  }

  /** Lấy chi tiết blog public + related */
  async getPublicBlogById(id) {
    const { data } = await api.get(`/blogs/public/${id}`);
    return data; // { success, data: Blog, related: Blog[] }
  }

  // ─── INSTRUCTOR ──────────────────────────────────────────────────────────────

  /** Instructor tạo blog mới */
  async createBlog(payload) {
    const { data } = await api.post("/blogs", payload);
    return data;
  }

  /** Instructor lấy blog của mình */
  async getMyBlogs({ page = 1, limit = 10, status, search } = {}) {
    const params = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    const { data } = await api.get("/blogs/my", { params });
    return data;
  }

  /** Instructor cập nhật blog của mình */
  async updateBlog(id, payload) {
    const { data } = await api.put(`/blogs/${id}`, payload);
    return data;
  }

  /** Instructor gửi blog chờ admin duyệt */
  async submitForReview(id) {
    const { data } = await api.patch(`/blogs/${id}/submit`);
    return data;
  }

  /** Instructor xóa blog (chỉ draft/rejected) */
  async deleteOwnBlog(id) {
    const { data } = await api.delete(`/blogs/${id}`);
    return data;
  }

  // ─── AUTHENTICATED ───────────────────────────────────────────────────────────

  /** Lấy chi tiết blog theo id (cần auth) */
  async getBlogById(id) {
    const { data } = await api.get(`/blogs/${id}`);
    return data;
  }

  // ─── ADMIN ───────────────────────────────────────────────────────────────────

  /** Admin lấy danh sách tất cả blogs */
  async manageBlogs(params = {}) {
    const { data } = await api.get("/blogs/admin/manage", { params });
    return data;
  }

  /** Admin duyệt blog */
  async approveBlog(id) {
    const { data } = await api.patch(`/blogs/admin/${id}/approve`);
    return data;
  }

  /** Admin từ chối blog */
  async rejectBlog(id, reason) {
    const { data } = await api.patch(`/blogs/admin/${id}/reject`, { reason });
    return data;
  }

  /** Admin xóa mềm blog */
  async adminDeleteBlog(id) {
    const { data } = await api.delete(`/blogs/admin/${id}`);
    return data;
  }
}

export default new BlogService();