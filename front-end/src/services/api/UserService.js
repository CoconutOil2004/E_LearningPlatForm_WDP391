import { api } from "../index";

class UserService {
  // ─── Instructors ────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách instructor (phân trang)
   * @returns {{ success, instructors, pagination }}
   */
  async getInstructors({ page = 1, limit = 20 } = {}) {
    const { data } = await api.get("/users/instructors", {
      params: { page, limit },
    });
    return data;
  }

  /**
   * Admin tạo instructor — BE tự tạo password random + gửi email
   * @param {{ email: string, fullname: string }} payload
   * @returns {{ success, message, instructor }}
   */
  async createInstructor(payload) {
    const { data } = await api.post("/users/instructors", payload);
    return data;
  }

  /**
   * Lock / Unlock tài khoản instructor
   * @param {string} id
   * @param {'lock'|'unlock'} action
   */
  async updateInstructorAction(id, action) {
    const { data } = await api.patch(`/users/instructors/${id}/action`, { action });
    return data;
  }

  /**
   * Lock / Unlock tài khoản student
   * @param {string} id
   * @param {'lock'|'unlock'} action
   */
  async updateStudentAction(id, action) {
    const { data } = await api.patch(`/users/students/${id}/action`, { action });
    return data;
  }

  
  // ─── Students ───────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách student (phân trang)
   * @returns {{ success, students, pagination }}
   */
  async getStudents({ page = 1, limit = 20 } = {}) {
    const { data } = await api.get("/users/students", {
      params: { page, limit },
    });
    return data;
  }
}

export default new UserService();