import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/slices/authStore";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setCredentials } = useAuthStore();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");
      const userParam = params.get("user");

      console.log("token:", token);
      console.log("userParam:", userParam);

      if (!token || !userParam) {
        navigate("/signin?error=google_failed", { replace: true });
        return;
      }

      let user;

      try {
        user = JSON.parse(decodeURIComponent(userParam));
      } catch (err) {
        console.error("User parse error:", err);
        navigate("/signin?error=google_failed", { replace: true });
        return;
      }

      console.log("Parsed user:", user);

      // Persist the token to localStorage, exactly what AuthService.login does natively
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
      
      setCredentials(user, token);

      if (user.mustChangePassword) {
        navigate("/change-password-required", { replace: true });
        return;
      }

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (user.role === "instructor") {
        navigate("/instructor/dashboard", { replace: true });
        return;
      }

      if (user.role === "student") {
        navigate("/", { replace: true });
        return;
      }

    } catch (error) {
      console.error("Google callback error:", error);
      navigate("/signin?error=google_failed", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="space-y-4 text-center">
        <svg
          className="w-10 h-10 mx-auto animate-spin text-primary"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm text-white/50">Đang đăng nhập bằng Google...</p>
      </div>
    </div>
  );
};

export default AuthCallback;