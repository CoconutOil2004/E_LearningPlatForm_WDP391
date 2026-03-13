import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Course store — tracks enrollments, wishlist, and learning progress.
 *
 * NOTE: enrolledCourseIds and lessonProgress are CACHED from the server.
 * They are refreshed from /enrollments/my-courses on each session start
 * (see CourseDetailPage and LearningPage).
 * Do NOT pre-seed fake IDs here — that breaks the enrollment check.
 */
const useCourseStore = create(
  persist(
    (set, get) => ({
      enrolledCourseIds: [], // populated from server: string[]
      wishlistIds: [],
      lessonProgress: {}, // { [courseId]: { completedLessons: string[], currentLesson: number } }
      quizScores: {}, // { [courseId]: number }

      // Called after server confirms enrollment (free enroll or payment success)
      enroll: (courseId) =>
        set((state) => ({
          enrolledCourseIds: state.enrolledCourseIds.includes(courseId)
            ? state.enrolledCourseIds
            : [...state.enrolledCourseIds, courseId],
        })),

      // Called on session start to sync from server
      setEnrolledCourseIds: (ids) =>
        set({ enrolledCourseIds: Array.isArray(ids) ? ids : [] }),

      toggleWishlist: (courseId) =>
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(courseId)
            ? state.wishlistIds.filter((id) => id !== courseId)
            : [...state.wishlistIds, courseId],
        })),

      isEnrolled: (courseId) => get().enrolledCourseIds.includes(courseId),
      isWishlisted: (courseId) => get().wishlistIds.includes(courseId),

      /**
       * Mark a lesson complete locally by its actual lessonId (ObjectId string).
       * The LearningPage also calls the BE API to persist it.
       */
      markLessonComplete: (courseId, lessonId) =>
        set((state) => {
          const prev = state.lessonProgress[courseId] || {
            completedLessons: [],
            currentLesson: 0,
          };
          const completedLessons = prev.completedLessons.includes(lessonId)
            ? prev.completedLessons
            : [...prev.completedLessons, lessonId];
          return {
            lessonProgress: {
              ...state.lessonProgress,
              [courseId]: { ...prev, completedLessons },
            },
          };
        }),

      setCurrentLesson: (courseId, lessonIdx) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [courseId]: {
              ...(state.lessonProgress[courseId] || { completedLessons: [] }),
              currentLesson: lessonIdx,
            },
          },
        })),

      saveQuizScore: (courseId, score) =>
        set((state) => ({
          quizScores: { ...state.quizScores, [courseId]: score },
        })),

      getCourseProgress: (courseId, totalLessons) => {
        const prog = get().lessonProgress[courseId];
        if (!prog || totalLessons === 0) return 0;
        return Math.round((prog.completedLessons.length / totalLessons) * 100);
      },

      // Sync server-side progress into local store (called after loading enrollment data)
      syncProgress: (courseId, completedLessonIds) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [courseId]: {
              ...(state.lessonProgress[courseId] || { currentLesson: 0 }),
              completedLessons: completedLessonIds,
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
