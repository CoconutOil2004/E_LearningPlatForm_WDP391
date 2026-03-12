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
import { Button, Card, message, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseService from "../../../services/api/CourseService";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";

const { Text, Title } = Typography;

const fmtTime = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60),
    sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// ─── Quiz Player ─────────────────────────────────────────────────────────────
const QuizPlayer = ({ quiz, courseId, onComplete }) => {
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
      if (answers[qi] === q.correctAnswerIndex) correct++;
    });
    const sc =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(sc);
    setSubmitted(true);
    saveQuizScore(courseId, sc);
    if (sc >= 70) message.success(`Chúc mừng! Điểm của bạn: ${sc}/100`);
    else message.warning(`Điểm của bạn: ${sc}/100. Hãy thử lại!`);
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
        <Button type="primary" onClick={onComplete}>
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
              style={{ fontSize: 14 }}
            >
              {score}/100
            </Tag>
          )}
        </div>

        {questions.map((q, qi) => {
          const userAns = answers[qi];
          const isCorrect = submitted && userAns === q.correctAnswerIndex;
          const isWrong =
            submitted &&
            userAns !== undefined &&
            userAns !== q.correctAnswerIndex;
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
                style={{ color: "#fff", display: "block", marginBottom: 12 }}
              >
                {qi + 1}. {q.question}
              </Text>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(q.options ?? []).map((opt, oi) => {
                  const isSelected = userAns === oi;
                  const isCorrectOpt = submitted && oi === q.correctAnswerIndex;
                  return (
                    <div
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      style={{
                        padding: "10px 14px",
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
                        transition: "all 0.2s",
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
            style={{
              borderRadius: 12,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              border: "none",
            }}
          >
            Nộp bài
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            block
            onClick={onComplete}
            style={{ borderRadius: 12, background: "#10b981", border: "none" }}
          >
            Tiếp tục
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    markLessonComplete,
    setCurrentLesson,
    lessonProgress,
    saveQuizScore,
    enrolledCourseIds, // BƯỚC 1: Lấy enrolledCourseIds từ store
  } = useCourseStore();

  const [course, setCourse] = useState(null);
  const [flatItems, setFlatItems] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    CourseService.getCourseDetail(courseId)
      // Đổi tên isEnrolled của server thành serverEnrolled để dễ phân biệt
      .then(({ course: data, isEnrolled: serverEnrolled }) => {
        if (!data) {
          message.error("Không tìm thấy khóa học");
          navigate(ROUTES.MY_COURSES);
          return;
        }

        // BƯỚC 2: Kiểm tra enroll dựa vào store HOẶC server
        const hasEnrolled =
          enrolledCourseIds.includes(courseId) || serverEnrolled;

        // Nếu chưa enroll → redirect về trang mua
        if (!hasEnrolled) {
          message.warning(
            "Bạn chưa đăng ký khóa học này. Vui lòng mua để tiếp tục.",
          );
          navigate(`/courses/${courseId}`);
          return;
        }

        setCourse(data);
        // Build flat list of ALL items (lessons + quizzes)
        const flat = [];
        for (const sec of data.sections ?? []) {
          for (const item of sec.items ?? []) {
            flat.push({
              ...item,
              sectionTitle: sec.title,
              flatIdx: flat.length,
            });
          }
        }
        setFlatItems(flat);
        const saved = lessonProgress[courseId]?.currentLesson;
        if (saved != null) setActiveIdx(saved);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403 || status === 401) {
          // BE cũ trả 403 → student chưa mua → redirect về trang detail để mua
          message.warning(
            "Bạn chưa đăng ký khóa học này. Vui lòng mua để tiếp tục.",
          );
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
  const progress =
    lessonItems.length > 0
      ? Math.round((completed.length / lessonItems.length) * 100)
      : 0;
  const activeItem = flatItems[activeIdx];

  const goTo = (idx) => {
    setActiveIdx(idx);
    setCurrentLesson(courseId, idx);
  };

  const handleComplete = () => {
    if (activeItem?.itemType === "lesson") {
      // mark lesson complete by flat index
      markLessonComplete(courseId, activeIdx);
    }
    if (activeIdx < flatItems.length - 1) goTo(activeIdx + 1);
    else message.success("🎉 Bạn đã hoàn thành khóa học!");
  };

  // Build sections with flat indexes
  const sectionsWithIdx = [];
  let fc = 0;
  for (const sec of course?.sections ?? []) {
    const mapped = [];
    for (const item of sec.items ?? []) {
      mapped.push({ ...item, flatIdx: fc++ });
    }
    if (mapped.length) sectionsWithIdx.push({ ...sec, mappedItems: mapped });
  }

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
            border: "2px solid #667eea",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
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
      {/* ── Top bar ─── */}
      <header
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTES.MY_COURSES)}
            style={{ color: "#fff" }}
          />
          <div>
            <Text
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                display: "block",
              }}
            >
              {course.category?.name}
            </Text>
            <Text
              strong
              style={{
                color: "#fff",
                fontSize: 13,
                maxWidth: 300,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {course.title}
            </Text>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 140,
                height: 6,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#10b981",
                  borderRadius: 3,
                  transition: "width 0.4s",
                }}
              />
            </div>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              {progress}%
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

      {/* ── Body ─── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Sidebar LEFT ─── */}
        {sidebarOpen && (
          <div
            style={{
              width: 300,
              flexShrink: 0,
              background: "#111827",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "block",
                }}
              >
                Nội dung khóa học
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                {completed.length}/{lessonItems.length} bài hoàn thành
              </Text>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {sectionsWithIdx.map((sec, si) => (
                <div
                  key={sec._id || si}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      {sec.title}
                    </Text>
                  </div>
                  {sec.mappedItems.map((item) => {
                    const isDone =
                      item.itemType === "lesson" &&
                      completed.includes(item.flatIdx);
                    const isActive = item.flatIdx === activeIdx;
                    const isQuiz = item.itemType === "quiz";
                    return (
                      <div
                        key={item._id || item.flatIdx}
                        onClick={() => goTo(item.flatIdx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 16px",
                          cursor: "pointer",
                          background: isActive
                            ? "rgba(102,126,234,0.15)"
                            : "transparent",
                          borderLeft: isActive
                            ? "2px solid #667eea"
                            : "2px solid transparent",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: 10,
                            fontWeight: 700,
                            background: isDone
                              ? "#10b981"
                              : isQuiz
                                ? "rgba(139,92,246,0.2)"
                                : isActive
                                  ? "#667eea"
                                  : "rgba(255,255,255,0.08)",
                            color:
                              isDone || isActive
                                ? "#fff"
                                : isQuiz
                                  ? "#8B5CF6"
                                  : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {isDone ? (
                            <CheckCircleFilled style={{ fontSize: 12 }} />
                          ) : isQuiz ? (
                            <QuestionCircleOutlined style={{ fontSize: 12 }} />
                          ) : (
                            item.flatIdx + 1
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              color: isActive
                                ? "#fff"
                                : "rgba(255,255,255,0.6)",
                              fontSize: 12,
                              fontWeight: isActive ? 600 : 400,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.title}
                          </Text>
                          {item.itemId?.duration > 0 && (
                            <Text
                              style={{
                                color: "rgba(255,255,255,0.3)",
                                fontSize: 10,
                              }}
                            >
                              {fmtTime(item.itemId.duration)}
                            </Text>
                          )}
                          {isQuiz && (
                            <Text style={{ color: "#8B5CF6", fontSize: 10 }}>
                              Quiz
                            </Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content area RIGHT */}
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
              onComplete={handleComplete}
            />
          ) : activeItem?.itemId?.videoUrl ? (
            <video
              key={activeItem.itemId._id ?? activeIdx}
              src={activeItem.itemId.videoUrl}
              controls
              style={{
                flex: 1,
                width: "100%",
                background: "#000",
                objectFit: "contain",
              }}
              onEnded={handleComplete}
            />
          ) : (
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
                {activeItem
                  ? "Bài học này chưa có video"
                  : "Chọn bài học để bắt đầu"}
              </Text>
            </div>
          )}

          {/* Controls */}
          {activeItem && activeItem.itemType !== "quiz" && (
            <div
              style={{
                padding: "12px 24px",
                background: "#1f2937",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                  {activeIdx + 1} / {flatItems.length}
                </Text>
                <Title level={5} style={{ color: "#fff", margin: 0 }}>
                  {activeItem.title}
                </Title>
                {activeItem.itemId?.duration > 0 && (
                  <Text
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  >
                    {fmtTime(activeItem.itemId.duration)}
                  </Text>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  icon={<LeftOutlined />}
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
                  onClick={handleComplete}
                  style={{
                    background: completed.includes(activeIdx)
                      ? "#10b981"
                      : "linear-gradient(135deg,#667eea,#764ba2)",
                    border: "none",
                    borderRadius: 10,
                  }}
                  icon={
                    completed.includes(activeIdx) ? (
                      <CheckCircleOutlined />
                    ) : null
                  }
                >
                  {completed.includes(activeIdx)
                    ? "Đã hoàn thành"
                    : activeIdx === flatItems.length - 1
                      ? "Hoàn thành khóa học"
                      : "Xong & tiếp theo"}
                </Button>
                <Button
                  icon={<RightOutlined />}
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
