import {
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Button, Typography, message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LearningHeader from "../../../components/learning/LearningHeader";
import LearningSidebar from "../../../components/learning/LearningSidebar";
import QuizPlayer from "../../../components/learning/QuizPlayer";
import VideoPlayer from "../../../components/learning/VideoPlayer";
import CourseService from "../../../services/api/CourseService";
import EnrollmentService from "../../../services/api/EnrollmentService";
import ReviewModal from "../../../components/shared/ReviewModal";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";

const { Text, Title } = Typography;

/** Heartbeat interval (ms) — gửi mỗi 10 giây */
const HEARTBEAT_INTERVAL_MS = 10_000;

/** Threshold hoàn thành video = 30% duration (khớp BE LESSON_COMPLETE_THRESHOLD) */
const COMPLETION_THRESHOLD = 0.3;

/* ─── LoadingScreen ────────────────────────────────────────────────────────── */
const LoadingScreen = () => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#030712",
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "3px solid #667eea",
        borderTopColor: "transparent",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ─── LessonBottomBar ──────────────────────────────────────────────────────── */
const LessonBottomBar = ({
  activeIdx,
  flatItemsLength,
  activeItem,
  canGoNext,
  isCurrentDone,
  onPrev,
  onNext,
}) => (
  <div
    style={{
      padding: "14px 24px",
      background: "#111827",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}
  >
    <div>
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 13,
          display: "block",
          marginBottom: 2,
        }}
      >
        Lesson {activeIdx + 1} / {flatItemsLength}
      </Text>
      <Title level={5} style={{ color: "#fff", margin: 0 }}>
        {activeItem?.title}
      </Title>
      {!canGoNext && (
        <Text style={{ color: "#F59E0B", fontSize: 12 }}>
          ⚠️ Xem ít nhất 30% để mở khóa bài tiếp theo
        </Text>
      )}
    </div>

    <div style={{ display: "flex", gap: 12 }}>
      <Button
        icon={<LeftOutlined />}
        size="large"
        disabled={activeIdx === 0}
        onClick={onPrev}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "none",
          color: "#fff",
        }}
      />
      <Button
        type="primary"
        size="large"
        onClick={onNext}
        disabled={!canGoNext && activeItem?.itemType === "lesson"}
        icon={isCurrentDone ? <CheckCircleOutlined /> : null}
        style={{
          background: isCurrentDone
            ? "#10b981"
            : canGoNext
              ? "linear-gradient(135deg,#667eea,#764ba2)"
              : "#374151",
          border: "none",
          minWidth: 175,
          opacity: !canGoNext ? 0.65 : 1,
        }}
      >
        {isCurrentDone
          ? "Completed ✓"
          : canGoNext
            ? "Complete & Continue"
            : "Watching..."}
      </Button>
      <Button
        icon={<RightOutlined />}
        size="large"
        disabled={activeIdx === flatItemsLength - 1}
        onClick={onNext}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "none",
          color: "#fff",
        }}
      />
    </div>
  </div>
);

/* ─── LearningPage ─────────────────────────────────────────────────────────── */
const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    enrolledCourseIds,
    syncFromServerItemsProgress,
    updateItemsProgress,
    markLessonComplete,
    setCurrentLesson,
    getCurrentFlatIdx,
    getItemsProgress,
    getCourseProgress,
  } = useCourseStore();

  const [course, setCourse] = useState(null);
  const [flatItems, setFlatItems] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // itemsProgress từ server (source of truth cho lock/unlock)
  const [itemsProgress, setItemsProgress] = useState([]);
  // % tiến độ tổng thể từ server
  const [serverProgress, setServerProgress] = useState(0);

  // canGoNext dựa trên threshold 30% của bài hiện tại
  const [thresholdReached, setThresholdReached] = useState(false);

  // Ref đến VideoPlayer để lấy watchedSeconds
  const videoPlayerRef = useRef(null);

  // Heartbeat state
  const heartbeatTimerRef = useRef(null);
  const lastHeartbeatWatchedRef = useRef(0); // watchedSeconds đã gửi lần trước
  const heartbeatInFlightRef = useRef(false);

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  /* ── Helpers ── */
  const getLessonId = useCallback((item) => {
    return item?.itemId?._id?.toString() ?? item?.itemId?.toString() ?? null;
  }, []);

  const getServerItemStatus = useCallback(
    (lessonId) => {
      if (!lessonId) return null;
      const found = itemsProgress.find(
        (i) => i.itemId?.toString() === lessonId,
      );
      return found?.status ?? null;
    },
    [itemsProgress],
  );

  const getServerWatchedSeconds = useCallback(
    (lessonId) => {
      if (!lessonId) return 0;
      const found = itemsProgress.find(
        (i) => i.itemId?.toString() === lessonId,
      );
      return found?.watchedSeconds ?? 0;
    },
    [itemsProgress],
  );

  /* ── Load course + sync enrollment progress ── */
  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    const load = async () => {
      try {
        // 1. Load course detail
        const { course: data, isEnrolled: serverEnrolled } =
          await CourseService.getCourseDetail(courseId);

        if (cancelled) return;

        if (!data) {
          message.error("Course not found");
          navigate(ROUTES.MY_COURSES);
          return;
        }

        const hasEnrolled =
          enrolledCourseIds.includes(courseId) || serverEnrolled;
        if (!hasEnrolled) {
          message.warning("Bạn chưa đăng ký khóa học này.");
          navigate(`/courses/${courseId}`);
          return;
        }

        setCourse(data);

        // Build flatItems
        const flat = [];
        (data.sections ?? []).forEach((sec) => {
          (sec.items ?? []).forEach((item) => {
            flat.push({
              ...item,
              sectionTitle: sec.title,
              flatIdx: flat.length,
            });
          });
        });
        setFlatItems(flat);

        // 2. Lấy itemsProgress từ server để restore tiến độ
        const enrollment =
          await EnrollmentService.getEnrollmentByCourse(courseId);

        if (cancelled) return;

        if (enrollment?.itemsProgress?.length) {
          const {
            itemsProgress: srvItems,
            progress,
            continueLesson,
          } = enrollment;

          // Sync vào store
          syncFromServerItemsProgress(
            courseId,
            srvItems,
            progress,
            continueLesson?.lessonId,
          );

          setItemsProgress(srvItems);
          setServerProgress(progress ?? 0);

          // Restore vị trí bài học.
          // Ưu tiên: server continueLesson (source of truth về thứ tự học)
          // savedFlatIdx chỉ dùng khi nó trỏ đúng vào lesson mà server đang chỉ định.
          // Lý do: savedFlatIdx local có thể stale/sai do bug trước, còn
          // continueLesson được build từ itemsProgress thực tế trên server.
          let targetIdx = 0;

          if (continueLesson?.lessonId) {
            const serverIdx = flat.findIndex(
              (f) => getLessonId(f) === continueLesson.lessonId,
            );
            if (serverIdx >= 0) targetIdx = serverIdx;
          }

          // savedFlatIdx chỉ được dùng nếu nó trỏ đúng bài mà server cho phép (không lock)
          const savedFlatIdx = getCurrentFlatIdx(courseId);
          if (savedFlatIdx > 0 && savedFlatIdx < flat.length) {
            const savedItem = flat[savedFlatIdx];
            const savedLessonId = getLessonId(savedItem);
            const savedStatus = srvItems.find(
              (i) => i.itemId?.toString() === savedLessonId,
            )?.status;
            // Chỉ dùng savedFlatIdx nếu lesson đó không bị lock
            if (savedStatus && savedStatus !== "lock") {
              targetIdx = savedFlatIdx;
            }
          }

          setActiveIdx(targetIdx);
        } else {
          // Không có itemsProgress từ server, dùng vị trí đã lưu local
          const savedFlatIdx = getCurrentFlatIdx(courseId);
          if (savedFlatIdx > 0 && savedFlatIdx < flat.length) {
            setActiveIdx(savedFlatIdx);
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          message.warning("Bạn chưa đăng ký khóa học này.");
          navigate(`/courses/${courseId}`);
        } else {
          message.error("Không tải được khóa học");
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

  /* ── Reset thresholdReached khi đổi bài ── */
  const activeItem = flatItems[activeIdx];
  const activeLessonId = getLessonId(activeItem);

  useEffect(() => {
    setThresholdReached(false);
    lastHeartbeatWatchedRef.current = 0;
  }, [activeIdx]);

  /* ── Heartbeat timer ── */
  const sendHeartbeat = useCallback(async () => {
    if (heartbeatInFlightRef.current) return;
    if (!activeLessonId || activeItem?.itemType !== "lesson") return;

    const currentWatched = videoPlayerRef.current?.getWatchedSeconds() ?? 0;
    const delta = currentWatched - lastHeartbeatWatchedRef.current;
    if (delta <= 0) return;

    heartbeatInFlightRef.current = true;
    try {
      const res = await EnrollmentService.heartbeat(
        courseId,
        activeLessonId,
        delta,
      );
      lastHeartbeatWatchedRef.current = currentWatched;

      if (res?.itemsProgress) {
        setItemsProgress(res.itemsProgress);
        setServerProgress(res.progress ?? serverProgress);
        updateItemsProgress(
          courseId,
          res.itemsProgress,
          res.progress,
          res.completed,
        );

        // Nếu BE đã đánh dấu done → cập nhật local
        const entry = res.itemsProgress.find(
          (i) => i.itemId?.toString() === activeLessonId,
        );
        if (entry?.status === "done") {
          markLessonComplete(courseId, activeLessonId);
          setThresholdReached(true);
        }
      }
    } catch {
      // Heartbeat không critical, silent fail
    } finally {
      heartbeatInFlightRef.current = false;
    }
  }, [
    activeLessonId,
    activeItem,
    courseId,
    serverProgress,
    updateItemsProgress,
    markLessonComplete,
  ]);

  // Gắn/tháo heartbeat timer
  useEffect(() => {
    if (activeItem?.itemType !== "lesson") return;

    heartbeatTimerRef.current = setInterval(
      sendHeartbeat,
      HEARTBEAT_INTERVAL_MS,
    );
    return () => clearInterval(heartbeatTimerRef.current);
  }, [activeItem, sendHeartbeat]);

  // Flush heartbeat khi unmount (navigate ra ngoài)
  useEffect(() => {
    return () => {
      clearInterval(heartbeatTimerRef.current);
      // Fire lần cuối khi rời trang
      if (activeLessonId && activeItem?.itemType === "lesson") {
        const currentWatched = videoPlayerRef.current?.getWatchedSeconds() ?? 0;
        const delta = currentWatched - lastHeartbeatWatchedRef.current;
        if (delta > 0) {
          EnrollmentService.heartbeat(courseId, activeLessonId, delta).catch(
            () => {},
          );
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId, courseId]);

  /* ── Navigation ── */
  const goTo = useCallback(
    (idx) => {
      const targetItem = flatItems[idx];
      const targetLessonId = getLessonId(targetItem);

      // Flush heartbeat bài hiện tại trước khi chuyển
      clearInterval(heartbeatTimerRef.current);
      sendHeartbeat();

      setActiveIdx(idx);
      setCurrentLesson(courseId, idx, targetLessonId);
    },
    [flatItems, getLessonId, courseId, setCurrentLesson, sendHeartbeat],
  );

  /* ── Đánh dấu done & persist lên server ── */
  const markCurrentDone = useCallback(async () => {
    if (!activeItem) return;

    if (activeItem.itemType === "lesson" && activeLessonId) {
      // Optimistic local update
      markLessonComplete(courseId, activeLessonId);
      setThresholdReached(true);

      try {
        const res = await EnrollmentService.completeLesson(
          courseId,
          activeLessonId,
        );
        if (res?.itemsProgress) {
          setItemsProgress(res.itemsProgress);
          setServerProgress(res.progress ?? serverProgress);
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
      if (quizId) {
        try {
          const res = await EnrollmentService.markQuizDone(courseId, quizId);
          if (res?.itemsProgress) {
            setItemsProgress(res.itemsProgress);
            updateItemsProgress(courseId, res.itemsProgress);
          }
        } catch {
          // Silent
        }
      }
    }
  }, [
    activeItem,
    activeLessonId,
    courseId,
    markLessonComplete,
    serverProgress,
    updateItemsProgress,
  ]);

  /* ── Video threshold callback (30%) ── */
  const handleVideoReachedThreshold = useCallback(() => {
    setThresholdReached(true);
    markCurrentDone();
  }, [markCurrentDone]);

  /* ── Next ── */
  const handleNext = useCallback(() => {
    const isDone = getServerItemStatus(activeLessonId) === "done";
    const isQuiz = activeItem?.itemType === "quiz";

    if (activeItem?.itemType === "lesson" && !thresholdReached && !isDone) {
      message.warning("Xem ít nhất 30% bài học để tiếp tục!");
      return;
    }

    markCurrentDone();

    if (activeIdx < flatItems.length - 1) {
      goTo(activeIdx + 1);
    } else {
      message.success("🎉 Chúc mừng! Bạn đã hoàn thành toàn bộ khóa học!");
    }
  }, [
    activeItem,
    activeLessonId,
    activeIdx,
    flatItems.length,
    thresholdReached,
    getServerItemStatus,
    markCurrentDone,
    goTo,
  ]);

  /* ── Derived state ── */
  const lessonItems = flatItems.filter((i) => i.itemType === "lesson");
  const completedLessonIds = useCourseStore
    .getState()
    .getCompletedLessonIds(courseId);
  const completedCount = itemsProgress.filter(
    (i) => i.itemType === "lesson" && i.status === "done",
  ).length;

  const progressPercent =
    serverProgress > 0
      ? serverProgress
      : lessonItems.length > 0
        ? Math.round((completedCount / lessonItems.length) * 100)
        : 0;

  const isCurrentDone =
    getServerItemStatus(activeLessonId) === "done" ||
    completedLessonIds.includes(activeLessonId);

  const canGoNext =
    activeItem?.itemType === "quiz" || isCurrentDone || thresholdReached;

  // initialWatched để VideoPlayer restore thời điểm xem
  const initialWatched = getServerWatchedSeconds(activeLessonId);

  // Build sidebar sections
  const sectionsWithIdx = [];
  let fc = 0;
  (course?.sections ?? []).forEach((sec) => {
    const mapped = (sec.items ?? []).map((item) => ({
      ...item,
      flatIdx: fc++,
    }));
    if (mapped.length) sectionsWithIdx.push({ ...sec, mappedItems: mapped });
  });

  if (loading) return <LoadingScreen />;
  if (!course) return null;

  // Derive owner/admin status
  const isOwner =
    !!user?._id &&
    (course?.instructorId?._id?.toString() === user._id?.toString() ||
      course?.instructorId?.toString() === user._id?.toString());
  const isAdmin = user?.role === "admin";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "#030712",
        color: "#fff",
      }}
    >
        <LearningHeader
          course={course}
          progressPercent={progressPercent}
          completed={completedCount}
          totalLessons={lessonItems.length}
          onBack={() => navigate(ROUTES.MY_COURSES)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onRate={() => setReviewModalOpen(true)}
        />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {sidebarOpen && (
          <LearningSidebar
            courseId={courseId}
            activeLessonId={activeLessonId}
            sectionsWithIdx={sectionsWithIdx}
            itemsProgress={itemsProgress}
            activeIdx={activeIdx}
            totalLessons={lessonItems.length}
            completedCount={completedCount}
            isInstructor={isOwner || isAdmin}
            onGoTo={(idx) => {
              // Kiểm tra lock từ server trước khi cho phép điều hướng
              const targetItem = flatItems[idx];
              const targetLessonId = getLessonId(targetItem);
              const status = getServerItemStatus(targetLessonId);
              if (status === "lock") {
                message.warning("Hoàn thành bài trước để mở khóa bài này!");
                return;
              }
              goTo(idx);
            }}
          />
        )}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {activeItem?.itemType === "quiz" ? (
            <QuizPlayer
              quiz={activeItem.itemId}
              courseId={courseId}
              onComplete={markCurrentDone}
              onNext={handleNext}
            />
          ) : (
            <VideoPlayer
              ref={videoPlayerRef}
              url={activeItem?.itemId?.videoUrl}
              lessonKey={activeIdx}
              initialWatched={initialWatched}
              threshold={COMPLETION_THRESHOLD}
              onReachedThreshold={handleVideoReachedThreshold}
              onEnded={handleNext}
            />
          )}
          {activeItem?.itemType !== "quiz" && (
            <LessonBottomBar
              activeIdx={activeIdx}
              flatItemsLength={flatItems.length}
              activeItem={activeItem}
              canGoNext={canGoNext}
              isCurrentDone={isCurrentDone}
              onPrev={() => goTo(Math.max(0, activeIdx - 1))}
              onNext={handleNext}
            />
          )}
        </div>
      </div>

      <ReviewModal
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        courseId={courseId}
        onReviewSuccess={() => {
          // Re-fetch reviews in the sidebar if it's open
          message.success("Review saved!");
        }}
      />
    </div>
  );
};

export default LearningPage;
