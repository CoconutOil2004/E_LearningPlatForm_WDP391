import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SellerService from "../../services/api/SellerService";
import UserService from "../../services/api/UserService";
import useAuthStore from "../../store/slices/authStore";

const StoreRegistration = () => {
  const navigate = useNavigate();

  // Lấy state và action từ Zustand thay vì Redux
  const { user, token, isAuthenticated, setCredentials } = useAuthStore();

  // Redirect về login nếu chưa đăng nhập
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to register as a seller");
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    bannerImageURL: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Cập nhật role thành seller
      const response = await UserService.changeRole("seller");

      // Cập nhật Zustand store với thông tin user mới
      if (response.success) {
        setCredentials(
          { ...user, role: "seller" },
          response.token || token, // Dùng token mới nếu BE trả về
        );

        // 2. Tạo store profile sau khi đổi role thành công
        try {
          await SellerService.createStore({
            storeName: formData.storeName,
            description: formData.description,
            bannerImageURL: formData.bannerImageURL,
          });

          toast.success(
            "Store registered successfully! Your seller account is pending approval.",
          );
          navigate("/");
        } catch (storeError) {
          toast.error(
            "Role updated but failed to create store: " +
              (storeError.response?.data?.message || "Unknown error"),
          );
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to register as seller",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-r section-hero sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl"
      >
        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-center text-heading">
            Register as Seller
          </h2>
          <p className="mt-2 text-sm text-center text-muted">
            Set up your store and start selling on Shopii
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Store Name */}
            <div>
              <label
                htmlFor="storeName"
                className="block text-sm font-medium text-body"
              >
                Store Name
              </label>
              <input
                id="storeName"
                name="storeName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] sm:text-sm transition-all duration-200"
                placeholder="Your Store Name"
                value={formData.storeName}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-body"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] sm:text-sm transition-all duration-200"
                placeholder="Describe your store"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Banner Image URL */}
            <div>
              <label
                htmlFor="bannerImageURL"
                className="block text-sm font-medium text-body"
              >
                Banner Image URL (optional)
              </label>
              <input
                id="bannerImageURL"
                name="bannerImageURL"
                type="url"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-border placeholder-gray-500 text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] sm:text-sm transition-all duration-200"
                placeholder="https://example.com/banner-image.jpg"
                value={formData.bannerImageURL}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0F52BA] hover:bg-[#0A3C8A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F52BA] transition-all duration-200 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registering...
                </>
              ) : (
                "Register Store"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StoreRegistration;
