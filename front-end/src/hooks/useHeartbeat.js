import { useCallback, useEffect, useRef } from "react";
import EnrollmentService from "../services/api/EnrollmentService";
import useCourseStore from "../store/slices/courseStore";

/**
 * useHeartbeat
 *
 * Chịu trách nhiệm:
 *  1. Flush watchedSecondsDelta lên server theo sự kiện (complete/chuyển bài)
 *  2. Flush heartbeat cuối khi unmount
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

  const lastSentRef = useRef(activeItemWatchedSecs);
  const inFlightRef = useRef(false);
  const inFlightPromiseRef = useRef(null);

  // Sync lastSentRef khi chuyển bài để tránh gửi delta sai
  useEffect(() => {
    lastSentRef.current = activeItemWatchedSecs;
  }, [activeLessonId, activeItemWatchedSecs]);

  const flush = useCallback(async () => {
    if (inFlightRef.current) {
      await inFlightPromiseRef.current;
      return;
    }
    if (!activeLessonId || activeItemType !== "lesson") return;

    const currentWatched = videoPlayerRef.current?.getWatchedSeconds() ?? 0;
    const delta = currentWatched - lastSentRef.current;
    if (delta <= 0) return;

    inFlightRef.current = true;
    const reqPromise = EnrollmentService.heartbeat(courseId, activeLessonId, delta)
      .then((res) => {
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

        // Dùng flag lessonJustCompleted từ BE (chính xác hơn tự suy từ status)
        // vì status "done" có thể đã tồn tại từ trước, không phải do heartbeat này
        if (res.lessonJustCompleted) {
          markLessonComplete(courseId, activeLessonId);
          onDone();
        }
      })
      .catch(() => {
        // Heartbeat không critical → silent fail
      })
      .finally(() => {
        inFlightRef.current = false;
        inFlightPromiseRef.current = null;
      });

    inFlightPromiseRef.current = reqPromise;
    await reqPromise;
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

  // Flush khi unmount (rời trang)
  useEffect(() => {
    const videoPlayer = videoPlayerRef.current;
    return () => {
      if (activeLessonId && activeItemType === "lesson") {
        const currentWatched = videoPlayer?.getWatchedSeconds() ?? 0;
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

  return { flush };
}
