import { api } from "../index";

class CertificateService {
  // GET /api/certificates/my → { success, total, data: enrollments[] }
  getMyCertificates() {
    return api.get("/certificates/my").then((r) => r.data?.data ?? []);
  }

  // GET /api/certificates/status/:courseId → { success, data: { progress, completed, certificateStatus, ... } }
  getCertificateStatus(courseId) {
    return api.get(`/certificates/status/${courseId}`).then((r) => r.data?.data);
  }

  // Admin: GET /api/certificates/pending
  getPendingCertificates(params = {}) {
    return api.get("/certificates/pending", { params }).then((r) => r.data);
  }

  // Admin: GET /api/certificates/all
  getAllCertificates(params = {}) {
    return api.get("/certificates/all", { params }).then((r) => r.data);
  }

  // Admin: POST /api/certificates/:enrollmentId/approve
  approveCertificate(enrollmentId) {
    return api.post(`/certificates/${enrollmentId}/approve`).then((r) => r.data);
  }

  // Admin: POST /api/certificates/:enrollmentId/reject
  rejectCertificate(enrollmentId, reason) {
    return api.post(`/certificates/${enrollmentId}/reject`, { reason }).then((r) => r.data);
  }
}

export default new CertificateService();
