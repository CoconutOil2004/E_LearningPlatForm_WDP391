import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { setCredentials } from "../features/auth/authSlice";
import AuthenService from "../services/api/AuthenService";
import { API_BASE_URL } from "../utils/constants";

const EyeIcon = ({ off, ...props }) =>
  off ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
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
      {...props}
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

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-violet-400/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-400/20";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const toast = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hiện thông báo từ state (redirect từ protected route)
    if (location.state?.message) {
      toast.info(location.state.message, { toastId: "login-required" });
      navigate(".", { replace: true, state: {} });
    }
    // Hiện lỗi từ Google OAuth callback
    const errorParam = new URLSearchParams(location.search).get("error");
    if (errorParam) {
      const msg =
        errorParam === "google_failed"
          ? "Đăng nhập Google thất bại. Vui lòng thử lại."
          : decodeURIComponent(errorParam);
      toast.error(msg, { toastId: "google-error" });
      navigate(".", { replace: true, state: {} });
    }
  }, [location, navigate, toast]);

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
      dispatch(setCredentials({ user: response.user, token: response.token }));
      toast.success("Đăng nhập thành công!");
      if (response.user?.role === "admin") navigate("/admin");
      else if (response.user?.role === "instructor") navigate("/overview");
      else navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Đăng nhập thất bại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080812]">
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo & heading */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2.5 mb-5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/60">
              LearnX Platform
            </span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Chào mừng trở lại
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Tiếp tục hành trình học tập của bạn
          </p>
        </div>

        {/* Card */}
        <div className="p-8 border shadow-2xl rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-white/50">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-white/50">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass + " pr-11"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon off={showPassword} className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-violet-500"
                />
                <span className="text-xs transition-colors text-white/40 group-hover:text-white/60">
                  Ghi nhớ
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs transition-colors text-violet-400 hover:text-violet-300"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 mt-2 text-sm font-semibold text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/25">hoặc</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <button
            onClick={() =>
              (window.location.href = `${API_BASE_URL}/api/auth/google`)
            }
            className="flex items-center justify-center w-full gap-3 py-3 text-sm font-medium transition-all duration-200 border rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
          >
            <GoogleIcon />
            Tiếp tục với Google
          </button>

          <p className="mt-6 text-xs text-center text-white/30">
            Chưa có tài khoản?{" "}
            <Link
              to="/signup"
              className="font-semibold transition-colors text-violet-400 hover:text-violet-300"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
