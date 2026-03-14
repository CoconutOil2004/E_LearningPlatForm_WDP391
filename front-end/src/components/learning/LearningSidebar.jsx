import {
  CheckCircleFilled,
  LockOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Space, Tag, Tooltip, Typography } from "antd";

const { Text } = Typography;

const fmtTime = (s) => {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/**
 * LearningSidebar
 * Props:
 *   sectionsWithIdx  – [{ title, mappedItems: [{ flatIdx, itemType, title, itemId, ... }] }]
 *   completed        – number[] (flatIdx list of completed lessons)
 *   watched80        – Set<number> (flatIdx của các bài đã xem ≥80%)
 *   activeIdx        – current flatIdx
 *   totalLessons     – number
 *   onGoTo           – (flatIdx) => void
 */
const LearningSidebar = ({
  sectionsWithIdx,
  completed,
  watched80,
  activeIdx,
  totalLessons,
  onGoTo,
}) => {
  /**
   * Kiểm tra bài học có thể truy cập không.
   * Quy tắc: Bài đầu tiên luôn mở. Các bài sau chỉ mở khi
   * bài liền trước đó (flatIdx - 1) đã completed (xem ≥80%).
   */
  const isUnlocked = (flatIdx) => {
    if (flatIdx === 0) return true;
    // Tất cả bài đã hoàn thành → luôn được click
    if (completed.includes(flatIdx)) return true;
    // Bài trước đã được xem ≥ 80% thì mở khóa bài này
    return completed.includes(flatIdx - 1) || watched80.has(flatIdx - 1);
  };

  return (
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
      {/* Sidebar header */}
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
          Đã hoàn thành {completed.length}/{totalLessons} bài học
        </Text>
      </div>

      {/* Lesson list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {sectionsWithIdx.map((sec, si) => (
          <div key={sec._id || si}>
            {/* Section title */}
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

            {/* Items */}
            {sec.mappedItems.map((item) => {
              const isDone = completed.includes(item.flatIdx);
              const isActive = item.flatIdx === activeIdx;
              const isQuiz = item.itemType === "quiz";
              const unlocked = isUnlocked(item.flatIdx);
              const hasWatched = watched80.has(item.flatIdx);

              return (
                <Tooltip
                  key={item._id || item.flatIdx}
                  title={
                    !unlocked ? "Hoàn thành bài trước để mở khóa" : undefined
                  }
                  placement="right"
                >
                  <div
                    onClick={() => unlocked && onGoTo(item.flatIdx)}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 20px",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      background: isActive
                        ? "rgba(99,102,241,0.15)"
                        : "transparent",
                      borderLeft: isActive
                        ? "3px solid #6366f1"
                        : "3px solid transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.02)",
                      transition: "background 0.2s",
                      opacity: unlocked ? 1 : 0.45,
                    }}
                  >
                    {/* Status icon */}
                    <div
                      style={{
                        marginTop: 2,
                        color: isDone
                          ? "#10b981"
                          : !unlocked
                            ? "#6B7280"
                            : isActive
                              ? "#6366f1"
                              : "#6B7280",
                      }}
                    >
                      {!unlocked ? (
                        <LockOutlined />
                      ) : isDone ? (
                        <CheckCircleFilled />
                      ) : isQuiz ? (
                        <QuestionCircleOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )}
                    </div>

                    {/* Info */}
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
                        {/* Hiển thị tiến độ xem nếu chưa done */}
                        {!isDone && hasWatched && (
                          <Tag
                            color="cyan"
                            style={{
                              margin: 0,
                              fontSize: 10,
                              lineHeight: "16px",
                              border: "none",
                            }}
                          >
                            ≥80%
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningSidebar;
