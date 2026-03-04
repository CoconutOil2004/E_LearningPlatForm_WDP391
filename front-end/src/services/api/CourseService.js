import { FAKE_COURSES, FAKE_LESSONS, QUIZ_QUESTIONS } from "../../utils/fakeData";

/**
 * CourseService — uses fake data since only auth API exists.
 * Replace with real API calls once backend is ready.
 */
class CourseService {
  async getAllCourses({ category, level, sort } = {}) {
    await new Promise((r) => setTimeout(r, 400)); // simulate network
    let courses = [...FAKE_COURSES];
    if (category && category !== "All") courses = courses.filter((c) => c.category === category);
    if (level && level !== "All") courses = courses.filter((c) => c.level === level);
    if (sort === "rating") courses.sort((a, b) => b.rating - a.rating);
    else if (sort === "price-low") courses.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") courses.sort((a, b) => b.price - a.price);
    else courses.sort((a, b) => b.students - a.students); // popular
    return { success: true, data: courses };
  }

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

  async searchCourses(query) {
    await new Promise((r) => setTimeout(r, 300));
    const q = query.toLowerCase();
    const courses = FAKE_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
    return { success: true, data: courses };
  }
}

export default new CourseService();
