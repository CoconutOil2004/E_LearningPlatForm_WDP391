import {
  LockOutlined,
  MinusOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useState } from "react";
import { formatDurationClock } from "../../../utils/helpers";

const { Text } = Typography;

const CurriculumAccordion = ({
  sections,
  isUnlocked,
  totalLessons,
  duration,
}) => {
  const [openKeys, setOpenKeys] = useState([]);

  const toggleAll = () =>
    setOpenKeys(
      openKeys.length === sections.length
        ? []
        : sections.map((s, i) => s._id || i),
    );

  const toggle = (key) =>
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  return (
    <div>
      {/* Summary row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text type="secondary" style={{ fontSize: 13 }}>
          {sections.length} sections &nbsp;·&nbsp; {totalLessons} lessons
          &nbsp;·&nbsp; Total length {duration}
        </Text>
        <Button
          type="link"
          style={{ padding: 0, fontSize: 13, color: "#f97316" }}
          onClick={toggleAll}
        >
          {openKeys.length === sections.length ? "Collapse all" : "Expand all"}
        </Button>
      </div>

      {/* Sections */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {sections.map((sec, idx) => {
          const key = sec._id || idx;
          const isOpen = openKeys.includes(key);
          const itemCount = (sec.items ?? []).length;

          return (
            <div
              key={key}
              style={{
                borderBottom:
                  idx < sections.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              {/* Header */}
              <div
                onClick={() => toggle(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f9fafb",
                  cursor: "pointer",
                  userSelect: "none",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  {isOpen ? (
                    <MinusOutlined
                      style={{ color: "#f97316", fontSize: 12, flexShrink: 0 }}
                    />
                  ) : (
                    <PlusOutlined
                      style={{ color: "#f97316", fontSize: 12, flexShrink: 0 }}
                    />
                  )}
                  <Text strong style={{ fontSize: 14 }}>
                    {sec.title}
                  </Text>
                </div>
                <Text
                  type="secondary"
                  style={{ fontSize: 13, whiteSpace: "nowrap" }}
                >
                  {itemCount} {itemCount === 1 ? "lesson" : "lessons"}
                </Text>
              </div>

              {/* Items */}
              {isOpen && (
                <div>
                  {(sec.items ?? []).map((item, i) => {
                    const dur = item.itemId?.duration;
                    const isQuiz = item.itemType === "quiz";
                    return (
                      <div
                        key={item._id || i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 16px 8px 40px",
                          borderTop: "1px solid #f3f4f6",
                          background: "#fff",
                        }}
                      >
                        {isQuiz ? (
                          <QuestionCircleOutlined
                            style={{ color: "#8B5CF6", fontSize: 13 }}
                          />
                        ) : isUnlocked ? (
                          <PlayCircleOutlined
                            style={{ color: "#10b981", fontSize: 13 }}
                          />
                        ) : (
                          <LockOutlined
                            style={{ color: "#9ca3af", fontSize: 13 }}
                          />
                        )}
                        <Text style={{ flex: 1, fontSize: 13 }}>
                          {item.title}
                        </Text>
                        {dur > 0 && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDurationClock(dur)}
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurriculumAccordion;
