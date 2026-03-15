import {
  CheckCircleFilled,
  LoadingOutlined,
  LockOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Space, Tag, Tooltip, Typography, Tabs } from "antd";
import { useState } from "react";

import { formatDurationClock } from "../../utils/helpers";
import CourseReview from "../../components/shared/CourseReview";
import LessonDiscussion from "./LessonDiscussion";

const { Text } = Typography;

const LearningSidebar = ({
  courseId,
  activeLessonId,
  sectionsWithIdx,
  itemsProgress = [],
  activeIdx,
  totalLessons,
  completedCount,
  isInstructor = false,
  onGoTo,
}) => {
  const [activeTab, setActiveTab] = useState("curriculum");

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

  const tabItems = [
    {
      key: "curriculum",
      label: (
        <span>
          <ReadOutlined /> Curriculum
        </span>
      ),
      children: (
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

                const isDone = serverStatus === "done";
                const isLocked = serverStatus === "lock";
                const isInProgress = serverStatus === "progress";
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
                          {isQuiz && <Tag color="purple" style={{ margin: 0, fontSize: 10, border: 'none' }}>Quiz</Tag>}
                          {isInProgress && !isDone && watchedPct > 0 && (
                            <Tag color="blue" style={{ margin: 0, fontSize: 10, border: 'none' }}>
                              {Math.round(watchedPct * 100)}% watched
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
      ),
    },
    {
      key: "discussions",
      label: (
        <span>
          <MessageOutlined /> Discuss
        </span>
      ),
      children: (
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          <LessonDiscussion
            courseId={courseId}
            lessonId={activeLessonId}
            dark
          />
        </div>
      ),
    },
    {
      key: "reviews",
      label: (
        <span>
          <StarOutlined /> Reviews
        </span>
      ),
      children: (
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          <CourseReview courseId={courseId} dark isInstructor={isInstructor} />
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        width: 360,
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
          {completedCount}/{totalLessons} lessons completed
        </Text>
      </div>

      <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
          animated={false}
          className="learning-tabs"
          style={{ height: '100%' }}
        />
      </div>

      <style>{`
        .learning-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        }
        .learning-tabs .ant-tabs-tab {
          padding: 12px 0 !important;
          color: #9CA3AF !important;
        }
        .learning-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #6366f1 !important;
        }
        .learning-tabs .ant-tabs-ink-bar {
          background: #6366f1 !important;
        }
        .learning-tabs .ant-tabs-content-holder {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .learning-tabs .ant-tabs-content {
          height: 100%;
        }
        .learning-tabs .ant-tabs-tabpane-active {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default LearningSidebar;
