// Base URL from env variable, fallback to localhost for dev
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9999";
const BACKEND_API_URI = `${API_BASE_URL}/api`;

const ROLES = {
  GUEST: "guest",
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};

const ROUTES = {
  // --- Public ---
  HOME: "/",
  COURSES: "/courses",
  COURSE_DETAIL: "/courses/:id",
  SEARCH: "/search",
  ABOUT: "/about",
  CONTACT: "/contact",
  ROADMAP: "/roadmap",

  // --- Blog Public ---
  BLOG_LIST: "/blog",
  BLOG_DETAIL: "/blog/:id",

  // --- Auth ---
  LOGIN: "/signin",
  REGISTER: "/signup",
  VERIFY_OTP: "/verify-otp",
  RESEND_OTP: "/resend-otp", // Mới bổ sung
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CHANGE_PASSWORD_REQUIRED: "/change-password-required",
  STORE_REGISTRATION: "/store-registration", // Mới bổ sung
  AUTH_CALLBACK: "/auth/callback", // Mới bổ sung

  // --- Student ---
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

  // --- Instructor ---
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

  // --- Admin ---
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
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_COMMENTS: "/admin/comments",
  ADMIN_CERTIFICATES_PENDING: "/admin/certificates/pending",
  ADMIN_CERTIFICATES_ALL: "/admin/certificates/all",
  ADMIN_PAYOUTS_PENDING: "/admin/payouts/pending",
  ADMIN_PAYOUTS_ALL: "/admin/payouts/all",
  ADMIN_PAYOUTS_STATISTICS: "/admin/payouts/statistics",
  ADMIN_PAYOUTS_EARNINGS: "/admin/payouts/earnings",
  ADMIN_PAYOUTS_SETTINGS: "/admin/payouts/settings",
  ADMIN_PROFILE: "/admin/profile",

  // --- Instructor Earnings ---
  INSTRUCTOR_EARNINGS_DASHBOARD: "/instructor/earnings",
  INSTRUCTOR_EARNINGS_PAYOUT: "/instructor/earnings/payout",
  INSTRUCTOR_EARNINGS_HISTORY: "/instructor/earnings/payout-history",
  INSTRUCTOR_EARNINGS_SETTINGS: "/instructor/earnings/settings",
};

export { API_BASE_URL, BACKEND_API_URI, ROLES, ROUTES };
