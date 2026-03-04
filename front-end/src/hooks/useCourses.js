import { useQuery } from "@tanstack/react-query";
import CourseService from "../services/api/CourseService";

/**
 * Hook to fetch all courses with optional filters.
 * Uses TanStack Query for caching and refetching.
 */
export const useCourses = (filters = {}) =>
  useQuery({
    queryKey: ["courses", filters],
    queryFn: () => CourseService.getAllCourses(filters),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

/**
 * Hook to fetch a single course by ID.
 */
export const useCourse = (id) =>
  useQuery({
    queryKey: ["course", id],
    queryFn: () => CourseService.getCourseById(id),
    select: (res) => res.data,
    enabled: !!id,
  });

/**
 * Hook to fetch lessons for a course.
 */
export const useCourseLessons = (courseId) =>
  useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => CourseService.getLessons(courseId),
    select: (res) => res.data,
    enabled: !!courseId,
  });

/**
 * Hook to fetch quiz questions for a course.
 */
export const useCourseQuiz = (courseId) =>
  useQuery({
    queryKey: ["quiz", courseId],
    queryFn: () => CourseService.getQuiz(courseId),
    select: (res) => res.data,
    enabled: !!courseId,
  });
