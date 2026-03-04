import { create } from "zustand";

const useNotificationStore = create((set) => ({
  notifications: [
    { id: 1, text: "New lesson available in React Mastery", time: "2m ago", read: false },
    { id: 2, text: "Your quiz score: 90%", time: "1h ago", read: false },
    { id: 3, text: "Certificate ready for download", time: "1d ago", read: true },
  ],

  unreadCount: () => useNotificationStore.getState().notifications.filter((n) => !n.read).length,

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  addNotification: (notif) =>
    set((state) => ({
      notifications: [{ id: Date.now(), read: false, time: "now", ...notif }, ...state.notifications],
    })),
}));

export default useNotificationStore;
