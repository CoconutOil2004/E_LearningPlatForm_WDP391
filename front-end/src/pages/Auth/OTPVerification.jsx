import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AuthenService from "../../services/api/AuthenService";

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { toast.error("Vui lòng nhập đủ 6 chữ số OTP"); return; }
    setIsLoading(true);
    try {
      await AuthenService.verifyOTP({ email, otp: code });
      toast.success("Xác thực thành công! Vui lòng đăng nhập.");
      navigate("/signin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await AuthenService.resendOTP({ email });
      toast.success("Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi lại OTP thất bại");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="auth-blob absolute -top-20 left-1/4 w-64 h-64 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, var(--color-primary-bg), transparent)" }} />
        <div className="auth-blob-delay absolute -bottom-16 right-1/4 w-72 h-72 rounded-full opacity-25"
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
            📧
          </motion.div>
          <h1 className="text-4xl font-black" style={{ color: "var(--text-heading)" }}>
            Xác thực Email
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Nhập mã 6 chữ số đã gửi tới
          </p>
          {email && (
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              {email}
            </p>
          )}
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            {/* OTP input boxes */}
            <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="text-center text-xl font-bold transition-all"
                  style={{
                    width: "3rem", height: "3.5rem",
                    border: `2px solid ${digit ? "var(--color-primary)" : "var(--border-default)"}`,
                    borderRadius: "var(--radius-md)",
                    background: digit ? "var(--color-primary-bg)" : "var(--bg-page)",
                    color: "var(--text-heading)",
                    outline: "none",
                    boxShadow: digit ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
                  }}
                />
              ))}
            </div>

            <motion.button type="submit" disabled={isLoading || otp.join("").length < 6}
              whileTap={{ scale: 0.98 }} className="auth-btn-submit">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Spinner />Đang xác thực...</span> : "Xác thực"}
            </motion.button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Không nhận được mã?{" "}
              {countdown > 0 ? (
                <span style={{ color: "var(--text-disabled)" }}>Gửi lại sau {countdown}s</span>
              ) : (
                <button onClick={handleResend} disabled={resending}
                  className="auth-link font-semibold text-xs disabled:opacity-50">
                  {resending ? "Đang gửi..." : "Gửi lại OTP"}
                </button>
              )}
            </p>
          </div>

          <p className="mt-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>
            <Link to="/signin" className="auth-link">← Quay lại đăng nhập</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
