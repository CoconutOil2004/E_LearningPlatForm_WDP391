/**
 * AdminService
 * Gộp từ:
 *   - pages/DashboardAdmin/ManageUser/AdminUserService.js (sai layer)
 *   - pages/DashboardAdmin/ManageVoucher/VoucherService.js (hardcode URL + sai layer)
 * Dùng api interceptor → tự động attach token, refresh token khi hết hạn.
 */
import { api } from "../index";

class AdminService {
  // ─── Report ────────────────────────────────────────────────────────────────
  async getReport() {
    const { data } = await api.get("/api/admin/report");
    return data;
  }

  // ─── Users ────────────────────────────────────────────────────────────────
  async getAllUsers(page = 1, limit = 10, search = "", roles = [], action = "") {
    const { data } = await api.get("/api/admin/users", {
      params: { page, limit, search, role: roles.join(","), action },
    });
    return data;
  }

  async getUserDetails(userId) {
    const { data } = await api.get(`/api/admin/users/${userId}`);
    return data;
  }

  async updateUserByAdmin(userId, userData) {
    const { data } = await api.put(`/api/admin/users/${userId}`, userData);
    return data;
  }

  // ─── Stores ───────────────────────────────────────────────────────────────
  async getAllStores(page = 1, limit = 10, search = "", statuses = []) {
    const { data } = await api.get("/api/admin/stores", {
      params: { page, limit, search, status: statuses.join(",") },
    });
    return data;
  }

  async getStoreDetails(storeId) {
    const { data } = await api.get(`/api/admin/stores/${storeId}`);
    return data;
  }

  async updateStoreByAdmin(storeId, storeData) {
    const { data } = await api.put(`/api/admin/stores/${storeId}`, storeData);
    return data;
  }

  // ─── Vouchers ─────────────────────────────────────────────────────────────
  async getAllVouchers() {
    const { data } = await api.get("/api/admin/vouchers");
    return data;
  }

  async getVoucherById(id) {
    const { data } = await api.get(`/api/admin/vouchers/${id}`);
    return data;
  }

  async createVoucher(voucherData) {
    const { data } = await api.post("/api/admin/vouchers", voucherData);
    return data;
  }

  async updateVoucher(id, voucherData) {
    const { data } = await api.put(`/api/admin/vouchers/${id}`, voucherData);
    return data;
  }

  async deleteVoucher(id) {
    const { data } = await api.delete(`/api/admin/vouchers/${id}`);
    return data;
  }

  async toggleVoucherStatus(id) {
    const { data } = await api.put(`/api/admin/vouchers/${id}/toggle-active`);
    return data;
  }
}

export default new AdminService();
