import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import AuthenService from "../services/api/AuthenService";

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

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-violet-400/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-400/20";

const SignUp = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await AuthenService.register({
        username: formData.username,
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
      });
      toast.success(
        res.message || "Đăng ký thành công! Vui lòng kiểm tra email.",
      );
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Đăng ký thất bại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "learnx_user",
      col: 1,
    },
    {
      name: "fullname",
      label: "Họ và tên",
      type: "text",
      placeholder: "Nguyễn Văn A",
      col: 1,
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080812] py-10">
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[550px] h-[550px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute top-[50%] left-[40%] w-[250px] h-[250px] rounded-full bg-pink-500/8 blur-[80px]" />
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
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2.5 mb-5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/60">
              Tạo tài khoản
            </span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Bắt đầu học ngay
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Tham gia cùng hàng nghìn học viên trên LearnX
          </p>
        </div>

        <div className="p-8 border shadow-2xl rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username + Fullname side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-white/50">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="learnx_user"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-white/50">
                  Họ và tên
                </label>
                <input
                  name="fullname"
                  type="text"
                  required
                  value={formData.fullname}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

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
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon off={showPassword} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-white/50">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass + " pr-11"}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon off={showConfirm} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Password match indicator */}
            {formData.confirmPassword && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-1.5 text-xs ${formData.password === formData.confirmPassword ? "text-emerald-400" : "text-rose-400"}`}
              >
                <span>
                  {formData.password === formData.confirmPassword ? "✓" : "✗"}
                </span>
                <span>
                  {formData.password === formData.confirmPassword
                    ? "Mật khẩu khớp"
                    : "Mật khẩu chưa khớp"}
                </span>
              </motion.div>
            )}

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
                  Đang tạo tài khoản...
                </span>
              ) : (
                "Tạo tài khoản"
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-xs text-center text-white/30">
            Đã có tài khoản?{" "}
            <Link
              to="/signin"
              className="font-semibold transition-colors text-violet-400 hover:text-violet-300"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
