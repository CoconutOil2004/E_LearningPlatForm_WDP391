import {
  ArrowLeftOutlined,
  MenuOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Progress as AntProgress, Button, Typography, Tooltip } from "antd";

const { Text, Title } = Typography;

/**
 * LearningHeader
 * Props:
 *   course         – course object { title, category }
 *   progressPercent – 0-100
 *   completed      – number of completed lessons
 *   totalLessons   – total lesson count
 *   onBack         – () => void
 *   onToggleSidebar – () => void
 *   onRate         - () => void
 */
const LearningHeader = ({
  course,
  progressPercent,
  completed,
  totalLessons,
  onBack,
  onToggleSidebar,
  onRate,
}) => (
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
    {/* Left: back + course title */}
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ color: "#fff" }}
      />
      <div style={{ minWidth: 0 }}>
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            display: "block",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {course?.category?.name}
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
          {course?.title}
        </Title>
      </div>
    </div>

    {/* Right: progress + actions */}
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: 220,
          '@media(maxWidth: 768px)': { display: 'none' }
        }}
      >
        <AntProgress
          percent={progressPercent}
          strokeColor="#10b981"
          trailColor="rgba(255,255,255,0.1)"
          showInfo={false}
          style={{ flex: 1, margin: 0 }}
        />
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 13,
            minWidth: 60,
            whiteSpace: "nowrap",
          }}
        >
          {completed}/{totalLessons} · {progressPercent}%
        </Text>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tooltip title="Leave a review">
          <Button
            type="text"
            icon={<StarOutlined style={{ color: "#F59E0B" }} />}
            onClick={onRate}
            style={{ color: "#fff" }}
          />
        </Tooltip>
        
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onToggleSidebar}
          style={{ color: "#fff" }}
        />
      </div>
    </div>
  </header>
);

export default LearningHeader;
