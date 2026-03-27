import {
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
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

// ─── Sub-components ──────────────────────────────────────────────────────────
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
          ⚠️ Watch at least 30% to unlock the next lesson
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
          ? "Completed"
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

  const activeItemForHook = flatItems[activeIdx];
  const activeItemWatchedSecs =
    itemsProgress.find(
      (i) =>
        i.itemId?.toString() ===
        (activeItemForHook?.itemId?._id?.toString() ??
          activeItemForHook?.itemId?.toString()),
    )?.watchedSeconds ?? 0;

  const {
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
  } = useLessonNavigation({
    courseId,
    flatItems,
    activeIdx,
    setActiveIdx,
    itemsProgress,
    serverProgress,
    onProgressUpdate: (items, progress, completed) => {
      setItemsProgress(items);
      if (progress !== undefined) setServerProgress(progress);
    },
    onFlushHeartbeat: () => heartbeatFlush(),
    onTimerClear: () => clearInterval(heartbeatTimer.current),
  });

  // ── 3. Heartbeat tracking ─────────────────────────────────────────────────
  const { flush: heartbeatFlush, timerRef: heartbeatTimer } = useHeartbeat({
    courseId,
    activeLessonId,
    activeItemType: activeItem?.itemType,
    activeItemWatchedSecs,
    videoPlayerRef,
    serverProgress,
    onDone: () => setThresholdReached(true),
    onProgressUpdate: (items, progress, completed) => {
      setItemsProgress(items);
      if (progress !== undefined) setServerProgress(progress);
    },
  });

  // ── 4. Derived state cho render ───────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
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
              onNext={handleNext}
            />
          ) : (
            <VideoPlayer
              ref={videoPlayerRef}
              url={activeItem?.itemId?.videoUrl}
              lessonKey={activeIdx}
              initialWatched={activeItemWatchedSecs}
              threshold={0.3}
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
              onPrev={handlePrev}
              onNext={() => handleNext(true)}
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
