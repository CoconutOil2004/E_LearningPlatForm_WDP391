import { createContext, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/api/AuthenService";
import useAuthStore from "../store/slices/authStore";
import useCourseStore from "../store/slices/courseStore";
import { ROUTES } from "../utils/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const {
    setCredentials,
    logout: storeLogout,
    updateUser,
    isAuthenticated,
    token,
  } = useAuthStore();
  const { setWishlistIds } = useCourseStore();
  const navigate = useNavigate();

  const hasRehydrated = useRef(false);

  useEffect(() => {
    if (hasRehydrated.current) return;
    hasRehydrated.current = true;

    if (!token || !isAuthenticated) return;

    AuthService.getProfile()
      .then((res) => {
        const user = res?.data || res?.user;
        if (user) {
          updateUser(user);
        }
        if (user?.watchlist) {
          setWishlistIds(user.watchlist.map((id) => id.toString()));
        }
      })
      .catch(() => {
        storeLogout();
      });
  });

  const login = async (email, password) => {
    try {
      const res = await AuthService.login({ email, password });
      const user = res.user || { name: "User", email, role: "student" };
      setCredentials(user, res.token);

      if (user.mustChangePassword) {
        navigate(ROUTES.CHANGE_PASSWORD_REQUIRED);
        return { success: true };
      }

      const role = user.role;
      if (role === "admin") navigate(ROUTES.ADMIN_DASHBOARD);
      else if (role === "instructor") navigate(ROUTES.INSTRUCTOR_DASHBOARD);
      else navigate(ROUTES.STUDENT_DASHBOARD);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Sign in failed" };
    }
  };

  const register = async (data) => {
    try {
      await AuthService.register(data);
      navigate(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(data.email)}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // Bỏ qua lỗi server-side logout
    } finally {
      storeLogout();
      navigate(ROUTES.HOME);
    }
  };

  return (
    <AuthContext.Provider value={{ login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
};
