// src/components/OTPVerification.jsx
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const API_BASE_URL = API_BASE_URL.trim();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Redirect nếu email không có
  useEffect(() => {
    if (!email) navigate("/signup");
  }, [email, navigate]);

  // Timer cooldown resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Xử lý nhập OTP
  const handleChange = (e, index) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      if (val && index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/verify-otp`, {
        email,
        otp: otpValue,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Xác thực thành công!");
        navigate("/signin");
      } else {
        toast.error(res.data.message || "OTP không đúng");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Xác thực OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/resend-otp`, {
        email,
      });
      if (res.data.success) {
        toast.success(res.data.message || "OTP mới đã được gửi");
        setResendCooldown(30);
        setOtp(new Array(6).fill(""));
        inputRefs.current[0].focus();
      } else {
        toast.error(res.data.message || "Gửi lại OTP thất bại");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi lại OTP thất bại");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-r from-blue-50 to-indigo-50 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Xác thực Email
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Nhập mã OTP đã được gửi tới email: <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div className="flex justify-between gap-2">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={value}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-white rounded-lg bg-[#0F52BA] hover:bg-[#0A3C8A] transition-all duration-200 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang xác thực..." : "Xác thực OTP"}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading || resendCooldown > 0}
            className={`w-full py-3 px-4 mt-2 text-sm font-medium rounded-lg text-[#0F52BA] border border-[#0F52BA] hover:bg-[#0F52BA] hover:text-white transition-all duration-200 ${
              resendLoading || resendCooldown > 0
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {resendLoading
              ? "Đang gửi lại..."
              : resendCooldown > 0
              ? `Gửi lại OTP (${resendCooldown}s)`
              : "Gửi lại OTP"}
          </button>

          <div className="mt-4 text-sm text-center">
            <span className="text-gray-600">Verified? </span>
            <Link
              to="/signin"
              className="font-medium text-[#0F52BA] hover:text-[#0A3C8A] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
