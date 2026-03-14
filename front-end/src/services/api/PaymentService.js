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
}

export default new PaymentService();
