import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Course store — tracks enrollments, wishlist, and learning progress
 */
const useCourseStore = create(
  persist(
    (set, get) => ({
      enrolledCourseIds: [1, 3], // pre-seeded for demo
      wishlistIds: [2, 4],
      lessonProgress: {}, // { [courseId]: { completedLessons: number[], currentLesson: number } }
      quizScores: {}, // { [courseId]: number }

      enroll: (courseId) =>
        set((state) => ({
          enrolledCourseIds: state.enrolledCourseIds.includes(courseId)
            ? state.enrolledCourseIds
            : [...state.enrolledCourseIds, courseId],
        })),

      toggleWishlist: (courseId) =>
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(courseId)
            ? state.wishlistIds.filter((id) => id !== courseId)
            : [...state.wishlistIds, courseId],
        })),

      isEnrolled: (courseId) => get().enrolledCourseIds.includes(courseId),
      isWishlisted: (courseId) => get().wishlistIds.includes(courseId),

      markLessonComplete: (courseId, lessonIdx) =>
        set((state) => {
          const prev = state.lessonProgress[courseId] || { completedLessons: [], currentLesson: 0 };
          const completedLessons = prev.completedLessons.includes(lessonIdx)
            ? prev.completedLessons
            : [...prev.completedLessons, lessonIdx];
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
        set((state) => ({ quizScores: { ...state.quizScores, [courseId]: score } })),

      getCourseProgress: (courseId, totalLessons) => {
        const prog = get().lessonProgress[courseId];
        if (!prog || totalLessons === 0) return 0;
        return Math.round((prog.completedLessons.length / totalLessons) * 100);
      },
    }),
    {
      name: "course-storage",
    }
  )
);

export default useCourseStore;
