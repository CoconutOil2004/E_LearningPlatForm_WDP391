import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AuthenService from "../../services/api/AuthenService";
import useAuthStore from "../../store/slices/authStore";
import { API_BASE_URL } from "../../utils/constants";

const EyeIcon = ({ off }) =>
  off ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.68 1.22 9.18 3.6l6.84-6.84C35.58 2.34 30.24 0 24 0 14.64 0 6.4 5.34 2.48 13.12l7.98 6.2C12.02 13.02 17.6 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.52-.14-3-.4-4.5H24v9h12.7c-.56 3-2.2 5.5-4.7 7.2l7.3 5.7C43.92 37.46 46.5 31.46 46.5 24.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.46 28.88a14.54 14.54 0 010-9.76l-7.98-6.2C.9 16.14 0 20.02 0 24s.9 7.86 2.48 11.08l7.98-6.2z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.92-2.14 15.9-5.84l-7.3-5.7c-2.04 1.38-4.68 2.2-8.6 2.2-6.4 0-11.98-3.52-14.54-8.62l-7.98 6.2C6.4 42.66 14.64 48 24 48z"
    />
  </svg>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
);

const SignIn = () => {
  const navigate = useNavigate();
  const { setCredentials } = useAuthStore();
  const location = useLocation();
  const toast = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return; // chặn lần chạy thứ 2 (StrictMode)

    if (location.state?.message) {
      toastShown.current = true; // đánh dấu đã hiện
      toast.info(location.state?.message);
      navigate(".", { replace: true, state: {} });
    }
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await AuthenService.login({
        email: formData.email,
        password: formData.password,
      });
      setCredentials(response.user, response.token);
      toast.success("Signed in successfully!");
      if (response.user?.role === "admin") navigate("/admin/dashboard");
      else if (response.user?.role === "instructor")
        navigate("/instructor/dashboard");
      else navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Sign in failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full auth-blob -top-20 -left-20 w-80 h-80 opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary-bg), transparent)",
          }}
        />
        <div
          className="absolute rounded-full auth-blob-delay -bottom-16 -right-16 w-72 h-72 opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--color-secondary-bg), transparent)",
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full auth-blob top-1/3 right-1/4 opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--bg-subtle), transparent)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
            style={{
              background: "var(--color-primary-bg)",
              color: "var(--color-primary)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            LearnX Platform
          </motion.div>
          <h1
            className="text-4xl font-black"
            style={{ color: "var(--text-heading)" }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Continue your learning journey
          </p>

          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Admin: admin@gmail.com / abc@123
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Instructor: instructor@gmail.com / abc@123
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="auth-label">Email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="auth-label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                  style={{ paddingRight: "2.75rem" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors"
                  style={{ color: "var(--text-disabled)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-disabled)")
                  }
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Remember me
                </span>
              </label>
              <Link to="/forgot-password" className="text-xs auth-link">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="mt-2 auth-btn-submit"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border-default)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-disabled)" }}>
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border-default)" }}
            />
          </div>

          <button
            onClick={() =>
              (window.location.href = `${API_BASE_URL}/api/auth/google`)
            }
            className="auth-btn-social"
          >
            <GoogleIcon />
            Tiếp tục với Google
          </button>

          <p
            className="mt-6 text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
