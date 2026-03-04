import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AuthenService from "../../services/api/AuthenService";

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await AuthenService.forgotPassword({ email });
      toast.success(res.message || "Mật khẩu mới đã được gửi tới email của bạn.");
      setSent(true);
      setTimeout(() => navigate("/signin"), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="auth-blob absolute -top-16 left-1/3 w-60 h-60 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, var(--color-primary-bg), transparent)" }} />
        <div className="auth-blob-delay absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, var(--color-secondary-bg), transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 text-3xl"
            style={{ background: "var(--color-primary-bg)" }}
          >
            🔑
          </motion.div>
          <h1 className="text-4xl font-black" style={{ color: "var(--text-heading)" }}>
            Quên mật khẩu
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Nhập email và chúng tôi sẽ gửi mật khẩu mới cho bạn.
          </p>
        </div>

        <div className="auth-card">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-heading)" }}>Đã gửi!</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Vui lòng kiểm tra email <strong style={{ color: "var(--color-primary)" }}>{email}</strong> để lấy mật khẩu mới.
              </p>
              <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
                Đang chuyển về trang đăng nhập...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="auth-label">Địa chỉ Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required className="auth-input" placeholder="name@example.com" />
              </div>

              <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
                className="auth-btn-submit">
                {isLoading
                  ? <span className="flex items-center justify-center gap-2"><Spinner />Đang gửi...</span>
                  : "Gửi mật khẩu mới"}
              </motion.button>
            </form>
          )}

          <p className="mt-6 text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Nhớ mật khẩu rồi?{" "}
            <Link to="/signin" className="auth-link">Đăng nhập</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
