import {
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Typography, message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LearningHeader from "../../../components/learning/LearningHeader";
import LearningSidebar from "../../../components/learning/LearningSidebar";
import QuizPlayer from "../../../components/learning/QuizPlayer";
import VideoPlayer from "../../../components/learning/VideoPlayer";
import CourseService from "../../../services/api/CourseService";
import PaymentService from "../../../services/api/PaymentService";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";

const { Text, Title } = Typography;

/* ─── LoadingScreen ───────────────────────────────────────────────────────── */
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

/* ─── LessonBottomBar ─────────────────────────────────────────────────────── */
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
      <Text style={{ color: "#9CA3AF", fontSize: 13, display: "block", marginBottom: 2 }}>
        Lesson {activeIdx + 1} / {flatItemsLength}
      </Text>
      <Title level={5} style={{ color: "#fff", margin: 0 }}>
        {activeItem?.title}
      </Title>
      {!canGoNext && (
        <Text style={{ color: "#F59E0B", fontSize: 12 }}>
          ⚠️ Watch at least 80% to unlock the next lesson
        </Text>
      )}
    </div>

    <div style={{ display: "flex", gap: 12 }}>
      <Button
        icon={<LeftOutlined />}
        size="large"
        disabled={activeIdx === 0}
        onClick={onPrev}
        style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff" }}
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
          minWidth: 165,
          opacity: !canGoNext ? 0.65 : 1,
        }}
      >
        {isCurrentDone ? "Completed" : canGoNext ? "Complete & Continue" : "Watching..."}
      </Button>
      <Button
        icon={<RightOutlined />}
        size="large"
        disabled={activeIdx === flatItemsLength - 1}
        onClick={() =>
          onNext()}
        style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff" }}
      />
    </div>
  </div>
);

/* ─── LearningPage ────────────────────────────────────────────────────────── */
const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { markLessonComplete, setCurrentLesson, lessonProgress, enrolledCourseIds } =
    useCourseStore();

  const [course, setCourse] = useState(null);
  const [flatItems, setFlatItems] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Track lessons watched ≥ 80%
  const watched80Ref = useRef(new Set());
  const [watched80Version, setWatched80Version] = useState(0);

  /* ── Load course ── */
  useEffect(() => {
    if (!courseId) return;
    CourseService.getCourseDetail(courseId)
      .then(({ course: data, isEnrolled: serverEnrolled }) => {
        if (!data) {
          message.error("Course not found");
          navigate(ROUTES.MY_COURSES);
          return;
        }
        const hasEnrolled = enrolledCourseIds.includes(courseId) || serverEnrolled;
        if (!hasEnrolled) {
          message.warning("You are not enrolled in this course. Please purchase to continue.");
          navigate(`/courses/${courseId}`);
          return;
        }
        setCourse(data);
        const flat = [];
        (data.sections ?? []).forEach((sec) => {
          (sec.items ?? []).forEach((item) => {
            flat.push({ ...item, sectionTitle: sec.title, flatIdx: flat.length });
          });
        });
        setFlatItems(flat);
        const saved = lessonProgress[courseId]?.currentLesson;
        if (saved != null) setActiveIdx(saved);
      })
      .catch((err) => {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          message.warning("You are not enrolled in this course.");
          navigate(`/courses/${courseId}`);
        } else {
          message.error("Failed to load course");
          navigate(ROUTES.MY_COURSES);
        }
      })
      .finally(() => setLoading(false));
  }, [courseId, enrolledCourseIds, navigate]);

  const completed = lessonProgress[courseId]?.completedLessons ?? [];
  const lessonItems = flatItems.filter((i) => i.itemType === "lesson");
  const progressPercent =
    lessonItems.length > 0 ? Math.round((completed.length / lessonItems.length) * 100) : 0;
  const activeItem = flatItems[activeIdx];

  const goTo = useCallback(
    (idx) => {
      setActiveIdx(idx);
      setCurrentLesson(courseId, idx);
    },
    [courseId, setCurrentLesson],
  );

  const markCurrentAsComplete = useCallback(() => {
    if (!activeItem) return;
    if (activeItem.itemType === "lesson" || activeItem.itemType === "quiz") {
      markLessonComplete(courseId, activeIdx);
      const lessonId = activeItem.itemId?._id ?? activeItem.itemId;
      if (lessonId && activeItem.itemType === "lesson") {
        PaymentService.completeLesson(courseId, lessonId).catch(() => {});
      }
    }
  }, [activeItem, activeIdx, courseId, markLessonComplete]);

  const handleVideoReached80 = useCallback(() => {
    watched80Ref.current.add(activeIdx);
    setWatched80Version((v) => v + 1);
    markCurrentAsComplete();
  }, [activeIdx, markCurrentAsComplete]);

  const handleNext = useCallback(() => {
    if (
      activeItem?.itemType === "lesson" &&
      !completed.includes(activeIdx) &&
      !watched80Ref.current.has(activeIdx)
    ) {
      message.warning("Watch at least 80% of the lesson to continue!");
      return;
    }
    markCurrentAsComplete();
    if (activeIdx < flatItems.length - 1) {
      goTo(activeIdx + 1);
    } else {
      message.success("🎉 Congratulations! You have completed the entire course!");
    }
  }, [activeItem, activeIdx, completed, flatItems.length, markCurrentAsComplete, goTo]);

  // Build sidebar sections
  const sectionsWithIdx = [];
  let fc = 0;
  (course?.sections ?? []).forEach((sec) => {
    const mapped = (sec.items ?? []).map((item) => ({ ...item, flatIdx: fc++ }));
    if (mapped.length) sectionsWithIdx.push({ ...sec, mappedItems: mapped });
  });

  if (loading) return <LoadingScreen />;
  if (!course) return null;

  const isCurrentDone = completed.includes(activeIdx);
  const canGoNext =
    activeItem?.itemType === "quiz" || isCurrentDone || watched80Ref.current.has(activeIdx);

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
        completed={completed.length}
        totalLessons={lessonItems.length}
        onBack={() => navigate(ROUTES.MY_COURSES)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {sidebarOpen && (
          <LearningSidebar
            key={watched80Version}
            sectionsWithIdx={sectionsWithIdx}
            completed={completed}
            watched80={watched80Ref.current}
            activeIdx={activeIdx}
            totalLessons={lessonItems.length}
            onGoTo={goTo}
          />
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {activeItem?.itemType === "quiz" ? (
            <QuizPlayer
              quiz={activeItem.itemId}
              courseId={courseId}
              onComplete={markCurrentAsComplete}
              onNext={handleNext}
            />
          ) : (
            <VideoPlayer
              url={activeItem?.itemId?.videoUrl}
              lessonKey={activeIdx}
              onReached80={handleVideoReached80}
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
    </div>
  );
};

export default LearningPage;
