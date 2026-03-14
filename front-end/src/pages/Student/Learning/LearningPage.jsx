import {
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Typography, message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import LearningHeader from "../../../components/learning/LearningHeader";
import LearningSidebar from "../../../components/learning/LearningSidebar";
import QuizPlayer from "../../../components/learning/QuizPlayer";
import VideoPlayer from "../../../components/learning/VideoPlayer";

// Services & Store
import CourseService from "../../../services/api/CourseService";
import PaymentService from "../../../services/api/PaymentService";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";

const { Text, Title } = Typography;

/* ─── Loading Spinner ────────────────────────────────────────────────────── */
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

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    markLessonComplete,
    setCurrentLesson,
    lessonProgress,
    enrolledCourseIds,
  } = useCourseStore();

  const [course, setCourse] = useState(null);
  const [flatItems, setFlatItems] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // watched80Ref: Set<number> — flatIdx đã xem >= 80%
  const watched80Ref = useRef(new Set());
  // watched80Version: trigger sidebar re-render khi Set thay đổi
  const [watched80Version, setWatched80Version] = useState(0);

  /* ── Load course ── */
  useEffect(() => {
    if (!courseId) return;
    CourseService.getCourseDetail(courseId)
      .then(({ course: data, isEnrolled: serverEnrolled }) => {
        if (!data) {
          message.error("Không tìm thấy khóa học");
          navigate(ROUTES.MY_COURSES);
          return;
        }
        const hasEnrolled =
          enrolledCourseIds.includes(courseId) || serverEnrolled;
        if (!hasEnrolled) {
          message.warning(
            "Bạn chưa đăng ký khóa học này. Vui lòng mua để tiếp tục.",
          );
          navigate(`/courses/${courseId}`);
          return;
        }
        setCourse(data);
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
        const saved = lessonProgress[courseId]?.currentLesson;
        if (saved != null) setActiveIdx(saved);
      })
      .catch((err) => {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          message.warning("Bạn chưa đăng ký khóa học này.");
          navigate(`/courses/${courseId}`);
        } else {
          message.error("Không thể tải khóa học");
          navigate(ROUTES.MY_COURSES);
        }
      })
      .finally(() => setLoading(false));
  }, [courseId, enrolledCourseIds, navigate]); // lessonProgress không trong deps tránh loop

  /* ── Derived ── */
  const completed = lessonProgress[courseId]?.completedLessons ?? [];
  const lessonItems = flatItems.filter((i) => i.itemType === "lesson");
  const progressPercent =
    lessonItems.length > 0
      ? Math.round((completed.length / lessonItems.length) * 100)
      : 0;
  const activeItem = flatItems[activeIdx];

  /* ── goTo ── */
  const goTo = useCallback(
    (idx) => {
      setActiveIdx(idx);
      setCurrentLesson(courseId, idx);
    },
    [courseId, setCurrentLesson],
  );

  /* ── markCurrentAsComplete ── */
  const markCurrentAsComplete = useCallback(() => {
    if (!activeItem) return;
    if (activeItem.itemType === "lesson" || activeItem.itemType === "quiz") {
      markLessonComplete(courseId, activeIdx);
      // Sync to BE
      const lessonId = activeItem.itemId?._id ?? activeItem.itemId;
      if (lessonId && activeItem.itemType === "lesson") {
        PaymentService.completeLesson(courseId, lessonId).catch(() => {});
      }
    }
  }, [activeItem, activeIdx, courseId, markLessonComplete]);

  /* ── Video reached 80% ── */
  const handleVideoReached80 = useCallback(() => {
    watched80Ref.current.add(activeIdx);
    setWatched80Version((v) => v + 1);
    markCurrentAsComplete();
  }, [activeIdx, markCurrentAsComplete]);

  /* ── Next lesson ── */
  const handleNext = useCallback(() => {
    if (
      activeItem?.itemType === "lesson" &&
      !completed.includes(activeIdx) &&
      !watched80Ref.current.has(activeIdx)
    ) {
      message.warning("Xem ít nhất 80% bài học để tiếp tục!");
      return;
    }
    markCurrentAsComplete();
    if (activeIdx < flatItems.length - 1) {
      goTo(activeIdx + 1);
    } else {
      message.success("🎉 Chúc mừng hoàn thành toàn bộ khóa học!");
    }
  }, [
    activeItem,
    activeIdx,
    completed,
    flatItems.length,
    markCurrentAsComplete,
    goTo,
  ]);

  /* ── Build sidebar sections ── */
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

  const isCurrentDone = completed.includes(activeIdx);
  const canGoNext =
    activeItem?.itemType === "quiz" ||
    isCurrentDone ||
    watched80Ref.current.has(activeIdx);

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
      {/* Header */}
      <LearningHeader
        course={course}
        progressPercent={progressPercent}
        completed={completed.length}
        totalLessons={lessonItems.length}
        onBack={() => navigate(ROUTES.MY_COURSES)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
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

        {/* Content Area */}
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

          {/* Bottom bar — chỉ hiện cho video */}
          {activeItem?.itemType !== "quiz" && (
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
                  Bài {activeIdx + 1} / {flatItems.length}
                </Text>
                <Title level={5} style={{ color: "#fff", margin: 0 }}>
                  {activeItem?.title}
                </Title>
                {!canGoNext && (
                  <Text style={{ color: "#F59E0B", fontSize: 12 }}>
                    ⚠️ Cần xem ≥ 80% để mở khóa bài tiếp theo
                  </Text>
                )}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Button
                  icon={<LeftOutlined />}
                  size="large"
                  disabled={activeIdx === 0}
                  onClick={() => goTo(Math.max(0, activeIdx - 1))}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
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
                  {isCurrentDone
                    ? "Đã hoàn thành"
                    : canGoNext
                      ? "Hoàn thành & Tiếp"
                      : "Đang xem..."}
                </Button>
                <Button
                  icon={<RightOutlined />}
                  size="large"
                  disabled={activeIdx === flatItems.length - 1}
                  onClick={() =>
                    goTo(Math.min(flatItems.length - 1, activeIdx + 1))
                  }
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
