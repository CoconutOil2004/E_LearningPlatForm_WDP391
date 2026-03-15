import axios from "axios";
import { BACKEND_API_URI } from "../../utils/constants";

const NotificationService = {
  getNotifications: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BACKEND_API_URI}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  markAsRead: async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${BACKEND_API_URI}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${BACKEND_API_URI}/notifications/mark-all-read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default NotificationService;