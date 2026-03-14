import axios from "axios";
import { BACKEND_API_URI } from "../utils/constants";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: BACKEND_API_URI,
});

// Add a request interceptor to include auth token with every request
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage first (this is most common)
    let token = localStorage.getItem("token");

    // If not found, try to get from accessToken key (alternative storage key)
    if (!token) {
      token = localStorage.getItem("accessToken");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No authentication token found for API request");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt token refresh if we have a 401 error and haven't tried refreshing yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${BACKEND_API_URI}/user/refresh-token`,
        );

        // Store the new token
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);

        // Update the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        console.error("Failed to refresh token:", err);
        // Redirect to login or dispatch logout action
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        window.location.href = "/signin";
      }
    } else if (error.response && error.response.status === 403) {
      const responseData = error.response.data || {};
      const requestUrl = originalRequest?.url || "";

      // Nếu tài khoản chưa xác thực OTP → điều hướng về trang verify-otp
      if (responseData.email) {
        window.location.href = `/verify-otp?email=${encodeURIComponent(responseData.email)}`;
      } else if (
        // Các URL course/enrollment → để component tự xử lý, KHÔNG redirect toàn cục
        requestUrl.includes("/courses/") ||
        requestUrl.includes("/enrollments/") ||
        requestUrl.includes("/lessons/") ||
        requestUrl.includes("/blogs/") ||
        requestUrl.startsWith("/blogs") ||
        // Hoặc message liên quan đến enrollment
        (responseData.message &&
          (responseData.message.includes("mua") ||
            responseData.message.includes("khóa học") ||
            responseData.message.includes("enroll") ||
            responseData.message.includes("purchase") ||
            responseData.message.includes("course")))
      ) {
        // Để component tự bắt và xử lý
      } else {
        // Các trường hợp 403 thực sự không có quyền → trang lỗi
        const errorMessage =
          responseData.message ||
          "You do not have permission to access this resource.";
        window.location.href = `/error?status=403&message=${encodeURIComponent(errorMessage)}`;
      }
    }

    // Normalize error: đính kèm message từ BE vào error.message
    // để catch ở component chỉ cần đọc error.message thay vì error.response?.data?.message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  },
);

export { api };