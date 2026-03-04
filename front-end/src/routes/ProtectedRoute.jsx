import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/slices/authStore";
import { ROUTES } from "../utils/constants";

/**
 * ProtectedRoute — redirects unauthenticated users to /signin
 * Pass `requiredRoles` to also check role access.
 */
export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location, message: "Vui lòng đăng nhập để tiếp tục." }}
        replace
      />
    );
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
    const redirectMap = {
      admin: ROUTES.ADMIN_DASHBOARD,
      instructor: ROUTES.INSTRUCTOR_DASHBOARD,
      student: ROUTES.STUDENT_DASHBOARD,
      guest: ROUTES.HOME,
    };
    return <Navigate to={redirectMap[role] || ROUTES.HOME} replace />;
  }

  return children;
};

export const RoleGuard = ({ children, allowedRoles = [], fallback = null }) => {
  const { role } = useAuthStore();
  return allowedRoles.includes(role) ? children : fallback;
};

/**
 * GuestRoute — redirects authenticated users away from auth pages
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (isAuthenticated) {
    const redirectMap = {
      admin: ROUTES.ADMIN_DASHBOARD,
      instructor: ROUTES.INSTRUCTOR_DASHBOARD,
      student: ROUTES.STUDENT_DASHBOARD,
    };
    return <Navigate to={redirectMap[role] || ROUTES.HOME} replace />;
  }

  return children;
};
