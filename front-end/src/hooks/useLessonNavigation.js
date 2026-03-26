import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import EnrollmentService from "../services/api/EnrollmentService";
import useCourseStore from "../store/slices/courseStore";
import { ROUTES } from "../utils/constants";

/**
 * useLessonNavigation
 *
 * Chịu trách nhiệm:
 *  1. Điều hướng giữa các bài (goTo, handleNext, handlePrev)
 *  2. Đánh dấu hoàn thành lesson/quiz (markCurrentDone)
 *  3. Tính canGoNext, isCurrentDone
 *  4. Kiểm tra lock trước khi cho phép chuyển bài từ sidebar
 */
export function useLessonNavigation({
  courseId,
  flatItems,
  activeIdx,
  setActiveIdx,
  itemsProgress,
  serverProgress,
  onProgressUpdate,
  onFlushHeartbeat,
  onTimerClear,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { markLessonComplete, setCurrentLesson, updateItemsProgress } =
    useCourseStore();

  const [thresholdReached, setThresholdReached] = useState(false);

  const activeItem = flatItems[activeIdx];
  const activeLessonId = getLessonId(activeItem);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getItemStatus = useCallback(
    (lessonId) => {
      if (!lessonId) return null;
      return (
        itemsProgress.find((i) => i.itemId?.toString() === lessonId)?.status ??
        null
      );
    },
    [itemsProgress],
  );

  const isEffectivelyLocked = useCallback(
    (item) => {
      if (item?.itemType === "quiz") return false; // quiz luôn unlocked
      const status = getItemStatus(getLessonId(item));
      return status === "lock" || status === null;
    },
    [getItemStatus],
  );

  const isRewatching =
    itemsProgress.length > 0 &&
    itemsProgress.every((i) => i.itemType !== "lesson" || i.status === "done");

  // ── Điều hướng ───────────────────────────────────────────────────────────

  const goTo = useCallback(
    (idx) => {
      const targetItem = flatItems[idx];
      const targetLessonId = getLessonId(targetItem);
      const targetWatched =
        itemsProgress.find((i) => i.itemId?.toString() === targetLessonId)
          ?.watchedSeconds ?? 0;

      // Flush heartbeat bài hiện tại trước khi chuyển
      onTimerClear();
      onFlushHeartbeat();

      setThresholdReached(false);
      setActiveIdx(idx);
      setCurrentLesson(courseId, idx, targetLessonId);

      // Trả về watchedSeconds của bài target để caller init lastSentRef
      return targetWatched;
    },
    [
      flatItems,
      courseId,
      itemsProgress,
      setActiveIdx,
      setCurrentLesson,
      onFlushHeartbeat,
      onTimerClear,
    ],
  );

  const handleSidebarGoTo = useCallback(
    (idx) => {
      const targetItem = flatItems[idx];
      if (!isRewatching && isEffectivelyLocked(targetItem)) {
        toast.warning("Complete the previous lesson to unlock this one");
        return;
      }
      goTo(idx);
    },
    [flatItems, isRewatching, isEffectivelyLocked, goTo, toast],
  );

  // ── Đánh dấu hoàn thành ──────────────────────────────────────────────────

  const markCurrentDone = useCallback(async () => {
    if (!activeItem) return;

    if (activeItem.itemType === "lesson" && activeLessonId) {
      // Optimistic update trước khi gọi API
      markLessonComplete(courseId, activeLessonId);
      setThresholdReached(true);

      try {
        const res = await EnrollmentService.completeLesson(
          courseId,
          activeLessonId,
        );
        if (res?.itemsProgress) {
          onProgressUpdate(
            res.itemsProgress,
            res.progress ?? serverProgress,
            res.completed,
          );
          updateItemsProgress(
            courseId,
            res.itemsProgress,
            res.progress,
            res.completed,
          );
        }
      } catch {
        // Silent — optimistic đã cập nhật UI
      }
    } else if (activeItem.itemType === "quiz") {
      const quizId =
        activeItem.itemId?._id?.toString() ?? activeItem.itemId?.toString();
      if (!quizId) return;
      try {
        const res = await EnrollmentService.markQuizDone(courseId, quizId);
        if (res?.itemsProgress) {
          onProgressUpdate(res.itemsProgress);
          updateItemsProgress(courseId, res.itemsProgress);
        }
      } catch {
        // Silent
      }
    }
  }, [
    activeItem,
    activeLessonId,
    courseId,
    serverProgress,
    markLessonComplete,
    onProgressUpdate,
    updateItemsProgress,
  ]);

  // ── Next / Prev ───────────────────────────────────────────────────────────

  const handleNext = useCallback(
    (isManual = false) => {
      const isDone = getItemStatus(activeLessonId) === "done";
      const isLesson = activeItem?.itemType === "lesson";
      const hasVideo = !!activeItem?.itemId?.videoUrl;

      if (isLesson && hasVideo && !thresholdReached && !isDone) {
        toast.warning("Watch at least 30% of the lesson to continue");
        return;
      }

      markCurrentDone();

      if (activeIdx < flatItems.length - 1) {
        goTo(activeIdx + 1);
      } else if (isManual) {
        navigate(ROUTES.MY_CERTIFICATES);
      } else {
        toast.success("Congratulations! You have completed the course.");
      }
    },
    [
      activeItem,
      activeLessonId,
      activeIdx,
      flatItems.length,
      thresholdReached,
      getItemStatus,
      markCurrentDone,
      goTo,
      navigate,
      toast,
    ],
  );

  const handlePrev = useCallback(() => {
    if (activeIdx > 0) goTo(activeIdx - 1);
  }, [activeIdx, goTo]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const isCurrentDone = getItemStatus(activeLessonId) === "done";
  const activeItemHasVideo = !!activeItem?.itemId?.videoUrl;

  const canGoNext =
    activeItem?.itemType === "quiz" ||
    isCurrentDone ||
    thresholdReached ||
    (activeItem?.itemType === "lesson" && !activeItemHasVideo);

  const handleVideoReachedThreshold = useCallback(() => {
    setThresholdReached(true);
    markCurrentDone();
  }, [markCurrentDone]);

  return {
    thresholdReached,
    setThresholdReached,
    activeItem,
    activeLessonId,
    isCurrentDone,
    canGoNext,
    goTo,
    handleSidebarGoTo,
    handleNext,
    handlePrev,
    markCurrentDone,
    handleVideoReachedThreshold,
  };
}

// ─── Pure helper ────────────────────────────────────────────────────────────
export function getLessonId(item) {
  return item?.itemId?._id?.toString() ?? item?.itemId?.toString() ?? null;
}
