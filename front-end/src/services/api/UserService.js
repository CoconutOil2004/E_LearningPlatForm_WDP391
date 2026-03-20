import { api } from "../index";

class UserService {
  // ─── Instructors ────────────────────────────────────────────────────────────

  async getInstructors({ page = 1, limit = 20, search, status } = {}) {
    const { data } = await api.get("/users/instructors", {
      params: { page, limit, search, status },
    });
    return data;
  }

  async createInstructor(payload) {
    const { data } = await api.post("/users/instructors", payload);
    return data;
  }

  async updateInstructorAction(id, action) {
    const { data } = await api.patch(`/users/instructors/${id}/action`, { action });
    return data;
  }

  async updateStudentAction(id, action) {
    const { data } = await api.patch(`/users/students/${id}/action`, { action });
    return data;
  }

  // ─── Students ───────────────────────────────────────────────────────────────

  async getStudents({ page = 1, limit = 20, search, status } = {}) {
    const { data } = await api.get("/users/students", {
      params: { page, limit, search, status },
    });
    return data;
  }

  // ─── Instructor Specific ───────────────────────────────────────────────────

  async getInstructorStudents({ page = 1, limit = 20 } = {}) {
    const { data } = await api.get("/users/instructor/students", {
      params: { page, limit },
    });
    return data;
  }

  async getInstructorRevenue() {
    const { data } = await api.get("/users/instructor/revenue");
    return data;
  }

  // ─── Upload ────────────────────────────────────────────────────────────────

  /**
   * Upload an image to Cloudinary via BE
   * @param {File} file - Image file to upload
   * @returns {{ url: string, publicId: string }}
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("images", file);
    const { data } = await api.post("/upload/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // BE returns { success, data: [{ url, publicId }] }
    if (data?.success && data?.data?.length > 0) {
      return data.data[0]; // { url, publicId }
    }
    throw new Error("Upload failed");
  }
}

export default new UserService();