import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  LeftOutlined,
  MenuOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Progress as AntProgress,
  Button,
  Card,
  message,
  Space,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player"; // <-- Thư viện Video tối ưu
import { useNavigate, useParams } from "react-router-dom";
import CourseService from "../../../services/api/CourseService";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";

const { Text, Title } = Typography;

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtTime = (s) => {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/* ─── Quiz Player (Giữ nguyên UI, tối ưu Logic & Fix data type) ────────── */
const QuizPlayer = ({ quiz, courseId, onComplete, onNext }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { saveQuizScore } = useCourseStore();

  const questions = quiz?.questions ?? [];

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, qi) => {
      // FIX: Ép kiểu correctAnswer từ string sang number để so sánh
      if (answers[qi] === parseInt(q.correctAnswer, 10)) correct++;
    });

    const sc =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(sc);
    setSubmitted(true);
    saveQuizScore(courseId, sc);

    // Auto mark as complete if pass
    if (sc >= 70) {
      message.success(`Chúc mừng! Điểm của bạn: ${sc}/100`);
      onComplete(); // Tự động đánh dấu hoàn thành lesson này trên store
    } else {
      message.warning(
        `Điểm của bạn: ${sc}/100. Hãy thử lại để đạt ít nhất 70 điểm!`,
      );
    }
  };

  if (questions.length === 0)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#fff",
          gap: 12,
        }}
      >
        <QuestionCircleOutlined style={{ fontSize: 48, opacity: 0.5 }} />
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>
          Quiz này chưa có câu hỏi
        </Text>
        <Button
          type="primary"
          onClick={() => {
            onComplete();
            onNext();
          }}
        >
          Tiếp tục
        </Button>
      </div>
    );

  return (
    <div
      style={{ flex: 1, overflowY: "auto", padding: 32, background: "#111827" }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            {quiz.title}
          </Title>
          {submitted && (
            <Tag
              color={score >= 70 ? "success" : "error"}
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              Score: {score}/100
            </Tag>
          )}
        </div>

        {questions.map((q, qi) => {
          const userAns = answers[qi];
          const correctIdx = parseInt(q.correctAnswer, 10); // Đã ép kiểu
          const isCorrect = submitted && userAns === correctIdx;
          const isWrong =
            submitted && userAns !== undefined && userAns !== correctIdx;

          return (
            <Card
              key={qi}
              style={{
                marginBottom: 16,
                borderRadius: 12,
                border: submitted
                  ? isCorrect
                    ? "1.5px solid #10b981"
                    : isWrong
                      ? "1.5px solid #ef4444"
                      : "1.5px solid #374151"
                  : "1.5px solid #374151",
                background: "#1f2937",
              }}
            >
              <Text
                strong
                style={{
                  color: "#fff",
                  display: "block",
                  marginBottom: 16,
                  fontSize: 15,
                }}
              >
                {qi + 1}. {q.text} {/* SỬA THÀNH q.text theo JSON */}
              </Text>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {(q.options ?? []).map((opt, oi) => {
                  const isSelected = userAns === oi;
                  const isCorrectOpt = submitted && oi === correctIdx;

                  return (
                    <div
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        cursor: submitted ? "default" : "pointer",
                        background: isCorrectOpt
                          ? "rgba(16,185,129,0.2)"
                          : isSelected && submitted
                            ? "rgba(239,68,68,0.2)"
                            : isSelected
                              ? "rgba(99,102,241,0.2)"
                              : "rgba(255,255,255,0.05)",
                        border: isCorrectOpt
                          ? "1px solid #10b981"
                          : isSelected
                            ? "1px solid #6366f1"
                            : "1px solid transparent",
                        color: "#e5e7eb",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {!submitted ? (
          <Button
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            style={{
              borderRadius: 12,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              border: "none",
              marginTop: 8,
            }}
          >
            Nộp bài
          </Button>
        ) : (
          <Space
            style={{ width: "100%", marginTop: 8 }}
            direction="vertical"
            size={12}
          >
            {score < 70 && (
              <Button
                size="large"
                block
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                style={{
                  borderRadius: 12,
                  background: "transparent",
                  color: "#fff",
                  borderColor: "#4B5563",
                }}
              >
                Làm lại
              </Button>
            )}
            <Button
              type="primary"
              size="large"
              block
              onClick={onNext}
              style={{
                borderRadius: 12,
                background: "#10b981",
                border: "none",
              }}
            >
              Bài tiếp theo
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
};

/* ─── Video Component có Tracking bằng ReactPlayer ──────────────────────── */
const TrackedVideoPlayer = ({ url, onComplete, onEnded }) => {
  const playerRef = useRef(null);

  const handleProgress = (state) => {
    // Nếu người dùng xem được 90% video -> Đánh dấu hoàn thành tự động
    if (state.played >= 0.9) {
      onComplete();
    }
  };

  if (!url) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
        }}
      >
        <PlayCircleOutlined
          style={{
            fontSize: 48,
            color: "rgba(255,255,255,0.2)",
            marginBottom: 12,
          }}
        />
        <Text style={{ color: "rgba(255,255,255,0.5)" }}>
          Bài học này chưa có video
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        controls
        playing={true} // Auto play
        onProgress={handleProgress}
        onEnded={onEnded} // Hết video thì next hoặc báo xong
        config={{ file: { attributes: { controlsList: "nodownload" } } }} // Chống tải lậu cơ bản
      />
    </div>
  );
};

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

  // Khởi tạo Data
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
  }, [courseId, enrolledCourseIds, navigate, lessonProgress]);

  const completed = lessonProgress[courseId]?.completedLessons ?? [];
  const lessonItems = flatItems.filter((i) => i.itemType === "lesson");
  const progressPercent =
    lessonItems.length > 0
      ? Math.round((completed.length / lessonItems.length) * 100)
      : 0;
  const activeItem = flatItems[activeIdx];

  const goTo = (idx) => {
    setActiveIdx(idx);
    setCurrentLesson(courseId, idx);
  };

  const markCurrentAsComplete = () => {
    if (activeItem?.itemType === "lesson" || activeItem?.itemType === "quiz") {
      markLessonComplete(courseId, activeIdx);
    }
  };

  const handleNext = () => {
    markCurrentAsComplete();
    if (activeIdx < flatItems.length - 1) {
      goTo(activeIdx + 1);
    } else {
      message.success("🎉 Chúc mừng bạn đã hoàn thành toàn bộ khóa học!");
    }
  };

  // Build Layout Data
  const sectionsWithIdx = [];
  let fc = 0;
  (course?.sections ?? []).forEach((sec) => {
    const mapped = (sec.items ?? []).map((item) => ({
      ...item,
      flatIdx: fc++,
    }));
    if (mapped.length) sectionsWithIdx.push({ ...sec, mappedItems: mapped });
  });

  if (loading)
    return (
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
      </div>
    );

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
      {/* ── Header ── */}
      <header
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
          background: "#111827",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTES.MY_COURSES)}
            style={{ color: "#fff" }}
          />
          <div>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                display: "block",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {course.category?.name}
            </Text>
            <Title
              level={5}
              style={{
                color: "#fff",
                margin: 0,
                maxWidth: 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {course.title}
            </Title>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: 200,
            }}
          >
            <AntProgress
              percent={progressPercent}
              strokeColor="#10b981"
              trailColor="rgba(255,255,255,0.1)"
              showInfo={false}
              style={{ flex: 1, margin: 0 }}
            />
            <Text style={{ color: "#9CA3AF", fontSize: 13, minWidth: 40 }}>
              {progressPercent}%
            </Text>
          </div>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ color: "#fff" }}
          />
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div
            style={{
              width: 320,
              flexShrink: 0,
              background: "#111827",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Text strong style={{ color: "#fff", fontSize: 14 }}>
                Nội dung khóa học
              </Text>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 13,
                  display: "block",
                  marginTop: 4,
                }}
              >
                Đã hoàn thành {completed.length}/{lessonItems.length} bài học
              </Text>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {sectionsWithIdx.map((sec, si) => (
                <div key={sec._id || si}>
                  <div
                    style={{
                      padding: "12px 20px",
                      background: "#1F2937",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <Text strong style={{ color: "#D1D5DB", fontSize: 13 }}>
                      {sec.title}
                    </Text>
                  </div>
                  {sec.mappedItems.map((item) => {
                    const isDone = completed.includes(item.flatIdx);
                    const isActive = item.flatIdx === activeIdx;
                    const isQuiz = item.itemType === "quiz";

                    return (
                      <div
                        key={item._id || item.flatIdx}
                        onClick={() => goTo(item.flatIdx)}
                        style={{
                          display: "flex",
                          gap: 12,
                          padding: "12px 20px",
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(99,102,241,0.15)"
                            : "transparent",
                          borderLeft: isActive
                            ? "3px solid #6366f1"
                            : "3px solid transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.02)",
                          transition: "background 0.2s",
                        }}
                      >
                        <div
                          style={{
                            marginTop: 2,
                            color: isDone
                              ? "#10b981"
                              : isActive
                                ? "#6366f1"
                                : "#6B7280",
                          }}
                        >
                          {isDone ? (
                            <CheckCircleFilled />
                          ) : isQuiz ? (
                            <QuestionCircleOutlined />
                          ) : (
                            <PlayCircleOutlined />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              color: isActive ? "#fff" : "#D1D5DB",
                              fontSize: 13,
                              fontWeight: isActive ? 500 : 400,
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            {item.title}
                          </Text>
                          <Space size={12}>
                            {item.itemId?.duration > 0 && (
                              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                                {fmtTime(item.itemId.duration)}
                              </Text>
                            )}
                            {isQuiz && (
                              <Tag
                                color="purple"
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  lineHeight: "16px",
                                  border: "none",
                                }}
                              >
                                Quiz
                              </Tag>
                            )}
                          </Space>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Main Viewer */}
          {activeItem?.itemType === "quiz" ? (
            <QuizPlayer
              quiz={activeItem.itemId}
              courseId={courseId}
              onComplete={markCurrentAsComplete}
              onNext={handleNext}
            />
          ) : (
            <TrackedVideoPlayer
              url={activeItem?.itemId?.videoUrl}
              onComplete={markCurrentAsComplete}
              onEnded={handleNext}
            />
          )}

          {/* Bottom Bar (Only for video to show manual controls) */}
          {activeItem?.itemType !== "quiz" && (
            <div
              style={{
                padding: "16px 24px",
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
                    marginBottom: 4,
                  }}
                >
                  Bài {activeIdx + 1} / {flatItems.length}
                </Text>
                <Title level={5} style={{ color: "#fff", margin: 0 }}>
                  {activeItem?.title}
                </Title>
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
                  style={{
                    background: completed.includes(activeIdx)
                      ? "#10b981"
                      : "linear-gradient(135deg,#667eea,#764ba2)",
                    border: "none",
                    minWidth: 140,
                  }}
                  icon={
                    completed.includes(activeIdx) ? (
                      <CheckCircleOutlined />
                    ) : null
                  }
                >
                  {completed.includes(activeIdx)
                    ? "Đã hoàn thành"
                    : "Hoàn thành & Tiếp"}
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
