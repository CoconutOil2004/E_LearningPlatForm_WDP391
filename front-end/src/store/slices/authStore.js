import { create } from "zustand";
import { persist } from "zustand/middleware";
import useCourseStore from "./courseStore";

/**
 * Auth store — persisted to localStorage
 * Mirrors the token / user pattern from the original authSlice.js
 */
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: "guest",
      isAuthenticated: false,

      setCredentials: (user, token) => {
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("accessToken", token);
        }
        set({
          user,
          token,
          role: user?.role || "student",
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        useCourseStore.getState().setEnrolledCourseIds([]);
        useCourseStore.getState().setWishlistIds([]);
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
    },
  ),
);

export default useAuthStore;
