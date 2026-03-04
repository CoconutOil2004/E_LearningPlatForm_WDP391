import { api } from "../index";

/**
 * AuthService — wraps all /auth/* endpoints.
 * Integrates with the existing backend as-is.
 */
class AuthService {
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
      return error.response?.data || { error: true, message: "Request failed" };
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await api.post(`auth/reset-password/${token}`, { password, token });
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

  async getProfile() {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  async logout() {
    try {
      const token = localStorage.getItem("token");
      try {
        await api.post(
          "auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
      } catch (e) {
        console.log("Server logout error (continuing with local logout)", e);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      return { success: true };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await api.post("auth/refresh-token", {}, { withCredentials: true });
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
