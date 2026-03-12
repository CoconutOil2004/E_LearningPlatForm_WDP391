import { api } from "../index";

class PaymentService {
  // POST /api/payments/create → { success, paymentUrl, paymentId }
  createPayment(courseId, paymentMethod = "vnpay") {
    return api
      .post("/payments/create", { courseId, paymentMethod })
      .then((r) => r.data);
  }

  // GET /api/payments/my → { success, payments }
  getMyPayments() {
    return api.get("/payments/my").then((r) => r.data?.payments ?? []);
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
}

export default new PaymentService();
