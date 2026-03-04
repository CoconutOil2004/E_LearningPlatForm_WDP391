import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AuthenService from "../../services/api/AuthenService";

const EyeIcon = ({ off }) =>
  off ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

const SignUp = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({ username: "", fullname: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error("Mật khẩu xác nhận không khớp!"); return; }
    setIsLoading(true);
    try {
      const res = await AuthenService.register({ username: formData.username, fullname: formData.fullname, email: formData.email, password: formData.password });
      toast.success(res.message || "Đăng ký thành công! Vui lòng kiểm tra email.");
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "var(--gradient-hero)" }}>
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="auth-blob absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, var(--color-primary-bg), transparent)" }} />
        <div className="auth-blob-delay absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, var(--color-secondary-bg), transparent)" }} />
        <div className="auth-blob absolute top-1/2 right-1/3 w-40 h-40 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--bg-subtle), transparent)" }} />
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
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
            style={{ background: "var(--color-primary-bg)", color: "var(--color-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Tạo tài khoản
          </motion.div>
          <h1 className="text-4xl font-black" style={{ color: "var(--text-heading)" }}>
            Bắt đầu học ngay
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Tham gia cùng hàng nghìn học viên trên LearnX
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="auth-label">Username</label>
                <input name="username" type="text" required value={formData.username}
                  onChange={handleChange} className="auth-input" placeholder="learnx_user" />
              </div>
              <div>
                <label className="auth-label">Họ và tên</label>
                <input name="fullname" type="text" required value={formData.fullname}
                  onChange={handleChange} className="auth-input" placeholder="Nguyễn Văn A" />
              </div>
            </div>

            <div>
              <label className="auth-label">Email</label>
              <input name="email" type="email" required value={formData.email}
                onChange={handleChange} className="auth-input" placeholder="name@example.com" />
            </div>

            <div>
              <label className="auth-label">Mật khẩu</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required
                  value={formData.password} onChange={handleChange}
                  className="auth-input" style={{ paddingRight: "2.75rem" }} placeholder="Tối thiểu 6 ký tự" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5"
                  style={{ color: "var(--text-disabled)" }}>
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Xác nhận mật khẩu</label>
              <div className="relative">
                <input name="confirmPassword" type={showConfirm ? "text" : "password"} required
                  value={formData.confirmPassword} onChange={handleChange}
                  className="auth-input" style={{ paddingRight: "2.75rem" }} placeholder="Nhập lại mật khẩu" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5"
                  style={{ color: "var(--text-disabled)" }}>
                  <EyeIcon off={showConfirm} />
                </button>
              </div>
            </div>

            {(passwordMatch || passwordMismatch) && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: passwordMatch ? "var(--color-success)" : "var(--color-danger)" }}>
                <span>{passwordMatch ? "✓" : "✗"}</span>
                <span>{passwordMatch ? "Mật khẩu khớp" : "Mật khẩu chưa khớp"}</span>
              </motion.div>
            )}

            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="auth-btn-submit mt-2">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Spinner />Đang tạo tài khoản...</span> : "Tạo tài khoản"}
            </motion.button>
          </form>

          <p className="mt-6 text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Đã có tài khoản?{" "}
            <Link to="/signin" className="auth-link">Đăng nhập</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
