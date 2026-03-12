import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AuthenService from "../../services/api/AuthenService";

/* ─── Icons ─────────────────────────────────────────────────────────────── */
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

/* ─── Password strength ─────────────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Rất yếu", color: "#ef4444" },
    { label: "Yếu", color: "#f97316" },
    { label: "Trung bình", color: "#eab308" },
    { label: "Mạnh", color: "#22c55e" },
    { label: "Rất mạnh", color: "#16a34a" },
  ];
  return { score, ...map[score] };
};

/* ─── Component ─────────────────────────────────────────────────────────── */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const strength = getStrength(password);

  /* token missing */
  const tokenMissing = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthenService.resetPassword(token, password);
      toast.success(res?.message || "Đặt lại mật khẩu thành công!");
      setDone(true);
      setTimeout(() => navigate("/signin"), 3000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Link đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại.",
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
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full auth-blob -top-16 left-1/3 w-60 h-60 opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary-bg), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 w-64 h-64 rounded-full opacity-25 auth-blob-delay right-1/4"
          style={{
            background:
              "radial-gradient(circle, var(--color-secondary-bg), transparent)",
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
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-5 text-3xl rounded-2xl"
            style={{ background: "var(--color-primary-bg)" }}
          >
            🔒
          </motion.div>
          <h1
            className="text-4xl font-black"
            style={{ color: "var(--text-heading)" }}
          >
            Đặt mật khẩu mới
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn.
          </p>
        </div>

        <div className="auth-card">
          <AnimatePresence mode="wait">
            {/* ── Token missing ── */}
            {tokenMissing && (
              <motion.div
                key="no-token"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="mb-4 text-5xl">⚠️</div>
                <h3
                  className="mb-2 text-lg font-bold"
                  style={{ color: "var(--text-heading)" }}
                >
                  Link không hợp lệ
                </h3>
                <p
                  className="mb-5 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Không tìm thấy token đặt lại mật khẩu. Vui lòng yêu cầu lại.
                </p>
                <Link
                  to="/forgot-password"
                  className="inline-block text-center auth-btn-submit"
                >
                  Quên mật khẩu
                </Link>
              </motion.div>
            )}

            {/* ── Success ── */}
            {!tokenMissing && done && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="mb-4 text-5xl">✅</div>
                <h3
                  className="mb-2 text-lg font-bold"
                  style={{ color: "var(--text-heading)" }}
                >
                  Thành công!
                </h3>
                <p
                  className="mb-4 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Mật khẩu của bạn đã được cập nhật. Đang chuyển về trang đăng
                  nhập…
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-disabled)" }}
                >
                  Tự động chuyển sau 3 giây
                </p>
              </motion.div>
            )}

            {/* ── Form ── */}
            {!tokenMissing && !done && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* New password */}
                <div>
                  <label className="auth-label">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 auth-input"
                      placeholder="Tối thiểu 8 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 flex items-center right-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2"
                    >
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 transition-all duration-300 rounded-full"
                            style={{
                              background:
                                i <= strength.score
                                  ? strength.color
                                  : "var(--border-default)",
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="auth-label">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10 auth-input"
                      placeholder="Nhập lại mật khẩu mới"
                      style={{
                        borderColor:
                          confirmPassword && confirmPassword !== password
                            ? "#ef4444"
                            : confirmPassword && confirmPassword === password
                              ? "#22c55e"
                              : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 flex items-center right-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <EyeIcon off={showConfirm} />
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-xs"
                      style={{ color: "#ef4444" }}
                    >
                      Mật khẩu không khớp
                    </motion.p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-xs"
                      style={{ color: "#22c55e" }}
                    >
                      ✓ Mật khẩu khớp
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="auth-btn-submit"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Đang xử lý...
                    </span>
                  ) : (
                    "Đặt mật khẩu mới"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <p
            className="mt-6 text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Nhớ mật khẩu rồi?{" "}
            <Link to="/signin" className="auth-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
