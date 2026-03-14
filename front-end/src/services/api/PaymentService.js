import { api } from "../index";

class PaymentService {
  // POST /api/payments/create → { success, paymentUrl, paymentId }
  createPayment(courseId, paymentMethod = "vnpay") {
    return api
      .post("/payments/create", { courseId, paymentMethod })
      .then((r) => r.data);
  }

  // GET /api/payments/my → { success, data: payments }
  getMyPayments() {
    return api.get("/payments/my").then((r) => r.data?.data ?? []);
  }

  // GET /api/enrollments/my-courses → { success, total, data }
  getMyCourses() {
    return api.get("/enrollments/my-courses").then((r) => r.data?.data ?? []);
  }

  // GET enrolled course IDs for current user
  async getEnrolledCourseIds() {
    try {
      const data = await this.getMyCourses();
      return data.map((e) => e.course?._id?.toString()).filter(Boolean);
    } catch {
      return [];
    }
  }

  /* Enroll free course
   * POST /api/enrollments/enroll-free
   * Body: { courseId }
   * Response: { success, message, data: { enrollmentId, courseId, paymentStatus, ... } }
   */
  enrollFreeCourse(courseId) {
    return api
      .post("/enrollments/enroll-free", { courseId })
      .then((r) => r.data);
  }

  /**
   * Mark a lesson as completed and persist progress to the backend.
   * POST /api/enrollments/:courseId/complete-lesson
   * Body: { lessonId }  ← the actual Lesson ObjectId (itemId from course.sections)
   * Response: { progress, completed }
   */
  completeLesson(courseId, lessonId) {
    return api
      .post(`/enrollments/${courseId}/complete-lesson`, { lessonId })
      .then((r) => r.data);
  }

  // ─── Admin Revenue APIs ────────────────────────────────────────────────────

  /**
   * GET /api/payments/admin/revenue/summary?from=&to=
   * → { totalRevenue: number, totalOrders: number }
   */
  getRevenueSummary({ from, to } = {}) {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return api
      .get("/payments/admin/revenue/summary", { params })
      .then((r) => r.data?.data ?? { totalRevenue: 0, totalOrders: 0 });
  }

  /**
   * GET /api/payments/admin/revenue/daily?from=&to=&groupBy=day|month
   * → [{ date: string, totalRevenue: number, totalOrders: number }]
   */
  getRevenueByDate({ from, to, groupBy = "month" } = {}) {
    const params = { groupBy };
    if (from) params.from = from;
    if (to) params.to = to;
    return api
      .get("/payments/admin/revenue/daily", { params })
      .then((r) => r.data?.data ?? []);
  }

  /**
   * GET /api/payments/admin/revenue/by-course?from=&to=
   * → [{ courseId, title, totalRevenue, totalOrders }]
   */
  getRevenueByCourse({ from, to } = {}) {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return api
      .get("/payments/admin/revenue/by-course", { params })
      .then((r) => r.data?.data ?? []);
  }
}

export default new PaymentService();
