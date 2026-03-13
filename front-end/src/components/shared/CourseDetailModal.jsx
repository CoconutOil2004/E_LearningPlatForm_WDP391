import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Col,
  Collapse,
  Divider,
  Modal,
  Progress,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmtDuration = (s) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const fmtShort = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

const STATUS_STYLE = {
  draft: { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB", label: "Draft" },
  pending: {
    bg: "#FEF3C7",
    color: "#D97706",
    border: "#FDE68A",
    label: "In Review",
  },
  published: {
    bg: "#D1FAE5",
    color: "#059669",
    border: "#A7F3D0",
    label: "Published",
  },
  rejected: {
    bg: "#FEE2E2",
    color: "#DC2626",
    border: "#FECACA",
    label: "Rejected",
  },
  archived: {
    bg: "#E5E7EB",
    color: "#6B7280",
    border: "#D1D5DB",
    label: "Archived",
  },
};

/* ─── VideoPlayer ─────────────────────────────────────────────────────────── */
const VideoPlayer = ({ url, title }) => {
  const [playing, setPlaying] = useState(false);

  if (!url)
    return (
      <div
        style={{
          background: "#1f2937",
          borderRadius: 10,
          height: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        <PauseCircleOutlined style={{ fontSize: 36 }} />
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          No video uploaded
        </Text>
      </div>
    );

  if (playing)
    return (
      <video
        src={url}
        controls
        autoPlay
        style={{
          width: "100%",
          borderRadius: 10,
          maxHeight: 280,
          background: "#000",
        }}
      />
    );

  return (
    <div
      onClick={() => setPlaying(true)}
      style={{
        position: "relative",
        background: "#111827",
        borderRadius: 10,
        height: 200,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.3)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(139,92,246,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(139,92,246,0.5)",
          }}
        >
          <PlayCircleOutlined style={{ fontSize: 28, color: "#fff" }} />
        </div>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
          {title}
        </Text>
      </div>
    </div>
  );
};

/* ─── QuizViewer ──────────────────────────────────────────────────────────── */
const QuizViewer = ({ quiz }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const questions = quiz?.questions ?? [];

  const score = submitted
    ? Math.round(
        (questions.filter((q, i) => answers[i] === q.correctAnswerIndex)
          .length /
          Math.max(questions.length, 1)) *
          100,
      )
    : null;

  if (questions.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF" }}>
        <QuestionCircleOutlined
          style={{ fontSize: 28, display: "block", marginBottom: 8 }}
        />
        <Text type="secondary">No questions in this quiz</Text>
      </div>
    );

  return (
    <div>
      {submitted && (
        <div
          style={{
            background: score >= 70 ? "#D1FAE5" : "#FEE2E2",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {score >= 70 ? (
            <CheckCircleOutlined style={{ color: "#059669", fontSize: 20 }} />
          ) : (
            <CloseCircleOutlined style={{ color: "#DC2626", fontSize: 20 }} />
          )}
          <div>
            <Text strong style={{ color: score >= 70 ? "#065F46" : "#991B1B" }}>
              Score: {score}/100
            </Text>
            <Progress
              percent={score}
              size="small"
              showInfo={false}
              strokeColor={score >= 70 ? "#059669" : "#DC2626"}
              style={{ marginBottom: 0, width: 200 }}
            />
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Retry
            </Text>
          </div>
        </div>
      )}

      {questions.map((q, qi) => {
        const selected = answers[qi];
        const isCorrect = selected === q.correctAnswerIndex;

        return (
          <div
            key={qi}
            style={{
              marginBottom: 20,
              background: "#FAFAFA",
              borderRadius: 10,
              padding: "14px 16px",
              border: submitted
                ? isCorrect
                  ? "1px solid #A7F3D0"
                  : "1px solid #FECACA"
                : "1px solid #E5E7EB",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 12,
                alignItems: "flex-start",
              }}
            >
              <Badge count={qi + 1} style={{ background: "#8B5CF6" }} />
              <Text strong style={{ flex: 1, fontSize: 14 }}>
                {q.questionText}
              </Text>
              {submitted &&
                (isCorrect ? (
                  <CheckCircleOutlined
                    style={{ color: "#059669", fontSize: 16, flexShrink: 0 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ color: "#DC2626", fontSize: 16, flexShrink: 0 }}
                  />
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(q.options ?? []).map((opt, oi) => {
                const isSelected = selected === oi;
                const isCorrectAnswer = q.correctAnswerIndex === oi;

                let bg = "#fff",
                  border = "#E5E7EB",
                  color = "#374151";
                if (submitted) {
                  if (isCorrectAnswer) {
                    bg = "#D1FAE5";
                    border = "#6EE7B7";
                    color = "#065F46";
                  } else if (isSelected && !isCorrectAnswer) {
                    bg = "#FEE2E2";
                    border = "#FCA5A5";
                    color = "#991B1B";
                  }
                } else if (isSelected) {
                  bg = "#EDE9FE";
                  border = "#8B5CF6";
                  color = "#5B21B6";
                }

                return (
                  <div
                    key={oi}
                    onClick={() =>
                      !submitted &&
                      setAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${border}`,
                      background: bg,
                      color,
                      cursor: submitted ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.15s",
                      fontWeight: submitted && isCorrectAnswer ? 600 : 400,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected || (submitted && isCorrectAnswer) ? border : "#D1D5DB"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        color,
                      }}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <Text style={{ color, flex: 1 }}>{opt}</Text>
                    {submitted && isCorrectAnswer && (
                      <CheckCircleOutlined style={{ color: "#059669" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!submitted && (
        <div
          onClick={() => Object.keys(answers).length > 0 && setSubmitted(true)}
          style={{
            textAlign: "center",
            padding: "10px 0",
            background: Object.keys(answers).length > 0 ? "#8B5CF6" : "#E5E7EB",
            borderRadius: 10,
            cursor: Object.keys(answers).length > 0 ? "pointer" : "default",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            transition: "background 0.2s",
          }}
        >
          Submit Answers ({Object.keys(answers).length}/{questions.length}{" "}
          answered)
        </div>
      )}
    </div>
  );
};

/* ─── ItemRow ─────────────────────────────────────────────────────────────── */
const ItemRow = ({ item, ii, expanded, onToggle }) => {
  const isLesson = item.itemType === "lesson";
  const dur = item.itemId?.duration;
  const hasVideo = !!item.itemId?.videoUrl;

  return (
    <div>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: expanded ? "8px 8px 0 0" : 8,
          background: expanded ? "#EDE9FE" : ii % 2 === 0 ? "#fafafa" : "#fff",
          borderBottom: "1px solid #f0f0f0",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isLesson ? "#EDE9FE" : "#F3E8FF",
          }}
        >
          {isLesson ? (
            <PlayCircleOutlined style={{ fontSize: 13, color: "#8B5CF6" }} />
          ) : (
            <QuestionCircleOutlined
              style={{ fontSize: 13, color: "#9333ea" }}
            />
          )}
        </div>
        <Text style={{ flex: 1, fontSize: 13 }}>{item.title}</Text>
        <Space size={6}>
          <Tag
            style={{
              margin: 0,
              fontSize: 11,
              border: "none",
              borderRadius: 4,
              background: isLesson ? "#EDE9FE" : "#F3E8FF",
              color: isLesson ? "#8B5CF6" : "#9333ea",
            }}
          >
            {isLesson ? "Lesson" : "Quiz"}
          </Tag>
          {isLesson && (
            <Tag
              style={{
                margin: 0,
                fontSize: 11,
                border: "none",
                borderRadius: 4,
                background: hasVideo ? "#D1FAE5" : "#FEE2E2",
                color: hasVideo ? "#059669" : "#DC2626",
              }}
            >
              {hasVideo ? "Has Video" : "No Video"}
            </Tag>
          )}
          {isLesson && dur > 0 && (
            <Text
              type="secondary"
              style={{ fontSize: 11, whiteSpace: "nowrap" }}
            >
              {fmtShort(dur)}
            </Text>
          )}
          {!isLesson && item.itemId?.questions?.length > 0 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {item.itemId.questions.length}Q
            </Text>
          )}
        </Space>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div
          style={{
            border: "1px solid #EDE9FE",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "14px 16px",
            background: "#FAFAFA",
          }}
        >
          {isLesson ? (
            <VideoPlayer url={item.itemId?.videoUrl} title={item.title} />
          ) : (
            <QuizViewer quiz={item.itemId} />
          )}
        </div>
      )}
    </div>
  );
};

/* ─── CourseDetailModal ───────────────────────────────────────────────────── */
/**
 * Props:
 *   course      — course object (populated sections.items.itemId)
 *   open        — boolean
 *   loading     — boolean (show spinner while fetching)
 *   onClose     — () => void
 */
const CourseDetailModal = ({ course, open, loading = false, onClose }) => {
  const [expandedItem, setExpandedItem] = useState(null); // "secIdx-itemIdx"

  const handleToggle = (key) =>
    setExpandedItem((prev) => (prev === key ? null : key));

  if (!open) return null;

  const statusStyle = STATUS_STYLE[course?.status] ?? STATUS_STYLE.draft;

  const totalLessons = (course?.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );
  const totalQuizzes = (course?.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "quiz").length ?? 0),
    0,
  );

  const collapseItems = (course?.sections ?? []).map((sec, si) => {
    const lc = sec.items?.filter((i) => i.itemType === "lesson").length ?? 0;
    const qc = sec.items?.filter((i) => i.itemType === "quiz").length ?? 0;
    return {
      key: sec._id ?? si,
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text strong style={{ fontSize: 14 }}>
            {sec.title || `Section ${si + 1}`}
          </Text>
          <Space size={6}>
            {lc > 0 && (
              <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                {lc} lesson{lc > 1 ? "s" : ""}
              </Tag>
            )}
            {qc > 0 && (
              <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>
                {qc} quiz
              </Tag>
            )}
          </Space>
        </div>
      ),
      children: (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {(sec.items ?? []).length === 0 ? (
            <Text type="secondary" style={{ fontSize: 13, padding: "8px 0" }}>
              No items in this section
            </Text>
          ) : (
            (sec.items ?? []).map((item, ii) => {
              const key = `${si}-${ii}`;
              return (
                <ItemRow
                  key={item._id ?? ii}
                  item={item}
                  ii={ii}
                  expanded={expandedItem === key}
                  onToggle={() => handleToggle(key)}
                />
              );
            })
          )}
        </div>
      ),
    };
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      title={null}
      styles={{ body: { padding: 0 } }}
      style={{ top: 20 }}
      destroyOnClose
      afterClose={() => setExpandedItem(null)}
    >
      {loading || !course ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* ── Banner ── */}
          <div
            style={{
              position: "relative",
              height: 200,
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
              borderRadius: "8px 8px 0 0",
              overflow: "hidden",
            }}
          >
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.35,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "20px 24px",
              }}
            >
              <Tag
                style={{
                  marginBottom: 8,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 6,
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                {statusStyle.label}
              </Tag>
              <Title
                level={3}
                style={{
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.3,
                  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                }}
              >
                {course.title}
              </Title>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {course.instructorId?.fullname ??
                  course.instructorId?.email ??
                  "Instructor"}
              </Text>
            </div>
          </div>

          {/* ── Body ── */}
          <div
            style={{
              padding: "20px 24px",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {/* Rejection alert */}
            {course.status === "rejected" && (
              <div
                style={{
                  background: "#FFF1F0",
                  border: "1px solid #FFCCC7",
                  borderLeft: "4px solid #FF4D4F",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 20,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <WarningOutlined
                  style={{
                    color: "#FF4D4F",
                    fontSize: 18,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <div>
                  <Text
                    strong
                    style={{
                      color: "#CF1322",
                      fontSize: 14,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Course Rejected
                  </Text>
                  <Text
                    style={{ color: "#820014", fontSize: 13, lineHeight: 1.6 }}
                  >
                    {course.rejectionReason || "No reason provided."}
                  </Text>
                  {course.rejectedAt && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, display: "block", marginTop: 6 }}
                    >
                      Rejected on{" "}
                      {new Date(course.rejectedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
              {[
                {
                  icon: <BookOutlined />,
                  label: "Lessons",
                  value: totalLessons,
                  color: "#8B5CF6",
                  bg: "#EDE9FE",
                },
                {
                  icon: <QuestionCircleOutlined />,
                  label: "Quizzes",
                  value: totalQuizzes,
                  color: "#9333ea",
                  bg: "#F3E8FF",
                },
                {
                  icon: <ClockCircleOutlined />,
                  label: "Duration",
                  value: fmtDuration(course.totalDuration),
                  color: "#0284c7",
                  bg: "#E0F2FE",
                },
                {
                  icon: <TeamOutlined />,
                  label: "Students",
                  value: (course.enrollmentCount ?? 0).toLocaleString(),
                  color: "#059669",
                  bg: "#D1FAE5",
                },
              ].map((s) => (
                <Col xs={12} sm={6} key={s.label}>
                  <div
                    style={{
                      background: s.bg,
                      borderRadius: 10,
                      padding: "12px 14px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{ color: s.color, fontSize: 20, marginBottom: 4 }}
                    >
                      {s.icon}
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: "#111827",
                      }}
                    >
                      {s.value || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* Info row */}
            <Row gutter={12} style={{ marginBottom: 20 }}>
              {[
                { label: "Category", value: course.category?.name },
                { label: "Level", value: course.level },
                {
                  label: "Price",
                  value: course.price === 0 ? "Free" : `$${course.price}`,
                  color: course.price === 0 ? "#059669" : "#7C3AED",
                },
              ].map((item) => (
                <Col xs={24} sm={8} key={item.label}>
                  <div
                    style={{
                      background: "#F9FAFB",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text strong style={{ fontSize: 13, color: item.color }}>
                      {item.value ?? "—"}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>

            {/* Description */}
            {course.description && (
              <>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Description
                </Text>
                <Paragraph
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  {course.description}
                </Paragraph>
              </>
            )}

            <Divider style={{ margin: "0 0 16px" }} />

            {/* Curriculum */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#6B7280",
                display: "block",
                marginBottom: 12,
              }}
            >
              Curriculum — {course.sections?.length ?? 0} section
              {(course.sections?.length ?? 0) !== 1 ? "s" : ""}
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  textTransform: "none",
                  marginLeft: 8,
                }}
              >
                (click a lesson/quiz to preview)
              </Text>
            </Text>

            {(course.sections?.length ?? 0) === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  background: "#F9FAFB",
                  borderRadius: 10,
                }}
              >
                <BookOutlined
                  style={{
                    fontSize: 28,
                    color: "#9CA3AF",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                <Text type="secondary">No sections added yet</Text>
              </div>
            ) : (
              <Collapse
                items={collapseItems}
                defaultActiveKey={collapseItems.slice(0, 2).map((i) => i.key)}
                style={{
                  background: "transparent",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                }}
                expandIconPosition="end"
              />
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

export default CourseDetailModal;
