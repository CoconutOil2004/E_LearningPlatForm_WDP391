import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/api/AuthService";
import useAuthStore from "../store/slices/authStore";
import { useToast } from "./ToastContext";
import { ROUTES } from "../utils/constants";

const AuthContext = createContext(null);

/**
 * AuthProvider — handles login/register/logout flows.
 * Components can call useAuth() to get helpers.
 */
export const AuthProvider = ({ children }) => {
  const { setCredentials, logout: storeLogout, isAuthenticated, token } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  // Rehydrate user profile on mount if token exists
  useEffect(() => {
    if (token && isAuthenticated) {
      AuthService.getProfile().catch(() => {
        // Token invalid — force logout
        storeLogout();
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    try {
      const res = await AuthService.login({ email, password });
      const user = res.user || { name: "User", email, role: "student" };
      setCredentials(user, res.token);
      toast.success("Đăng nhập thành công!");
      const role = user.role;
      if (role === "admin") navigate(ROUTES.ADMIN_DASHBOARD);
      else if (role === "instructor") navigate(ROUTES.INSTRUCTOR_DASHBOARD);
      else navigate(ROUTES.STUDENT_DASHBOARD);
      return { success: true };
    } catch (error) {
      const msg = error.message || "Đăng nhập thất bại";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (data) => {
    try {
      const res = await AuthService.register(data);
      toast.success(res.message || "Đăng ký thành công! Vui lòng xác thực email.");
      navigate(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(data.email)}`);
      return { success: true };
    } catch (error) {
      const msg = error.message || "Đăng ký thất bại";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // ignore server errors
    } finally {
      storeLogout();
      toast.success("Đã đăng xuất");
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
