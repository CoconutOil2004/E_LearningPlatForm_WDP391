import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import CourseService from "../services/api/CourseService";
import EnrollmentService from "../services/api/EnrollmentService";
import useCourseStore from "../store/slices/courseStore";
import { ROUTES } from "../utils/constants";

/**
 * useCourseLoader
 *
 * Chịu trách nhiệm:
 *  1. Fetch course detail + kiểm tra enrollment
 *  2. Build flatItems từ sections[]
 *  3. Fetch itemsProgress từ server
 *  4. Sync vào store và tính targetIdx để restore vị trí bài học
 */
export function useCourseLoader(courseId) {
  const navigate = useNavigate();
  const toast = useToast();
  const { enrolledCourseIds, syncFromServerItemsProgress, getCurrentFlatIdx } =
    useCourseStore();

  const [course, setCourse] = useState(null);
  const [flatItems, setFlatItems] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [itemsProgress, setItemsProgress] = useState([]);
  const [serverProgress, setServerProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { course: data, isEnrolled: serverEnrolled } =
          await CourseService.getCourseDetail(courseId);

        if (cancelled) return;

        if (!data) {
          toast.error("Course not found");
          navigate(ROUTES.MY_COURSES);
          return;
        }

        const hasEnrolled =
          enrolledCourseIds.includes(courseId) || serverEnrolled;
        if (!hasEnrolled) {
          toast.error("You are not enrolled in this course");
          navigate(`/courses/${courseId}`);
          return;
        }

        setCourse(data);

        const flat = buildFlatItems(data.sections ?? []);
        setFlatItems(flat);

        const enrollment =
          await EnrollmentService.getEnrollmentByCourse(courseId);

        if (cancelled) return;

        if (enrollment?.itemsProgress?.length) {
          const {
            itemsProgress: srvItems,
            progress,
            completed: srvCompleted,
            continueLesson,
          } = enrollment;

          syncFromServerItemsProgress(
            courseId,
            srvItems,
            progress,
            continueLesson?.lessonId,
          );
          setItemsProgress(srvItems);
          setServerProgress(progress ?? 0);

          const targetIdx = resolveTargetIdx({
            flat,
            srvItems,
            continueLesson,
            isRewatch: srvCompleted || continueLesson?.isRewatch,
            savedFlatIdx: getCurrentFlatIdx(courseId),
          });
          setActiveIdx(targetIdx);
        } else {
          const savedFlatIdx = getCurrentFlatIdx(courseId);
          if (savedFlatIdx > 0 && savedFlatIdx < flat.length) {
            setActiveIdx(savedFlatIdx);
          }
        }
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 403 || status === 401) {
          toast.error("You are not enrolled in this course");
          navigate(`/courses/${courseId}`);
        } else {
          toast.error("Failed to load course");
          navigate(ROUTES.MY_COURSES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return {
    course,
    flatItems,
    activeIdx,
    setActiveIdx,
    itemsProgress,
    setItemsProgress,
    serverProgress,
    setServerProgress,
    loading,
  };
}

// ─── Pure helpers ───────────────────────────────────────────────────────────

function buildFlatItems(sections) {
  const flat = [];
  sections.forEach((sec) => {
    (sec.items ?? []).forEach((item) => {
      flat.push({ ...item, sectionTitle: sec.title, flatIdx: flat.length });
    });
  });
  return flat;
}

function resolveTargetIdx({
  flat,
  srvItems,
  continueLesson,
  isRewatch,
  savedFlatIdx,
}) {
  // Ưu tiên 1: continueLesson từ server
  let targetIdx = 0;
  if (continueLesson?.lessonId) {
    const serverIdx = flat.findIndex(
      (f) =>
        (f.itemId?._id?.toString() ?? f.itemId?.toString()) ===
        continueLesson.lessonId,
    );
    if (serverIdx >= 0) targetIdx = serverIdx;
  }

  if (savedFlatIdx <= 0 || savedFlatIdx >= flat.length) return targetIdx;

  if (isRewatch) {
    // Rewatch: mọi bài đều unlocked → luôn dùng savedFlatIdx
    return savedFlatIdx;
  }

  // Học bình thường: chỉ dùng savedFlatIdx nếu bài đó không bị lock
  const savedItem = flat[savedFlatIdx];
  const savedLessonId =
    savedItem?.itemId?._id?.toString() ?? savedItem?.itemId?.toString();
  const savedStatus = srvItems.find(
    (i) => i.itemId?.toString() === savedLessonId,
  )?.status;

  return savedStatus && savedStatus !== "lock" ? savedFlatIdx : targetIdx;
}
