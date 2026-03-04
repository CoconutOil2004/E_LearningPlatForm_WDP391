import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth store — persisted to localStorage
 * Mirrors the token / user pattern from the original authSlice.js
 */
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: "guest", // "guest" | "student" | "instructor" | "admin"
      isAuthenticated: false,

      setCredentials: (user, token) =>
        set({
          user,
          token,
          role: user?.role || "student",
          isAuthenticated: true,
        }),

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        set({ user: null, token: null, role: "guest", isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
