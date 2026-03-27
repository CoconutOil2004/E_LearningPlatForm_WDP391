import {
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LearningHeader from "../../../components/learning/LearningHeader";
import LearningSidebar from "../../../components/learning/LearningSidebar";
import QuizPlayer from "../../../components/learning/QuizPlayer";
import VideoPlayer from "../../../components/learning/VideoPlayer";
import { useCourseLoader } from "../../../hooks/useCourseLoader";
import { useHeartbeat } from "../../../hooks/useHeartbeat";
import { useLessonNavigation } from "../../../hooks/useLessonNavigation";
import useAuthStore from "../../../store/slices/authStore";
import { ROUTES } from "../../../utils/constants";

const { Text, Title } = Typography;

// ─── LoadingScreen ────────────────────────────────────────────────────────────
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

// ─── LessonBottomBar ──────────────────────────────────────────────────────────
/**
 * Props:
 *  activeIdx       – index bài hiện tại
 *  flatItemsLength – tổng số item
 *  activeItem      – item object
 *  canComplete     – true khi đã xem đủ 30% (hiện nút Complete)
 *  isUserDone      – true khi user đã bấm Complete ở bài này (hiện Completed disabled)
 *  isLastLesson    – bài cuối → label "Complete Course"
 *  onComplete      – nút Complete & Continue / Complete Course
 */
const LessonBottomBar = ({
  activeIdx,
  flatItemsLength,
  activeItem,
  canComplete,
  isUserDone,
  isLastLesson,
  onComplete,
}) => {
  const isLesson = activeItem?.itemType === "lesson";
  const hasVideo = !!activeItem?.itemId?.videoUrl;

  // Hiện nút Complete khi: không phải lesson có video, HOẶC đã xem đủ 30%, HOẶC đã done
  const showCompleteBtn = !isLesson || !hasVideo || canComplete || isUserDone;

  // Label nút
  const btnLabel = isUserDone
    ? "Completed"
    : isLastLesson
      ? "Complete Course"
      : "Complete & Continue";

  // Màu nút
  const btnBg = isUserDone
    ? "#10b981"
    : isLastLesson
      ? "linear-gradient(135deg,#f59e0b,#ef4444)"
      : "linear-gradient(135deg,#667eea,#764ba2)";

  return (
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
      {/* Thông tin bài */}
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
        {isLesson && hasVideo && !canComplete && !isUserDone && (
          <Text style={{ color: "#F59E0B", fontSize: 12 }}>
            ⏱ Watch at least 30% of the video to unlock
          </Text>
        )}
      </div>

      {/* Nút hành động */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* Nút Complete — chỉ hiện khi đủ điều kiện */}
        {showCompleteBtn && (
          <Button
            type="primary"
            size="large"
            onClick={onComplete}
            disabled={isUserDone}
            icon={isUserDone ? <CheckCircleOutlined /> : null}
            style={{
              background: btnBg,
              border: "none",
              minWidth: 170,
              opacity: isUserDone ? 0.85 : 1,
            }}
          >
            {btnLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── LearningPage ─────────────────────────────────────────────────────────────
const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const videoPlayerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    course,
    flatItems,
    activeIdx,
    setActiveIdx,
    itemsProgress,
    setItemsProgress,
    serverProgress,
    setServerProgress,
    loading,
  } = useCourseLoader(courseId);

  // watchedSeconds của bài đang học (để init heartbeat ref)
  const activeItemForHook = flatItems[activeIdx];
  const activeItemWatchedSecs =
    itemsProgress.find(
      (i) =>
        i.itemId?.toString() ===
        (activeItemForHook?.itemId?._id?.toString() ??
          activeItemForHook?.itemId?.toString()),
    )?.watchedSeconds ?? 0;

  const {
    activeItem,
    activeLessonId,
    canComplete,
    userCompletedIdx,
    handleSidebarGoTo,
    handleComplete,
    markCurrentDone,
    handleVideoReachedThreshold,
  } = useLessonNavigation({
    courseId,
    flatItems,
    activeIdx,
    setActiveIdx,
    itemsProgress,
    serverProgress,
    onProgressUpdate: (items, progress) => {
      setItemsProgress(items);
      if (progress !== undefined) setServerProgress(progress);
    },
    onFlushHeartbeat: () => heartbeatFlush(),
  });

  // ── Heartbeat ──────────────────────────────────────────────────────────
  const { flush: heartbeatFlush } = useHeartbeat({
    courseId,
    activeLessonId,
    activeItemType: activeItem?.itemType,
    activeItemWatchedSecs,
    videoPlayerRef,
    serverProgress,
    // Khi BE heartbeat mark done → mở khóa nút Complete ngay
    onDone: () => handleVideoReachedThreshold(),
    onProgressUpdate: (items, progress) => {
      setItemsProgress(items);
      if (progress !== undefined) setServerProgress(progress);
    },
  });

  // ── Derived state ──────────────────────────────────────────────────────
  const lessonItems = flatItems.filter((i) => i.itemType === "lesson");
  const completedCount = itemsProgress.filter(
    (i) => i.itemType === "lesson" && i.status === "done",
  ).length;
  const progressPercent =
    serverProgress > 0
      ? serverProgress
      : lessonItems.length > 0
        ? Math.round((completedCount / lessonItems.length) * 100)
        : 0;

  const sectionsWithIdx = buildSectionsWithIdx(
    course?.sections ?? [],
    flatItems,
  );

  const userId = user?._id || user?.id;
  const isOwner =
    !!userId &&
    (course?.instructorId?._id?.toString() === userId.toString() ||
      course?.instructorId?.toString() === userId.toString());
  const isAdmin = user?.role === "admin";

  // isUserDone: user đã bấm Complete ở bài này trong session hiện tại
  const isUserDone = userCompletedIdx === activeIdx;

  const isLastLesson = activeIdx === flatItems.length - 1;

  // ── Render ────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (!course) return null;

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
            onGoTo={handleSidebarGoTo}
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
              onNext={handleComplete}
            />
          ) : (
            <VideoPlayer
              ref={videoPlayerRef}
              url={activeItem?.itemId?.videoUrl}
              lessonKey={activeIdx}
              initialWatched={activeItemWatchedSecs}
              thresholdPercent={0.3}
              onReachedThreshold={handleVideoReachedThreshold}
              onEnded={handleVideoReachedThreshold}
              onTimeUpdate={undefined}
            />
          )}

          {activeItem?.itemType !== "quiz" && (
            <LessonBottomBar
              activeIdx={activeIdx}
              flatItemsLength={flatItems.length}
              activeItem={activeItem}
              canComplete={canComplete}
              isUserDone={isUserDone}
              isLastLesson={isLastLesson}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function buildSectionsWithIdx(sections, flatItems) {
  let fc = 0;
  return sections
    .map((sec) => {
      const mappedItems = (sec.items ?? []).map((item) => ({
        ...item,
        flatIdx: fc++,
      }));
      return mappedItems.length ? { ...sec, mappedItems } : null;
    })
    .filter(Boolean);
}
