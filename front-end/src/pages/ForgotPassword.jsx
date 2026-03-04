import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import AuthenService from "../services/api/AuthenService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await AuthenService.forgotPassword({ email });
      toast.success(
        res.message || "Mật khẩu mới đã được gửi tới email của bạn.",
      );
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra, vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#E8E8F0] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00C9A7]">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Quên mật khẩu
          </h1>
          <p className="mt-2 text-sm text-[#9A9AB8]">
            Nhập email và chúng tôi sẽ gửi mật khẩu mới cho bạn.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1E1E2E] bg-[#111118] p-6 shadow-2xl shadow-black/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#E8E8F0]"
              >
                Địa chỉ Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A12] px-3 py-2 text-sm text-[#E8E8F0] outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/40 placeholder:text-[#6B6B85]"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#9C63FF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6C63FF]/40 transition hover:translate-y-[-1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
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
                  Đang gửi...
                </span>
              ) : (
                "Gửi mật khẩu mới"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#9A9AB8]">
            Nhớ mật khẩu rồi?{" "}
            <Link
              to="/signin"
              className="font-semibold text-[#6C63FF] hover:text-[#9C63FF]"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
