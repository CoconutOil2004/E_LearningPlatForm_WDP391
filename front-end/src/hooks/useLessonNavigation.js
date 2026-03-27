import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import EnrollmentService from "../services/api/EnrollmentService";
import useCourseStore from "../store/slices/courseStore";
import { ROUTES } from "../utils/constants";

/** Quản lý điều hướng sidebar + complete lesson/quiz trong Learning page. */
export function useLessonNavigation({
  courseId,
  flatItems,
  activeIdx,
  setActiveIdx,
  itemsProgress,
  serverProgress,
  onProgressUpdate,
  onFlushHeartbeat,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { markLessonComplete, setCurrentLesson, updateItemsProgress } =
    useCourseStore();

  // idx hiện tại đủ điều kiện complete (>=30% hoặc done từ server)
  const canCompleteForIdxRef = useRef(-1);
  const [, setCanCompleteVersion] = useState(0);
  const [userCompletedIdx, setUserCompletedIdx] = useState(-1);

  const activeItem = flatItems[activeIdx];
  const activeLessonId = getLessonId(activeItem);

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
      if (item?.itemType === "quiz") return false;
      const status = getItemStatus(getLessonId(item));
      return status === "lock" || status === null;
    },
    [getItemStatus],
  );

  const isRewatching =
    itemsProgress.length > 0 &&
    itemsProgress.every((i) => i.itemType !== "lesson" || i.status === "done");

  const canComplete = canCompleteForIdxRef.current === activeIdx;

  const markThresholdReached = useCallback(
    (forIdx) => {
      const idx = forIdx ?? activeIdx;
      if (canCompleteForIdxRef.current !== idx) {
        canCompleteForIdxRef.current = idx;
        setCanCompleteVersion((v) => v + 1);
      }
    },
    [activeIdx],
  );

  const isCurrentDone = getItemStatus(activeLessonId) === "done";

  useEffect(() => {
    if (isCurrentDone && canCompleteForIdxRef.current !== activeIdx) {
      canCompleteForIdxRef.current = activeIdx;
      setCanCompleteVersion((v) => v + 1);
    }
  }, [isCurrentDone, activeIdx]);

  const navigateToLesson = useCallback(
    async (idx) => {
      const targetItem = flatItems[idx];
      const targetLessonId = getLessonId(targetItem);

      await onFlushHeartbeat();

      canCompleteForIdxRef.current = -1;
      setCanCompleteVersion((v) => v + 1);
      setUserCompletedIdx(-1);

      setActiveIdx(idx);
      setCurrentLesson(courseId, idx, targetLessonId);
    },
    [
      flatItems,
      courseId,
      setActiveIdx,
      setCurrentLesson,
      onFlushHeartbeat,
    ],
  );

  const handleSidebarGoTo = useCallback(
    async (idx) => {
      const targetItem = flatItems[idx];
      if (!isRewatching && isEffectivelyLocked(targetItem)) {
        toast.info("Complete the previous lesson to unlock this one");
        return;
      }
      await navigateToLesson(idx);
    },
    [flatItems, isRewatching, isEffectivelyLocked, navigateToLesson, toast],
  );

  const markCurrentDone = useCallback(async () => {
    if (!activeItem) return false;

    if (activeItem.itemType === "lesson" && activeLessonId) {
      try {
        const res = await EnrollmentService.completeLesson(
          courseId,
          activeLessonId,
        );
        if (res?.itemsProgress) {
          markLessonComplete(courseId, activeLessonId);
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
        return true;
      } catch {
        return false;
      }
    } else if (activeItem.itemType === "quiz") {
      const quizId =
        activeItem.itemId?._id?.toString() ?? activeItem.itemId?.toString();
      if (!quizId) return false;
      try {
        const res = await EnrollmentService.markQuizDone(courseId, quizId);
        if (res?.itemsProgress) {
          onProgressUpdate(res.itemsProgress);
          updateItemsProgress(courseId, res.itemsProgress);
        }
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [
    activeItem,
    activeLessonId,
    courseId,
    serverProgress,
    markLessonComplete,
    onProgressUpdate,
    updateItemsProgress,
  ]);

  const handleComplete = useCallback(async () => {
    const isLesson = activeItem?.itemType === "lesson";
    const hasVideo = !!activeItem?.itemId?.videoUrl;

    if (isLesson && hasVideo && canCompleteForIdxRef.current !== activeIdx) {
      toast.info("Watch at least 30% of the lesson to continue");
      return;
    }

    const isLastItem = activeIdx === flatItems.length - 1;

    await onFlushHeartbeat();

    const completed = await markCurrentDone();
    if (!completed) return;

    setUserCompletedIdx(activeIdx);

    if (!isLastItem) {
      await navigateToLesson(activeIdx + 1);
    } else {
      setTimeout(() => navigate(ROUTES.MY_CERTIFICATES), 600);
    }
  }, [
    activeItem,
    activeIdx,
    flatItems.length,
    markCurrentDone,
    onFlushHeartbeat,
    navigateToLesson,
    navigate,
    toast,
  ]);

  const handleVideoReachedThreshold = useCallback(() => {
    markThresholdReached(activeIdx);
  }, [activeIdx, markThresholdReached]);

  return {
    activeItem,
    activeLessonId,
    canComplete,
    userCompletedIdx,
    handleSidebarGoTo,
    handleComplete,
    markCurrentDone,
    handleVideoReachedThreshold,
  };
}

// ─── Pure helper ────────────────────────────────────────────────────────────
export function getLessonId(item) {
  return item?.itemId?._id?.toString() ?? item?.itemId?.toString() ?? null;
}
