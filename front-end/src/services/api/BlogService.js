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

  /** Get list of approved blogs (public, no auth) */
  async getPublicBlogs({ page = 1, limit = 9, search, category } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (category) params.category = category;
    const { data } = await api.get("/blogs/public", { params });
    return data; // { success, data: Blog[], pagination }
  }

  /** Get public blog details + related blogs */
  async getPublicBlogById(id) {
    const { data } = await api.get(`/blogs/public/${id}`);
    return data; // { success, data: Blog, related: Blog[] }
  }

  // ─── INSTRUCTOR ──────────────────────────────────────────────────────────────

  /** Instructor creates new blog */
  async createBlog(payload) {
    const { data } = await api.post("/blogs", payload);
    return data;
  }

  /** Instructor gets their own blogs */
  async getMyBlogs({ page = 1, limit = 10, status, search } = {}) {
    const params = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    const { data } = await api.get("/blogs/my", { params });
    return data;
  }

  /** Instructor updates their own blog */
  async updateBlog(id, payload) {
    const { data } = await api.put(`/blogs/${id}`, payload);
    return data;
  }

  /** Instructor submits blog for admin review */
  async submitForReview(id) {
    const { data } = await api.patch(`/blogs/${id}/submit`);
    return data;
  }

  /** Instructor deletes blog (only draft/rejected) */
  async deleteOwnBlog(id) {
    const { data } = await api.delete(`/blogs/${id}`);
    return data;
  }

  // ─── AUTHENTICATED ───────────────────────────────────────────────────────────

  /** Get blog details by id (auth required) */
  async getBlogById(id) {
    const { data } = await api.get(`/blogs/${id}`);
    return data;
  }

  // ─── ADMIN ───────────────────────────────────────────────────────────────────

  /** Admin gets list of all blogs */
  async manageBlogs(params = {}) {
    const { data } = await api.get("/blogs/admin/manage", { params });
    return data;
  }

  /** Admin approves blog */
  async approveBlog(id) {
    const { data } = await api.patch(`/blogs/admin/${id}/approve`);
    return data;
  }

  /** Admin rejects blog */
  async rejectBlog(id, reason) {
    const { data } = await api.patch(`/blogs/admin/${id}/reject`, { reason });
    return data;
  }

  /** Admin soft deletes blog */
  async adminDeleteBlog(id) {
    const { data } = await api.delete(`/blogs/admin/${id}`);
    return data;
  }
}

export default new BlogService();