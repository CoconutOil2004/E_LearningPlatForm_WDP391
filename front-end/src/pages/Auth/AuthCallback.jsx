import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../../features/auth/authSlice";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (!token) {
      navigate("/signin?error=google_failed", { replace: true });
      return;
    }

    try {
      // BE đã gửi user đầy đủ, dùng trực tiếp thay vì decode token
      const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;

      dispatch(setCredentials({ user, token }));

      // Redirect theo role
      if (user?.role === "admin") navigate("/admin", { replace: true });
      else if (user?.role === "instructor")
        navigate("/overview", { replace: true });
      else navigate("/", { replace: true });
    } catch {
      navigate("/signin?error=google_failed", { replace: true });
    }
  }, [dispatch, navigate]);

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
