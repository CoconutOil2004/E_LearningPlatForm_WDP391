// src/pages/SignIn.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import loginpng from "../assets/images/login.jpg";
import { setCredentials } from "../features/auth/authSlice";
import { login } from "../services/authService";
import { API_BASE_URL } from '../utils/constants';

// Icons
const EyeIcon = (props) => (
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

const EyeOffIcon = (props) => (
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
);

const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
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

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message, { toastId: "login-required" });
      // Clear the state so the toast doesn't show up again on refresh
      navigate(".", { replace: true, state: {} });
    }
  }, [location, navigate]);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      dispatch(
        setCredentials({
          user: response.user,
          token: response.accessToken || response.token,
        }),
      );

      toast.success("Đăng nhập thành công!");

      if (response.user?.role === "admin") navigate("/admin");
      else if (response.user?.role === "seller") navigate("/seller");
      else navigate("/");
    } catch (error) {
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Left side: Form */}
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mx-auto lg:w-96"
        >
          <div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
              Chào mừng trở lại
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/signup" className="font-medium text-[#228B22] ">
                Đăng ký
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Địa chỉ Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="remember-me"
                      className="block ml-2 text-sm text-gray-900"
                    >
                      Ghi nhớ mật khẩu
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      opacity-75
                      className="font-medium text-forest-green-600 hover:text-forest-green-500"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all border border-transparent rounded-md shadow-sm bg-[#228B22]  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? "Đang tải..." : "Đăng nhập"}
                  </button>

                  {/* <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-gray-500 bg-cream">Or</span>
                    </div>
                  </div> */}

                  {/* <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="inline-flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    <GoogleIcon />
                    <span>Google</span>
                  </button> */}
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Image */}
      <div className="relative flex-1 hidden w-0 lg:block">
        <img
          className="absolute inset-0 object-cover w-full h-full"
          src={loginpng}
          alt="Sign in background"
        />
        <div className="absolute inset-0 bg-indigo-600 mix-blend-multiply opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            {/* <p className="text-lg text-indigo-100">
              Khám phá hàng ngàn sản phẩm chất lượng ngay hôm nay.
            </p> */}
            {/* <p className="text-lg text-indigo-100">)</p> */}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
