import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from "react-router-dom";

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
import ForgotPassword from "./pages/Auth/ForgotPassword";
import OTPVerification from "./pages/Auth/OTPVerification";
import ResendOTP from "./pages/Auth/ResendOTP";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import StoreRegistration from "./pages/Auth/StoreRegistration";

// ─── Public Pages ─────────────────────────────────────────────────────────────
import AboutPage from "./pages/Public/About/AboutPage";
import ContactPage from "./pages/Public/Contact/ContactPage";
import CourseDetailPage from "./pages/Public/CourseDetail/CourseDetailPage";
import CoursesPage from "./pages/Public/Courses/CoursesPage";
import HomePage from "./pages/Public/Home/HomePage";
import SearchPage from "./pages/Public/Search/SearchPage";

// ─── Student Pages ────────────────────────────────────────────────────────────
import CertificatePage from "./pages/Student/Certificate/CertificatePage";
import StudentDashboard from "./pages/Student/Dashboard/StudentDashboard";
import LearningPage from "./pages/Student/Learning/LearningPage";
import MyCoursesPage from "./pages/Student/MyCourses/MyCoursesPage";
import StudentProfilePage from "./pages/Student/Profile/StudentProfilePage";
import LearningProgressPage from "./pages/Student/Progress/LearningProgressPage";
import QuizPage from "./pages/Student/Quiz/QuizPage";
import StudentSettingsPage from "./pages/Student/Settings/StudentSettingsPage";
import WishlistPage from "./pages/Student/Wishlist/WishlistPage";

// ─── Instructor Pages ─────────────────────────────────────────────────────────
import InstructorAnalyticsPage from "./pages/Instructor/Analytics/InstructorAnalyticsPage";
import InstructorCoursesPage from "./pages/Instructor/Courses/InstructorCoursesPage";
import CreateCoursePage from "./pages/Instructor/CreateCourse/CreateCoursePage";
import InstructorDashboard from "./pages/Instructor/Dashboard/InstructorDashboard";
import InstructorProfilePage from "./pages/Instructor/Profile/InstructorProfilePage";
import InstructorRevenuePage from "./pages/Instructor/Revenue/InstructorRevenuePage";
import InstructorStudentsPage from "./pages/Instructor/Students/InstructorStudentsPage";
import InstructorBlogPage from "./pages/Instructor/Blog/InstructorBlogPage";
import CreateBlogPage from "./pages/Instructor/Blog/CreateBlogPage";

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import AdminAnalyticsPage from "./pages/Admin/Analytics/AdminAnalyticsPage";
import AdminApprovalPage from "./pages/Admin/Approval/AdminApprovalPage";
import AdminCoursesPage from "./pages/Admin/Courses/AdminCoursesPage";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminLogsPage from "./pages/Admin/Logs/AdminLogsPage";
import AdminReportsPage from "./pages/Admin/Reports/AdminReportsPage";
import AdminRevenuePage from "./pages/Admin/Revenue/AdminRevenuePage";
import AdminSettingsPage from "./pages/Admin/Settings/AdminSettingsPage";
import AdminUsersPage from "./pages/Admin/Users/AdminUsersPage";
import ResetPassword from "./pages/Auth/ResetPassword";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />} errorElement={<ErrorPage />}>
      {/* Auth Routes */}
      <Route
        element={
          <GuestRoute>
            <AnonymousLayout />
          </GuestRoute>
        }
      >
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resend-otp" element={<ResendOTP />} />
        <Route path="/store-registration" element={<StoreRegistration />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Student Routes */}
      <Route
        element={
          <ProtectedRoute requiredRoles={["student", "instructor", "admin"]}>
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/student/my-courses" element={<MyCoursesPage />} />
        <Route path="/student/wishlist" element={<WishlistPage />} />
        <Route path="/student/progress" element={<LearningProgressPage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/student/settings" element={<StudentSettingsPage />} />
      </Route>

      {/* Student fullscreen pages */}
      <Route
        element={
          <ProtectedRoute requiredRoles={["student", "instructor", "admin"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="/student/learning/:courseId" element={<LearningPage />} />
        <Route path="/student/quiz/:courseId" element={<QuizPage />} />
        <Route
          path="/student/certificate/:courseId"
          element={<CertificatePage />}
        />
      </Route>

      {/* Instructor Routes */}
      <Route
        element={
          <ProtectedRoute requiredRoles={["instructor"]}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
        <Route
          path="/instructor/courses/create"
          element={<CreateCoursePage />}
        />
        <Route
          path="/instructor/courses/edit/:id"
          element={<CreateCoursePage />}
        />
        <Route path="/instructor/revenue" element={<InstructorRevenuePage />} />
        <Route
          path="/instructor/students"
          element={<InstructorStudentsPage />}
        />
        <Route path="/instructor/blog" element={<InstructorBlogPage />} />
        <Route path="/instructor/blog/create" element={<CreateBlogPage />} />
        <Route
          path="/instructor/analytics"
          element={<InstructorAnalyticsPage />}
        />
        <Route path="/instructor/profile" element={<InstructorProfilePage />} />

      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/approval" element={<AdminApprovalPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/revenue" element={<AdminRevenuePage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/logs" element={<AdminLogsPage />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Route>,
  ),
);

export default router;
