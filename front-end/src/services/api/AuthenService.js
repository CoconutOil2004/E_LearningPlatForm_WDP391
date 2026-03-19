import { api } from "../index"; // Ensure api is properly configured to handle requests
class AuthenService {
  async register(data) {
    try {
      const response = await api.post("auth/register", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async login(data) {
    try {
      const response = await api.post("auth/login", data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("accessToken", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post("auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }

  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await api.post("auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(email, otp) {
    try {
      const response = await api.post("auth/verify-otp", { email, otp });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async resendOTP(email) {
    try {
      const response = await api.post("auth/resend-otp", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(data) {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put("auth/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(data) {
    try {
      const response = await api.put("auth/change-password", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePasswordRequired(data) {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put("auth/change-password-required", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async toggleWishlist(courseId) {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "users/wishlist/toggle",
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem("token");
      // Try to notify the backend about logout
      try {
        await api.post(
          "auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        );
      } catch (e) {
        console.log(
          "Error during server logout, continuing with local logout",
          e,
        );
      }

      // Clear all auth-related data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Clear any session/cookie data if needed
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, try to clear tokens
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await api.post(
        "auth/refresh-token",
        {},
        { withCredentials: true },
      );
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthenService();
