import { api } from "../index";

/**
 * EnrollmentService
 * Tích hợp tất cả API tracking tiến độ học tập của học sinh.
 * Bao gồm: heartbeat (anti-cheat), complete-lesson, quiz-done, check access, restore progress.
 */
class EnrollmentService {
  /**
   * Lấy tất cả courses đã enroll + itemsProgress đầy đủ từ server.
   * Dùng để restore lại tiến độ học khi student quay lại.
   * GET /api/enrollments/my-courses
   * @returns {Promise<Array>} mảng enrollment objects
   */
  getMyCourses() {
    return api.get("/enrollments/my-courses").then((r) => r.data?.data ?? []);
  }

  /**
   * Lấy itemsProgress của một course cụ thể từ danh sách my-courses.
   * @param {string} courseId
   * @returns {Promise<{itemsProgress: Array, progress: number, completed: boolean, enrollmentId: string}|null>}
   */
  async getEnrollmentByCourse(courseId) {
    try {
      const courses = await this.getMyCourses();
      const found = courses.find(
        (e) =>
          e.course?._id?.toString() === courseId || e.course?._id === courseId,
      );
      if (!found) return null;
      return {
        enrollmentId: found.enrollmentId,
        progress: found.progress ?? 0,
        completed: found.completed ?? false,
        itemsProgress: found.itemsProgress ?? [],
        continueLesson: found.continueLesson ?? null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Heartbeat — gửi mỗi ~10s để tích lũy watchedSeconds.
   * BE tự động đánh dấu lesson done khi watchedSeconds >= 30% duration (anti-cheat).
   * POST /api/enrollments/:courseId/heartbeat
   * Body: { lessonId, watchedSecondsDelta }
   * @returns {Promise<{success, progress, completed, itemsProgress}>}
   */
  heartbeat(courseId, lessonId, watchedSecondsDelta) {
    return api
      .post(`/enrollments/${courseId}/heartbeat`, {
        lessonId,
        watchedSecondsDelta: Math.max(0, Math.round(watchedSecondsDelta)),
      })
      .then((r) => r.data);
  }

  /**
   * Đánh dấu lesson hoàn thành thủ công (khi click "Complete & Continue").
   * POST /api/enrollments/:courseId/complete-lesson
   * Body: { lessonId }
   * @returns {Promise<{success, progress, completed, itemsProgress}>}
   */
  completeLesson(courseId, lessonId) {
    return api
      .post(`/enrollments/${courseId}/complete-lesson`, { lessonId })
      .then((r) => r.data);
  }

  /**
   * Đánh dấu quiz đã làm xong.
   * POST /api/enrollments/:courseId/quiz-done
   * Body: { quizId }
   * @returns {Promise<{success, itemsProgress}>}
   */
  markQuizDone(courseId, quizId) {
    return api
      .post(`/enrollments/${courseId}/quiz-done`, { quizId })
      .then((r) => r.data);
  }

  /**
   * Kiểm tra quyền xem lesson — trả 200 nếu ok, 403 nếu locked.
   * GET /api/enrollments/:courseId/lesson/:lessonId/access
   * @returns {Promise<{success, allowed, status}>}
   */
  checkLessonAccess(courseId, lessonId) {
    return api
      .get(`/enrollments/${courseId}/lesson/${lessonId}/access`)
      .then((r) => r.data);
  }

  /**
   * Enroll khóa học miễn phí.
   * POST /api/enrollments/enroll-free
   * Body: { courseId }
   */
  enrollFreeCourse(courseId) {
    return api
      .post("/enrollments/enroll-free", { courseId })
      .then((r) => r.data);
  }
}

export default new EnrollmentService();
