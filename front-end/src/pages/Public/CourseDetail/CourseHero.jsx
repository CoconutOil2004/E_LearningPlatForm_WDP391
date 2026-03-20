import {
  BookOutlined,
  ClockCircleOutlined,
  StarFilled,
  TeamOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { Paragraph, Space, Tag, Text, Title, Typography } from "antd";

const { Title: ATitle, Text: AText, Paragraph: AParagraph } = Typography;

const CourseHero = ({
  course,
  categoryName,
  isEnrolled,
  isOwner,
  isAdmin,
  totalLessons,
  totalQuizzes,
  duration,
}) => (
  <div>
    <Space wrap style={{ marginBottom: 10 }}>
      {categoryName && <Tag color="blue">{categoryName}</Tag>}
      {course.level && <Tag>{course.level}</Tag>}
      {isEnrolled && (
        <Tag icon={<UnlockOutlined />} color="success">
          Enrolled
        </Tag>
      )}
      {(isOwner || isAdmin) && !isEnrolled && (
        <Tag color="purple">{isAdmin ? "Admin" : "Instructor"}</Tag>
      )}
    </Space>

    <ATitle
      level={2}
      style={{ marginBottom: 12, fontWeight: 800, lineHeight: 1.3 }}
    >
      {course.title}
    </ATitle>

    <AParagraph
      type="secondary"
      style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}
    >
      {course.description || "No description available."}
    </AParagraph>

    <Space wrap size="large">
      <Space size={4}>
        <StarFilled style={{ color: "#F59E0B" }} />
        <AText strong>{Number(course.rating ?? 0).toFixed(1)}</AText>
      </Space>
      <Space size={4}>
        <TeamOutlined style={{ color: "#6b7280" }} />
        <AText type="secondary">{course.enrollmentCount ?? 0} students</AText>
      </Space>
      {duration && (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: "#6b7280" }} />
          <AText type="secondary">{duration}</AText>
        </Space>
      )}
      <Space size={4}>
        <BookOutlined style={{ color: "#6b7280" }} />
        <AText type="secondary">
          {totalLessons} lessons · {totalQuizzes} quizzes
        </AText>
      </Space>
    </Space>
  </div>
);

export default CourseHero;
