import { create } from "zustand";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../utils/constants";
import NotificationService from "../../services/api/NotificationService";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await NotificationService.getNotifications();
      if (res.success) {
        const notifications = res.notifications || [];
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        });
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      const res = await NotificationService.markAsRead(id);
      if (res.success) {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length,
          };
        });
      }
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await NotificationService.markAllAsRead();
      if (res.success) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications].slice(0, 50);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
  },

  setupSocket: (userId) => {
    if (get().socket) return;

    const socket = io(API_BASE_URL);
    socket.emit("join", userId);

    socket.on("new-notification", (notification) => {
      get().addNotification(notification);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

export default useNotificationStore;
