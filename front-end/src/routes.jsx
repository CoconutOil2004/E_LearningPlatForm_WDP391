import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from "react-router-dom";
import { ROLES, ROUTES } from "./utils/constants";

// ─── Layouts ─────────────────────────────────────────────────────────────────
import AdminLayout from "./layouts/AdminLayout";
import AnonymousLayout from "./layouts/AnonymousLayout";
import InstructorLayout from "./layouts/InstructorLayout";
import PublicLayout from "./layouts/PublicLayout";
import RootLayout from "./layouts/RootLayout";

// ─── Route Guards ─────────────────────────────────────────────────────────────
import { GuestRoute, ProtectedRoute } from "./routes/ProtectedRoute";

// ─── Error ───────────────────────────────────────────────────────────────────
import ErrorPage from "./pages/ErrorPage";

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import AuthCallback from "./pages/Auth/AuthCallback";
import ForcedPasswordChange from "./pages/Auth/ForcedPasswordChange";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import OTPVerification from "./pages/Auth/OTPVerification";
import ResendOTP from "./pages/Auth/ResendOTP";
import ResetPassword from "./pages/Auth/ResetPassword";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import StoreRegistration from "./pages/Auth/StoreRegistration";

// ─── Public Pages ─────────────────────────────────────────────────────────────
import BlogListPage from "./pages/Instructor/Blog/BlogListPage";
import AboutPage from "./pages/Public/About/AboutPage";
import BlogDetailPage from "./pages/Public/Blog/BlogDetailPage";
import ContactPage from "./pages/Public/Contact/ContactPage";
import CourseDetailPage from "./pages/Public/CourseDetail/CourseDetailPage";
import CoursesPage from "./pages/Public/Courses/CoursesPage";
import HomePage from "./pages/Public/Home/HomePage";
import SearchPage from "./pages/Public/Search/SearchPage";

// ─── Student Pages ────────────────────────────────────────────────────────────
import CertificatePage from "./pages/Student/Certificate/CertificatePage";
import MyCertificatesPage from "./pages/Student/Certificate/MyCertificatesPage";
import StudentDashboard from "./pages/Student/Dashboard/StudentDashboard";
import LearningPage from "./pages/Student/Learning/LearningPage";
import MyCoursesPage from "./pages/Student/MyCourses/MyCoursesPage";
import StudentProfilePage from "./pages/Student/Profile/StudentProfilePage";
import LearningProgressPage from "./pages/Student/Progress/LearningProgressPage";
import QuizPage from "./pages/Student/Quiz/QuizPage";
import RoadmapPage from "./pages/Student/Roadmap/RoadmapPage";
import StudentSettingsPage from "./pages/Student/Settings/StudentSettingsPage";
import WishlistPage from "./pages/Student/Wishlist/WishlistPage";

// ─── Instructor Pages ─────────────────────────────────────────────────────────
import InstructorAnalyticsPage from "./pages/Instructor/Analytics/InstructorAnalyticsPage";
import CreateBlogPage from "./pages/Instructor/Blog/CreateBlogPage";
import InstructorBlogPage from "./pages/Instructor/Blog/InstructorBlogPage";
import InstructorCoursesPage from "./pages/Instructor/Courses/InstructorCoursesPage";
import CreateCoursePage from "./pages/Instructor/CreateCourse/CreateCoursePage";
import InstructorDashboard from "./pages/Instructor/Dashboard/InstructorDashboard";
import InstructorProfilePage from "./pages/Instructor/Profile/InstructorProfilePage";
import InstructorRevenuePage from "./pages/Instructor/Revenue/InstructorRevenuePage";
import InstructorStudentsPage from "./pages/Instructor/Students/InstructorStudentsPage";

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import AdminAnalyticsPage from "./pages/Admin/Analytics/AdminAnalyticsPage";
import AdminApprovalPage from "./pages/Admin/Approval/AdminApprovalPage";
import AdminBlogPage from "./pages/Admin/Blog/AdminBlogPage";
import AdminCommentPage from "./pages/Admin/Comment/AdminCommentPage";
import AdminCoursesPage from "./pages/Admin/Courses/AdminCoursesPage";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminLogsPage from "./pages/Admin/Logs/AdminLogsPage";
import AdminProfilePage from "./pages/Admin/Profile/AdminProfilePage";
import AdminReportsPage from "./pages/Admin/Reports/AdminReportsPage";
import AdminRevenuePage from "./pages/Admin/Revenue/AdminRevenuePage";
import AdminReviewPage from "./pages/Admin/Review/AdminReviewPage";
import AdminSettingsPage from "./pages/Admin/Settings/AdminSettingsPage";
import AdminUsersPage from "./pages/Admin/Users/AdminUsersPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />} errorElement={<ErrorPage />}>
      {/* ─── Auth Routes ─── */}
      <Route
        element={
          <GuestRoute>
            <AnonymousLayout />
          </GuestRoute>
        }
      >
        <Route path={ROUTES.LOGIN} element={<SignIn />} />
        <Route path={ROUTES.REGISTER} element={<SignUp />} />
        <Route path={ROUTES.VERIFY_OTP} element={<OTPVerification />} />
        <Route path={ROUTES.RESEND_OTP} element={<ResendOTP />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route
          path={ROUTES.STORE_REGISTRATION}
          element={<StoreRegistration />}
        />
        <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
      </Route>

      <Route
        path={ROUTES.CHANGE_PASSWORD_REQUIRED}
        element={<ForcedPasswordChange />}
      />

      {/* ─── Public Routes ─── */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.COURSES} element={<CoursesPage />} />
        <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetailPage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.CONTACT} element={<ContactPage />} />
        <Route path={ROUTES.BLOG_LIST} element={<BlogListPage />} />
        <Route path={ROUTES.BLOG_DETAIL} element={<BlogDetailPage />} />
      </Route>

      {/* ─── Student Routes ─── */}
      <Route
        element={
          <ProtectedRoute
            requiredRoles={[ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN]}
          >
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboard />} />
        <Route path={ROUTES.MY_COURSES} element={<MyCoursesPage />} />
        <Route path={ROUTES.MY_CERTIFICATES} element={<MyCertificatesPage />} />
        <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
        <Route path={ROUTES.PROGRESS} element={<LearningProgressPage />} />
        <Route path={ROUTES.STUDENT_PROFILE} element={<StudentProfilePage />} />
        <Route
          path={ROUTES.STUDENT_SETTINGS}
          element={<StudentSettingsPage />}
        />
        <Route path={ROUTES.ROADMAP} element={<RoadmapPage />} />
      </Route>

      {/* ─── Student Fullscreen Pages ─── */}
      <Route
        element={
          <ProtectedRoute
            requiredRoles={[ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN]}
          >
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.LEARNING} element={<LearningPage />} />
        <Route path={ROUTES.QUIZ} element={<QuizPage />} />
        <Route path={ROUTES.CERTIFICATE} element={<CertificatePage />} />
      </Route>

      {/* ─── Instructor Routes ─── */}
      <Route
        element={
          <ProtectedRoute requiredRoles={[ROLES.INSTRUCTOR]}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={ROUTES.INSTRUCTOR_DASHBOARD}
          element={<InstructorDashboard />}
        />
        <Route
          path={ROUTES.INSTRUCTOR_COURSES}
          element={<InstructorCoursesPage />}
        />
        <Route path={ROUTES.CREATE_COURSE} element={<CreateCoursePage />} />
        <Route path={ROUTES.EDIT_COURSE} element={<CreateCoursePage />} />
        <Route
          path={ROUTES.INSTRUCTOR_REVENUE}
          element={<InstructorRevenuePage />}
        />
        <Route
          path={ROUTES.INSTRUCTOR_STUDENTS}
          element={<InstructorStudentsPage />}
        />
        <Route path={ROUTES.INSTRUCTOR_BLOG} element={<InstructorBlogPage />} />
        <Route
          path={ROUTES.INSTRUCTOR_BLOG_CREATE}
          element={<CreateBlogPage />}
        />
        <Route
          path={ROUTES.INSTRUCTOR_ANALYTICS}
          element={<InstructorAnalyticsPage />}
        />
        <Route
          path={ROUTES.INSTRUCTOR_PROFILE}
          element={<InstructorProfilePage />}
        />
      </Route>

      {/* ─── Admin Routes ─── */}
      <Route
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
        <Route path={ROUTES.ADMIN_COURSES} element={<AdminCoursesPage />} />
        <Route path={ROUTES.ADMIN_APPROVAL} element={<AdminApprovalPage />} />
        <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
        <Route path={ROUTES.ADMIN_REVENUE} element={<AdminRevenuePage />} />
        <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
        <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
        <Route path={ROUTES.ADMIN_LOGS} element={<AdminLogsPage />} />
        <Route path={ROUTES.ADMIN_BLOG} element={<AdminBlogPage />} />
        <Route path={ROUTES.ADMIN_REVIEWS} element={<AdminReviewPage />} />
        <Route path={ROUTES.ADMIN_COMMENTS} element={<AdminCommentPage />} />
        <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfilePage />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Route>,
  ),
);

export default router;
