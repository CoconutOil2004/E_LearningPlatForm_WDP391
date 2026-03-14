import {
  BookOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Col,
  Collapse,
  Divider,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

import { formatDurationClock, formatThousands } from "../../utils/helpers";

const { Title, Text, Paragraph } = Typography;

const STATUS_STYLE = {
  draft: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB", label: "Draft" },
  pending: {
    bg: "#FFFBEB",
    color: "#D97706",
    border: "#FEF3C7",
    label: "In Review",
  },
  published: {
    bg: "#ECFDF5",
    color: "#059669",
    border: "#D1FAE5",
    label: "Published",
  },
  rejected: {
    bg: "#FEF2F2",
    color: "#DC2626",
    border: "#FECACA",
    label: "Rejected",
  },
  archived: {
    bg: "#F3F4F6",
    color: "#4B5563",
    border: "#E5E7EB",
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
          background: "#F9FAFB",
          border: "1px dashed #D1D5DB",
          borderRadius: 8,
          height: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "#9CA3AF",
        }}
      >
        <PauseCircleOutlined style={{ fontSize: 32 }} />
        <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
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
          borderRadius: 8,
          maxHeight: 320,
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
        borderRadius: 8,
        height: 220,
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
          gap: 12,
          transition: "background 0.3s ease",
          background: "rgba(0,0,0,0.2)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.5)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.2)")
        }
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <PlayCircleOutlined style={{ fontSize: 24, color: "#fff" }} />
        </div>
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
          {title}
        </Text>
      </div>
    </div>
  );
};

/* ─── QuizViewer ──────────────────────────────────────────────────────────── */
const QuizViewer = ({ quiz }) => {
  const questions = quiz?.questions ?? [];

  if (questions.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF" }}>
        <QuestionCircleOutlined style={{ fontSize: 28, marginBottom: 12 }} />
        <Text type="secondary" style={{ display: "block" }}>
          No questions in this quiz
        </Text>
      </div>
    );

  return (
    <div>
      {questions.map((q, qi) => (
        <div
          key={qi}
          style={{
            marginBottom: 20,
            paddingBottom: 20,
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <Badge count={qi + 1} style={{ background: "#374151" }} />
            <Text strong style={{ flex: 1, fontSize: 14, color: "#1F2937" }}>
              {q.text}
            </Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(q.options ?? []).map((opt, oi) => {
              const isCorrect = parseInt(q.correctAnswer, 10) === oi;
              const bg = isCorrect ? "#ECFDF5" : "#FFF";
              const border = isCorrect ? "#6EE7B7" : "#E5E7EB";
              const color = isCorrect ? "#065F46" : "#4B5563";

              return (
                <div
                  key={oi}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 6,
                    border: `1px solid ${border}`,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `1px solid ${isCorrect ? border : "#D1D5DB"}`,
                      background: isCorrect ? "#059669" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      flexShrink: 0,
                      color: isCorrect ? "#FFF" : color,
                    }}
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <Text
                    style={{
                      color,
                      flex: 1,
                      fontSize: 14,
                      fontWeight: isCorrect ? 500 : 400,
                    }}
                  >
                    {opt}
                  </Text>
                  {isCorrect && (
                    <CheckCircleOutlined
                      style={{ color: "#059669", fontSize: 16 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── ItemRow ─────────────────────────────────────────────────────────────── */
const ItemRow = ({ item, expanded, onToggle }) => {
  const isLesson = item.itemType === "lesson";
  const dur = item.itemId?.duration;
  const hasVideo = !!item.itemId?.videoUrl;

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderRadius: 6,
          background: expanded ? "#F9FAFB" : "transparent",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!expanded) e.currentTarget.style.background = "#F9FAFB";
        }}
        onMouseLeave={(e) => {
          if (!expanded) e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          style={{ color: "#9CA3AF", display: "flex", alignItems: "center" }}
        >
          {isLesson ? <PlayCircleOutlined /> : <QuestionCircleOutlined />}
        </div>
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: "#374151",
            fontWeight: expanded ? 500 : 400,
          }}
        >
          {item.title}
        </Text>
        <Space size={12}>
          {isLesson && (
            <span
              style={{ fontSize: 12, color: hasVideo ? "#059669" : "#9CA3AF" }}
            >
              {hasVideo ? "Video" : "No video"}
            </span>
          )}
          {isLesson && dur > 0 && (
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              {formatDurationClock(dur)}
            </span>
          )}
          {!isLesson && item.itemId?.questions?.length > 0 && (
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              {item.itemId.questions.length} Qs
            </span>
          )}
        </Space>
      </div>

      {expanded && (
        <div style={{ padding: "16px 16px 24px 40px" }}>
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
const CourseDetailModal = ({ course, open, loading = false, onClose }) => {
  const [expandedItem, setExpandedItem] = useState(null);

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

  const collapseItems = (course?.sections ?? []).map((sec, si) => ({
    key: sec._id ?? si,
    label: (
      <Text strong style={{ fontSize: 15, color: "#111827" }}>
        {sec.title || `Section ${si + 1}`}
      </Text>
    ),
    children: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {(sec.items ?? []).length === 0 ? (
          <Text type="secondary" style={{ padding: "8px 16px" }}>
            Empty section
          </Text>
        ) : (
          (sec.items ?? []).map((item, ii) => {
            const key = `${si}-${ii}`;
            return (
              <ItemRow
                key={item._id ?? ii}
                item={item}
                expanded={expandedItem === key}
                onToggle={() => handleToggle(key)}
              />
            );
          })
        )}
      </div>
    ),
  }));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      title={null}
      style={{ top: 32 }}
      destroyOnClose
      afterClose={() => setExpandedItem(null)}
    >
      {loading || !course ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ padding: "12px 4px" }}>
          {/* Rejection alert */}
          {course.status === "rejected" && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 24,
                display: "flex",
                gap: 12,
              }}
            >
              <WarningOutlined
                style={{ color: "#EF4444", fontSize: 18, marginTop: 2 }}
              />
              <div>
                <Text strong style={{ color: "#991B1B", display: "block" }}>
                  Course Rejected
                </Text>
                <Text style={{ color: "#7F1D1D", fontSize: 14 }}>
                  {course.rejectionReason || "No reason provided."}
                </Text>
              </div>
            </div>
          )}

          {/* Thumbnail + Core Info */}
          <Row gutter={[32, 24]} align="middle" style={{ marginBottom: 32 }}>
            <Col xs={24} sm={10}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/10",
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #E5E7EB",
                }}
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt="Thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                    }}
                  >
                    <BookOutlined style={{ fontSize: 32 }} />
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} sm={14}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Tag
                  style={{
                    margin: 0,
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontWeight: 500,
                  }}
                >
                  {statusStyle.label}
                </Tag>

                <Title
                  level={3}
                  style={{
                    marginTop: 12,
                    marginBottom: 8,
                    color: "#111827",
                    fontWeight: 700,
                  }}
                >
                  {course.title}
                </Title>

                <Text
                  style={{ fontSize: 15, color: "#4B5563", marginBottom: 16 }}
                >
                  By{" "}
                  <span style={{ color: "#111827", fontWeight: 500 }}>
                    {course.instructorId?.fullname ??
                      course.instructorId?.email ??
                      "Instructor"}
                  </span>
                </Text>

                <Space
                  split={
                    <Divider
                      type="vertical"
                      style={{ background: "#D1D5DB" }}
                    />
                  }
                  size={16}
                >
                  {[
                    { label: "Category", value: course.category?.name ?? "—" },
                    { label: "Level", value: course.level ?? "—" },
                    {
                      label: "Price",
                      value:
                        course.price === 0
                          ? "Free"
                          : formatThousands(course.price),
                      color: course.price === 0 ? "#059669" : "#111827",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: "block",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text strong style={{ color: item.color ?? "#374151" }}>
                        {item.value}
                      </Text>
                    </div>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>

          {/* Stats row */}
          <div
            style={{
              borderTop: "1px solid #F3F4F6",
              borderBottom: "1px solid #F3F4F6",
              padding: "20px 0",
              marginBottom: 32,
            }}
          >
            <Row gutter={[16, 16]}>
              {[
                { label: "Lessons", value: totalLessons },
                { label: "Quizzes", value: totalQuizzes },
                {
                  label: "Duration",
                  value: formatDurationClock(course.totalDuration),
                },
                {
                  label: "Students",
                  value: (course.enrollmentCount ?? 0).toLocaleString(),
                },
              ].map((s, i) => (
                <Col xs={12} sm={6} key={i}>
                  <div style={{ padding: "0 8px" }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                      }}
                    >
                      {s.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {s.value || "—"}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Description */}
          {course.description && (
            <div style={{ marginBottom: 40 }}>
              <Text
                strong
                style={{
                  fontSize: 16,
                  color: "#111827",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                About this course
              </Text>
              <Paragraph
                style={{
                  fontSize: 15,
                  color: "#4B5563",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {course.description}
              </Paragraph>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Text strong style={{ fontSize: 16, color: "#111827" }}>
                Curriculum
              </Text>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {course.sections?.length ?? 0} section
                {(course.sections?.length ?? 0) !== 1 ? "s" : ""}
              </Text>
            </div>

            {(course.sections?.length ?? 0) === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  border: "1px dashed #E5E7EB",
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">No sections added yet</Text>
              </div>
            ) : (
              <Collapse
                items={collapseItems}
                defaultActiveKey={collapseItems.slice(0, 1).map((i) => i.key)}
                ghost
                expandIconPosition="end"
                style={{ background: "#fff" }}
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CourseDetailModal;
