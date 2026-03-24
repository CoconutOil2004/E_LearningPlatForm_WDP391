// src/components/ResendOTP.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { API_BASE_URL } from "../../utils/constants";

const ResendOTP = ({ email, onResend }) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const toast = useToast();

  // Timer cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) return;

    setResendLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/resend-otp`, { email });

      if (res.data.success) {
        toast.success(
          res.data.message || "A new OTP has been sent to your email",
        );
        setResendCooldown(30);
        onResend && onResend();
      } else {
        toast.error(res.data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleResendOTP}
      disabled={resendLoading || resendCooldown > 0}
      className={`w-full py-3 px-4 mt-2 text-sm font-medium rounded-lg text-primary border border-primary hover:bg-primary hover:text-white transition-all duration-200 ${
        resendLoading || resendCooldown > 0
          ? "opacity-70 cursor-not-allowed"
          : ""
      }`}
    >
      {resendLoading
        ? "Sending again..."
        : resendCooldown > 0
          ? `Resend OTP (${resendCooldown}s)`
          : "Resend OTP"}
    </button>
  );
};

export default ResendOTP;
