/**
 * AuthenService — dịch vụ xác thực
 *
 * Tối ưu:
 * - Bỏ try/catch thừa bọc ngoài (chỉ re-throw — không làm gì khác).
 *   Errors được xử lý tập trung qua axios interceptor / caller.
 * - Bỏ header Authorization thủ công vì api interceptor đã tự gắn.
 * - forgotPassword: fix bug swallow lỗi (trả data thay vì throw).
 */
import { api } from "../index";

class AuthenService {
  register(data) {
    return api.post("auth/register", data).then((r) => r.data);
  }

  async login(data) {
    const { data: res } = await api.post("auth/login", data);
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("accessToken", res.token);
    }
    return res;
  }

  // Fix: throw error thay vì swallow (để caller hiển thị toast lỗi đúng)
  forgotPassword(email) {
    return api.post("auth/forgot-password", { email }).then((r) => r.data);
  }

  resetPassword(token, newPassword, confirmPassword) {
    return api
      .post("auth/reset-password", { token, newPassword, confirmPassword })
      .then((r) => r.data);
  }

  verifyOTP(email, otp) {
    return api.post("auth/verify-otp", { email, otp }).then((r) => r.data);
  }

  resendOTP(email) {
    return api.post("auth/resend-otp", { email }).then((r) => r.data);
  }

  // Auth header được api interceptor tự gắn — không cần getItem thủ công
  updateProfile(data) {
    return api.put("auth/profile", data).then((r) => r.data);
  }

  changePassword(data) {
    return api.put("auth/password", data).then((r) => r.data);
  }

  changePasswordRequired(data) {
    return api.put("auth/change-password-required", data).then((r) => r.data);
  }

  getProfile() {
    return api.get("auth/profile").then((r) => r.data);
  }

  toggleWishlist(courseId) {
    return api.post("users/wishlist/toggle", { courseId }).then((r) => r.data);
  }

  async logout() {
    try {
      await api.post("auth/logout", {}, { withCredentials: true });
    } catch {
      // Server logout thất bại vẫn tiếp tục clear local data
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    return { success: true };
  }

  refreshToken() {
    return api
      .post("auth/refresh-token", {}, { withCredentials: true })
      .then((r) => {
        if (r.data.accessToken)
          localStorage.setItem("accessToken", r.data.accessToken);
        return r.data;
      });
  }
}

export default new AuthenService();
