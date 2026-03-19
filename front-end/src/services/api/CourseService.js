import { api } from "../index";

class CourseService {
  // ─── GET /api/categories ───────────────────────────────────────────────────
  // → [{ _id, name, slug, description }]
  getCategories() {
    return api.get("/categories").then((r) => r.data?.data ?? []);
  }

  // ─── GET /api/courses/levels ───────────────────────────────────────────────
  // → ["Beginner", "Intermediate", "Advanced"]
  getLevels() {
    return api.get("/courses/levels").then((r) => r.data?.data ?? []);
  }

  // ─── GET /api/courses/by-category/:categoryId ─────────────────────────────
  // Query: page, limit, sortBy (popular|rating|priceAsc|priceDesc)
  // → { data: Course[], pagination: { page, limit, total, totalPages } }
  getCoursesByCategory(
    categoryId,
    { page = 1, limit = 10, sortBy = "popular" } = {},
  ) {
    return api
      .get(`/courses/by-category/${categoryId}`, {
        params: { page, limit, sortBy },
      })
      .then((r) => ({
        courses: r.data?.data ?? [],
        pagination: r.data?.pagination ?? {},
      }));
  }

  // ─── GET /api/courses/search ───────────────────────────────────────────────
  // Query: keyword, category (ObjectId), level, minPrice, maxPrice,
  //        minRating, sortBy, page, limit, myCourses ("true")
  // → { data: Course[], total, page, pages }
  // Course object has isEnrolled: boolean when token is sent
  searchCourses({
    keyword,
    category,
    level,
    minPrice,
    maxPrice,
    minRating,
    sortBy = "popular",
    page = 1,
    limit = 10,
    myCourses = false,
  } = {}) {
    const params = { sortBy, page, limit };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (level) params.level = level;
    if (minPrice != null) params.minPrice = minPrice;
    if (maxPrice != null) params.maxPrice = maxPrice;
    if (minRating != null) params.minRating = minRating;
    if (myCourses) params.myCourses = "true";

    return api.get("/courses/search", { params }).then((r) => ({
      courses: r.data?.data ?? [],
      total: r.data?.total ?? 0,
      page: r.data?.page ?? 1,
      pages: r.data?.pages ?? 1,
    }));
  }

  // ─── GET /api/courses/:id/preview ─────────────────────────────────────────
  // Public, no auth required. Only shows published status.
  // itemId in sections only contains { _id, title, duration } — NO videoUrl
  // → Course (syllabus only)
  getCoursePreview(id) {
    return api.get(`/courses/${id}/preview`).then((r) => r.data?.data ?? null);
  }

  // ─── GET /api/courses/:id ──────────────────────────────────────────────────
  // New BE (optionalAuth): returns { data: course, isEnrolled: bool } for all users
  // Old BE (protect):  enrolled/admin/instructor → { data: course }
  //                   unenrolled → 403 (component automatically catches and calls getCoursePreview)
  getCourseDetail(id) {
    return api.get(`/courses/${id}`).then((r) => ({
      course: r.data?.data ?? null,
      isEnrolled: r.data?.isEnrolled ?? true, // BE cũ không trả isEnrolled → assume true (đã pass protect)
    }));
  }

  // ─── POST /api/courses ────────────────────────────────────────────────────
  // Instructor only. Body: { title (max 60, required), description,
  //                          categoryId (required), level (required), thumbnail?, language? }
  // BE automatically sets: status="draft", price=0
  // → Course (populated category.name, instructorId.fullname/email)
  createCourse({ title, description, categoryId, level, language, thumbnail }) {
    return api
      .post("/courses", {
        title,
        description,
        categoryId,
        level,
        language,
        thumbnail,
      })
      .then((r) => r.data?.data ?? null);
  }

  // ─── PUT /api/courses/:courseId ───────────────────────────────────────────
  // Instructor only, only when status = "draft" | "rejected"
  // Body: { title?, description?, categoryId?, level?, price?, status?, sections? }
  // sections shape: [{ title, items: [{ itemType, title, orderIndex,
  //   itemId?,           ← exists → BE reuses; missing → BE creates new Lesson/Quiz
  //   videoUrl?,         ← from uploadVideo
  //   videoPublicId?,
  //   duration?,
  //   questions?         ← for quiz
  // }] }]
  // → Course (full populated)
  updateCourse(courseId, payload) {
    return api
      .put(`/courses/${courseId}`, payload)
      .then((r) => r.data?.data ?? null);
  }

  // ─── POST /api/upload/video ───────────────────────────────────────────────
  // multipart/form-data, field: "video" → { videoUrl, publicId, duration } (seconds)
  uploadVideo(file, onProgress) {
    const form = new FormData();
    form.append("video", file);
    return api
      .post("/upload/video", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress
          ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
          : undefined,
      })
      .then((r) => r.data?.data ?? null);
  }

  // ─── POST /api/upload/images ──────────────────────────────────────────────
  // multipart, field: "images" (multiple files) → { data: [ { url, publicId }, ... ] }
  uploadImages(files, onProgress) {
    const form = new FormData();
    const list = Array.isArray(files) ? files : [files];
    list.forEach((f) => form.append("images", f));
    return api
      .post("/upload/images", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress
          ? (e) =>
              onProgress(e.total ? Math.round((e.loaded * 100) / e.total) : 0)
          : undefined,
      })
      .then((r) => r.data?.data ?? []);
  }

  // ─── PUT /api/courses/:courseId/submit ────────────────────────────────────
  // Instructor only. Only when status = "draft" | "rejected"
  // → { success, message, data: Course }
  submitCourse(courseId) {
    return api.put(`/courses/${courseId}/submit`).then((r) => r.data ?? null);
  }

  // ─── GET /api/courses/admin/pending ───────────────────────────────────────
  // Admin only.
  // → { success, count, data: Course[] }
  getPendingCourses() {
    return api.get("/courses/admin/pending").then((r) => r.data?.data ?? []);
  }

  // ─── GET /api/courses/instructor/mine ─────────────────────────────────────
  // Instructor only. Gets all instructor's courses (including draft/pending/rejected/published)
  // Query: status?  (draft|pending|published|rejected|archived)
  //        keyword? (search by title)
  //        sortBy?  (priceAsc|priceDesc|newest|oldest)  default: newest
  // → Course[]
  getInstructorCourses({ status, keyword, sortBy } = {}) {
    const params = {};
    if (status) params.status = status;
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (sortBy) params.sortBy = sortBy;
    return api
      .get("/courses/instructor/mine", { params })
      .then((r) => r.data?.data ?? []);
  }

  // ─── GET /api/courses/admin/all ───────────────────────────────────────────
  // Admin only. Returns courses of ALL statuses with pagination + optional keyword/status/price filter.
  // → { data: Course[], total, page, pages }
  getAdminAllCourses({
    status,
    page = 1,
    limit = 20,
    keyword,
    minPrice,
    maxPrice,
  } = {}) {
    const params = { page, limit };
    if (status && status !== "all") params.status = status;
    if (keyword) params.keyword = keyword;
    if (minPrice != null && minPrice !== "") params.minPrice = minPrice;
    if (maxPrice != null && maxPrice !== "") params.maxPrice = maxPrice;
    return api.get("/courses/admin/all", { params }).then((r) => ({
      courses: r.data?.data ?? [],
      total: r.data?.total ?? 0,
      page: r.data?.page ?? 1,
      pages: r.data?.pages ?? 1,
    }));
  }

  // ─── PUT /api/courses/:courseId/approve ───────────────────────────────────
  // Admin only. Only when status = "pending" → "published"
  // → { success, message, data: Course }
  approveCourse(courseId) {
    return api.put(`/courses/${courseId}/approve`).then((r) => r.data ?? null);
  }

  // ─── PUT /api/courses/:courseId/reject ────────────────────────────────────
  // Admin only. Only when status = "pending" → "rejected"
  // Body: { reason? }
  // → { success, message, data: Course }
  rejectCourse(courseId, reason) {
    return api
      .put(`/courses/${courseId}/reject`, { reason })
      .then((r) => r.data ?? null);
  }

  // ─── FE Helpers ─────────────────────────────────────────────────────────────

  // Student: get purchased courses (myCourses=true, token required)
  getMyCourses({ page = 1, limit = 20 } = {}) {
    return this.searchCourses({ myCourses: true, page, limit });
  }

  // Extract flat lesson list from course detail (student enrolled)
  getLessonsFromCourse(course) {
    const lessons = [];
    for (const section of course?.sections ?? []) {
      for (const item of section.items ?? []) {
        if (item.itemType === "lesson" && item.itemId) {
          lessons.push({
            ...item.itemId,
            sectionTitle: section.title,
            orderIndex: item.orderIndex,
          });
        }
      }
    }
    return lessons;
  }

  // Extract flat quiz list from course detail (student enrolled)
  getQuizzesFromCourse(course) {
    const quizzes = [];
    for (const section of course?.sections ?? []) {
      for (const item of section.items ?? []) {
        if (item.itemType === "quiz" && item.itemId) {
          quizzes.push({ ...item.itemId, sectionTitle: section.title });
        }
      }
    }
    return quizzes;
  }
}

export default new CourseService();

// Re-export for convenience
export { CourseService };
