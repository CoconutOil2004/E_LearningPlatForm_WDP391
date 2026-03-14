// Base URL lấy từ env variable, fallback về localhost khi dev
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9999";
const BACKEND_API_URI = `${API_BASE_URL}/api`;

// Format VND currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatUSD = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const ROLES = {
  GUEST: "guest",
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};

const ROUTES = {
  HOME: "/",
  COURSES: "/courses",
  COURSE_DETAIL: "/courses/:id",
  SEARCH: "/search",
  ABOUT: "/about",
  CONTACT: "/contact",

  // Auth
  LOGIN: "/signin",
  REGISTER: "/signup",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Student
  STUDENT_DASHBOARD: "/",
  MY_COURSES: "/student/my-courses",
  LEARNING: "/student/learning/:courseId",
  QUIZ: "/student/quiz/:courseId",
  CERTIFICATE: "/student/certificate/:courseId",
  MY_CERTIFICATES: "/student/certificates",
  WISHLIST: "/student/wishlist",
  PROGRESS: "/student/progress",
  STUDENT_PROFILE: "/student/profile",
  STUDENT_SETTINGS: "/student/settings",

  // Instructor
  INSTRUCTOR_DASHBOARD: "/instructor/dashboard",
  INSTRUCTOR_COURSES: "/instructor/courses",
  CREATE_COURSE: "/instructor/courses/create",
  EDIT_COURSE: "/instructor/courses/edit/:id",
  INSTRUCTOR_REVENUE: "/instructor/revenue",
  INSTRUCTOR_STUDENTS: "/instructor/students",
  INSTRUCTOR_ANALYTICS: "/instructor/analytics",
  INSTRUCTOR_PROFILE: "/instructor/profile",
  INSTRUCTOR_BLOG: "/instructor/blog",
  INSTRUCTOR_BLOG_CREATE: "/instructor/blog/create",
  INSTRUCTOR_BLOG_EDIT: "/instructor/blog/edit/:id",
BLOG_LIST: "/blog",
BLOG_DETAIL: "/blog/:id",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_COURSES: "/admin/courses",
  ADMIN_APPROVAL: "/admin/approval",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_REVENUE: "/admin/revenue",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_LOGS: "/admin/logs",
  ADMIN_BLOG: "/admin/blog",
};

export { API_BASE_URL, BACKEND_API_URI, formatCurrency, formatUSD, ROLES, ROUTES };
