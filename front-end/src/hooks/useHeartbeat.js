import { useCallback, useEffect, useRef } from "react";
import EnrollmentService from "../services/api/EnrollmentService";
import useCourseStore from "../store/slices/courseStore";

const HEARTBEAT_INTERVAL_MS = 10_000;

/**
 * useHeartbeat
 *
 * Chịu trách nhiệm:
 *  1. Gửi watchedSecondsDelta lên server mỗi 10s
 *  2. Flush heartbeat cuối khi unmount hoặc chuyển bài
 *  3. Cập nhật itemsProgress + markLessonComplete khi server báo "done"
 *
 * @param {object} params
 * @param {string}   params.courseId
 * @param {string}   params.activeLessonId
 * @param {string}   params.activeItemType        – "lesson" | "quiz"
 * @param {number}   params.activeItemWatchedSecs – watchedSeconds đã có từ server (để init ref)
 * @param {React.RefObject} params.videoPlayerRef
 * @param {number}   params.serverProgress
 * @param {Function} params.onDone               – () => void, gọi khi BE đánh dấu done
 * @param {Function} params.onProgressUpdate     – (itemsProgress, progress, completed) => void
 */
export function useHeartbeat({
  courseId,
  activeLessonId,
  activeItemType,
  activeItemWatchedSecs,
  videoPlayerRef,
  serverProgress,
  onDone,
  onProgressUpdate,
}) {
  const { updateItemsProgress, markLessonComplete } = useCourseStore();

  const timerRef = useRef(null);
  const lastSentRef = useRef(activeItemWatchedSecs);
  const inFlightRef = useRef(false);

  // Sync lastSentRef khi chuyển bài để tránh gửi delta sai
  useEffect(() => {
    lastSentRef.current = activeItemWatchedSecs;
  }, [activeLessonId, activeItemWatchedSecs]);

  const flush = useCallback(async () => {
    if (inFlightRef.current) return;
    if (!activeLessonId || activeItemType !== "lesson") return;

    const currentWatched = videoPlayerRef.current?.getWatchedSeconds() ?? 0;
    const delta = currentWatched - lastSentRef.current;
    if (delta <= 0) return;

    inFlightRef.current = true;
    try {
      const res = await EnrollmentService.heartbeat(
        courseId,
        activeLessonId,
        delta,
      );
      lastSentRef.current = currentWatched;

      if (!res?.itemsProgress) return;

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

      const isDone =
        res.itemsProgress.find((i) => i.itemId?.toString() === activeLessonId)
          ?.status === "done";

      if (isDone) {
        markLessonComplete(courseId, activeLessonId);
        onDone();
      }
    } catch {
      // Heartbeat không critical → silent fail
    } finally {
      inFlightRef.current = false;
    }
  }, [
    activeLessonId,
    activeItemType,
    courseId,
    serverProgress,
    videoPlayerRef,
    onDone,
    onProgressUpdate,
    updateItemsProgress,
    markLessonComplete,
  ]);

  // Bật/tắt interval khi đổi bài hoặc loại item
  useEffect(() => {
    if (activeItemType !== "lesson") return;
    timerRef.current = setInterval(flush, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [activeItemType, flush]);

  // Flush khi unmount (rời trang)
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (activeLessonId && activeItemType === "lesson") {
        const currentWatched = videoPlayerRef.current?.getWatchedSeconds() ?? 0;
        const delta = currentWatched - lastSentRef.current;
        if (delta > 0) {
          EnrollmentService.heartbeat(courseId, activeLessonId, delta).catch(
            () => {},
          );
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId, courseId]);

  return { flush, timerRef };
}
