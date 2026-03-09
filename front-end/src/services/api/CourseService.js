import { api } from "../index";
import { FAKE_COURSES, FAKE_LESSONS, QUIZ_QUESTIONS } from "../../utils/fakeData";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Normalize BE course object → shape giống FAKE_COURSES để CourseCard
//         không cần biết đang dùng real hay fake data.
// ─────────────────────────────────────────────────────────────────────────────
export const normalizeCourse = (c) => ({
  // ID — dùng _id (ObjectId string) từ BE
  id: c._id,
  _id: c._id,

  title:       c.title       ?? "",
  description: c.description ?? "",
  price:       c.price       ?? 0,
  level:       c.level       ?? "Beginner",
  rating:      c.rating      ?? 0,
  status:      c.status      ?? "published",
  thumbnail:   c.thumbnail   ?? null,

  // FE CourseCard dùng "image" — map từ thumbnail
  image: c.thumbnail ?? `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop`,

  // Giảng viên — BE populate instructorId
  instructor:   c.instructorId?.fullname ?? c.instructorId?.email ?? "Instructor",
  instructorId: c.instructorId?._id ?? c.instructorId,

  // Category — BE populate: { _id, name, slug }
  category:   c.category?.name ?? c.category ?? "",
  categoryId: c.category?._id  ?? c.category,

  // Lượt đăng ký → dùng làm "students"
  students:        c.enrollmentCount ?? 0,
  enrollmentCount: c.enrollmentCount ?? 0,

  // Thời lượng (BE lưu giây)
  totalDuration: c.totalDuration ?? 0,
  duration:      c.totalDuration
    ? `${Math.ceil(c.totalDuration / 3600)}h`
    : "—",

  // FE fake có lessons count — BE không có sẵn, để null
  lessons: c.lessons ?? null,

  // Bestseller: không có trong BE → tạm dùng enrollmentCount > 100
  bestseller: (c.enrollmentCount ?? 0) > 100,

  // Flag từ searchCourses (BE trả về isEnrolled khi có token)
  isEnrolled: c.isEnrolled ?? false,

  createdAt: c.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────

class CourseService {

  // ── REAL API METHODS ────────────────────────────────────────────────────────

  /**
   * Lấy tất cả categories từ BE.
   * GET /api/categories
   * @returns {Promise<Array<{ _id, name, slug, description }>>}
   */
  async getCategories() {
    const res = await api.get("/categories");
    // BE trả về { success: true, data: [...] }
    return res.data?.data ?? [];
  }

  /**
   * Lấy courses theo categoryId.
   * GET /api/courses/by-category/:categoryId?page=1&limit=10&sortBy=popular
   *
   * @param {string} categoryId  - ObjectId string
   * @param {{ page?, limit?, sortBy? }} params
   * @returns {Promise<{ courses: Array, pagination: object }>}
   */
  async getCoursesByCategory(categoryId, { page = 1, limit = 10, sortBy = "popular" } = {}) {
    const res = await api.get(`/courses/by-category/${categoryId}`, {
      params: { page, limit, sortBy },
    });
    // BE trả về { success, data: [...], pagination: { page, limit, total, totalPages } }
    return {
      courses:    (res.data?.data ?? []).map(normalizeCourse),
      pagination: res.data?.pagination ?? {},
    };
  }

  /**
   * Tìm kiếm + lọc khóa học nâng cao (Udemy style).
   * GET /api/courses/search?keyword=&category=&level=&minPrice=&maxPrice=&minRating=&sortBy=&page=&limit=
   *
   * @param {{ keyword?, category?, level?, minPrice?, maxPrice?, minRating?, sortBy?, page?, limit?, myCourses? }} params
   */
  async searchCourses({
    keyword,
    category,
    level,
    minPrice,
    maxPrice,
    minRating,
    sortBy    = "popular",
    page      = 1,
    limit     = 10,
    myCourses = false,
  } = {}) {
    const params = { sortBy, page, limit };
    if (keyword)   params.keyword   = keyword;
    if (category)  params.category  = category;
    if (level)     params.level     = level;
    if (minPrice != null) params.minPrice = minPrice;
    if (maxPrice != null) params.maxPrice = maxPrice;
    if (minRating != null) params.minRating = minRating;
    if (myCourses) params.myCourses = "true";

    const res = await api.get("/courses/search", { params });
    return {
      courses:    (res.data?.data  ?? []).map(normalizeCourse),
      total:      res.data?.total  ?? 0,
      page:       res.data?.page   ?? 1,
      pages:      res.data?.pages  ?? 1,
    };
  }

  // ── FAKE / LEGACY METHODS (giữ nguyên để không break code cũ) ──────────────

  /** @deprecated Dùng searchCourses() với real API */
  async getAllCourses({ category, level, sort } = {}) {
    await new Promise((r) => setTimeout(r, 400));
    let courses = [...FAKE_COURSES];
    if (category && category !== "All") courses = courses.filter((c) => c.category === category);
    if (level    && level    !== "All") courses = courses.filter((c) => c.level    === level);
    if (sort === "rating")     courses.sort((a, b) => b.rating  - a.rating);
    else if (sort === "price-low")  courses.sort((a, b) => a.price   - b.price);
    else if (sort === "price-high") courses.sort((a, b) => b.price   - a.price);
    else courses.sort((a, b) => b.students - a.students);
    return { success: true, data: courses };
  }

  /** @deprecated Dùng real API */
  async getCourseById(id) {
    await new Promise((r) => setTimeout(r, 200));
    const course = FAKE_COURSES.find((c) => c.id === Number(id));
    if (!course) throw new Error("Course not found");
    return { success: true, data: course };
  }

  async getLessons(courseId) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, data: FAKE_LESSONS };
  }

  async getQuiz(courseId) {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, data: QUIZ_QUESTIONS };
  }
}

export default new CourseService();