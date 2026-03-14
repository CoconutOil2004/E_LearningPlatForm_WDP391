import {
  CheckCircleFilled,
  LoadingOutlined,
  LockOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Space, Tag, Tooltip, Typography } from "antd";

import { formatDurationClock } from "../../utils/helpers";

const { Text } = Typography;

const LearningSidebar = ({
  sectionsWithIdx,
  itemsProgress = [],
  activeIdx,
  totalLessons,
  completedCount,
  onGoTo,
}) => {
  const getItemStatus = (itemId) => {
    if (!itemId) return "lock";
    const idStr = itemId?._id?.toString() ?? itemId?.toString();
    const found = itemsProgress.find((i) => i.itemId?.toString() === idStr);
    return found?.status ?? null;
  };

  const getWatchedSeconds = (itemId, duration) => {
    if (!itemId || !duration) return 0;
    const idStr = itemId?._id?.toString() ?? itemId?.toString();
    const found = itemsProgress.find((i) => i.itemId?.toString() === idStr);
    return found?.watchedSeconds ?? 0;
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
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Text strong style={{ color: "#fff", fontSize: 14 }}>
          Course Content
        </Text>
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 13,
            display: "block",
            marginTop: 4,
          }}
        >
          {completedCount}/{totalLessons} lessons completed
        </Text>
      </div>

      {/* List */}
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
              const isActive = item.flatIdx === activeIdx;
              const isQuiz = item.itemType === "quiz";
              const serverStatus = getItemStatus(item.itemId);

              // Nếu chưa có itemsProgress từ server, fallback dựa theo vị trí
              const isDone = serverStatus === "done";
              const isLocked = serverStatus === "lock";
              const isInProgress = serverStatus === "progress";
              const isOpen = serverStatus === "open"; // quiz open
              const unlocked = !isLocked;

              const lessonDuration = item.itemId?.duration ?? 0;
              const watchedSec = !isQuiz
                ? getWatchedSeconds(item.itemId, lessonDuration)
                : 0;
              const watchedPct =
                lessonDuration > 0 ? watchedSec / lessonDuration : 0;

              return (
                <Tooltip
                  key={item._id || item.flatIdx}
                  title={
                    isLocked ? "Hoàn thành bài trước để mở khóa" : undefined
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
                      position: "relative",
                    }}
                  >
                    {/* Status icon */}
                    <div
                      style={{
                        marginTop: 2,
                        color: isDone
                          ? "#10b981"
                          : isLocked
                            ? "#6B7280"
                            : isActive
                              ? "#6366f1"
                              : "#6B7280",
                      }}
                    >
                      {isLocked ? (
                        <LockOutlined />
                      ) : isDone ? (
                        <CheckCircleFilled />
                      ) : isActive && isInProgress ? (
                        <LoadingOutlined style={{ color: "#6366f1" }} />
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

                      <Space size={8}>
                        {lessonDuration > 0 && (
                          <Text style={{ color: "#6B7280", fontSize: 12 }}>
                            {formatDurationClock(lessonDuration)}
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
                        {isInProgress && !isDone && watchedPct > 0 && (
                          <Tag
                            color="blue"
                            style={{
                              margin: 0,
                              fontSize: 10,
                              lineHeight: "16px",
                              border: "none",
                            }}
                          >
                            {Math.round(watchedPct * 100)}% watched
                          </Tag>
                        )}
                      </Space>

                      {/* Progress bar nhỏ cho lesson đang học */}
                      {!isQuiz && !isDone && watchedPct > 0 && (
                        <div
                          style={{
                            marginTop: 6,
                            height: 2,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(100, watchedPct * 100)}%`,
                              background:
                                watchedPct >= 0.3 ? "#10b981" : "#6366f1",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                      )}
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
