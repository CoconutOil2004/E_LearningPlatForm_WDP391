import { create } from "zustand";
import { persist } from "zustand/middleware";
import AuthenService from "../../services/api/AuthenService";

/**
 * courseStore — manages enrollment, learning progress, and wishlist.
 *
 * Lesson progress is stored by lessonId (ObjectId string) to sync with the server.
 * When a student returns, syncFromServerItemsProgress() is called to restore from itemsProgress returned by BE.
 */
const useCourseStore = create(
  persist(
    (set, get) => ({
      enrolledCourseIds: [],
      wishlistIds: [],
      wishlistSynced: false,

      setWishlistIds: (ids) =>
        set({ wishlistIds: Array.isArray(ids) ? ids : [], wishlistSynced: true }),

      /**
       * lessonProgress:
       * {
       *   [courseId]: {
       *     completedLessonIds: string[],
       *     currentLessonId: string|null,
       *     currentFlatIdx: number,
       *     serverProgress: number,
       *     itemsProgress: Array,
       *   }
       * }
       */
      lessonProgress: {},
      quizScores: {},

      enroll: (courseId) =>
        set((state) => ({
          enrolledCourseIds: state.enrolledCourseIds.includes(courseId)
            ? state.enrolledCourseIds
            : [...state.enrolledCourseIds, courseId],
        })),

      setEnrolledCourseIds: (ids) =>
        set({ enrolledCourseIds: Array.isArray(ids) ? ids : [] }),

      isEnrolled: (courseId) => get().enrolledCourseIds.includes(courseId),

      toggleWishlist: async (courseId) => {
        // Optimistic update
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(courseId)
            ? state.wishlistIds.filter((id) => id !== courseId)
            : [...state.wishlistIds, courseId],
        }));

        try {
          // Sync with BE
          const response = await AuthenService.toggleWishlist(courseId);
          if (response.success && response.wishlistIds) {
            // Update with actual server state
            set({ wishlistIds: response.wishlistIds });
          }
        } catch (error) {
          console.error("Failed to sync wishlist with server:", error);
          // Rollback not strictly necessary as BE failed, but local state mismatch persists
        }
      },

      isWishlisted: (courseId) => get().wishlistIds.includes(courseId),

      /**
       * Sync entire itemsProgress from server to store.
       * Called when mounting LearningPage to restore progress.
       */
      syncFromServerItemsProgress: (
        courseId,
        itemsProgress,
        serverProgress,
        continueLessonId,
      ) =>
        set((state) => {
          const completedLessonIds = (itemsProgress || [])
            .filter((i) => i.itemType === "lesson" && i.status === "done")
            .map((i) => i.itemId?.toString());

          const prev = state.lessonProgress[courseId] || {};
          return {
            lessonProgress: {
              ...state.lessonProgress,
              [courseId]: {
                ...prev,
                completedLessonIds,
                serverProgress: serverProgress ?? prev.serverProgress ?? 0,
                itemsProgress: itemsProgress ?? prev.itemsProgress ?? [],
                currentLessonId:
                  prev.currentLessonId ?? continueLessonId ?? null,
                currentFlatIdx: prev.currentFlatIdx ?? 0,
              },
            },
          };
        }),

      /**
       * Update itemsProgress after each heartbeat/completeLesson response.
       */
      updateItemsProgress: (courseId, itemsProgress, progress, completed) =>
        set((state) => {
          const completedLessonIds = (itemsProgress || [])
            .filter((i) => i.itemType === "lesson" && i.status === "done")
            .map((i) => i.itemId?.toString());

          const prev = state.lessonProgress[courseId] || {};
          return {
            lessonProgress: {
              ...state.lessonProgress,
              [courseId]: {
                ...prev,
                completedLessonIds,
                itemsProgress: itemsProgress ?? prev.itemsProgress ?? [],
                serverProgress: progress ?? prev.serverProgress,
                serverCompleted: completed ?? prev.serverCompleted,
              },
            },
          };
        }),

      markLessonComplete: (courseId, lessonId) =>
        set((state) => {
          const prev = state.lessonProgress[courseId] || {
            completedLessonIds: [],
            currentFlatIdx: 0,
          };
          const completedLessonIds = prev.completedLessonIds?.includes(lessonId)
            ? prev.completedLessonIds
            : [...(prev.completedLessonIds ?? []), lessonId];
          return {
            lessonProgress: {
              ...state.lessonProgress,
              [courseId]: { ...prev, completedLessonIds },
            },
          };
        }),

      setCurrentLesson: (courseId, flatIdx, lessonId) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [courseId]: {
              ...(state.lessonProgress[courseId] || { completedLessonIds: [] }),
              currentFlatIdx: flatIdx,
              currentLessonId: lessonId ?? null,
            },
          },
        })),

      getCurrentFlatIdx: (courseId) =>
        get().lessonProgress[courseId]?.currentFlatIdx ?? 0,

      getCompletedLessonIds: (courseId) =>
        get().lessonProgress[courseId]?.completedLessonIds ?? [],

      getItemsProgress: (courseId) =>
        get().lessonProgress[courseId]?.itemsProgress ?? [],

      getCourseProgress: (courseId, totalLessons) => {
        const prog = get().lessonProgress[courseId];
        if (prog?.serverProgress != null) return prog.serverProgress;
        if (!prog || totalLessons === 0) return 0;
        return Math.round(
          ((prog.completedLessonIds?.length ?? 0) / totalLessons) * 100,
        );
      },

      saveQuizScore: (courseId, score) =>
        set((state) => ({
          quizScores: { ...state.quizScores, [courseId]: score },
        })),

      // Legacy compat
      syncProgress: (courseId, completedLessonIds) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [courseId]: {
              ...(state.lessonProgress[courseId] || { currentFlatIdx: 0 }),
              completedLessonIds,
            },
          },
        })),
    }),
    {
      name: "course-storage",
    },
  ),
);

export default useCourseStore;
