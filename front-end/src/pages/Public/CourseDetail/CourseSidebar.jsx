import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  EditOutlined,
  HeartFilled,
  HeartOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Title, Typography } from "antd";

const { Title: ATitle, Text } = Typography;

const CourseSidebar = ({
  course,
  isEnrolled,
  isOwner,
  isAdmin,
  isWishlisted,
  isFree,
  paying,
  totalLessons,
  totalQuizzes,
  duration,
  onBuy,
  onLearn,
  onWishlist,
  onEdit,
}) => {
  const sidebarInfoItems = [
    { icon: <BookOutlined />,            text: `Total ${totalLessons} lessons` },
    { icon: <QuestionCircleOutlined />,  text: `${totalQuizzes} quizzes` },
    { icon: <ClockCircleOutlined />,     text: `Duration ${duration || "—"}` },
    { icon: <DesktopOutlined />,         text: "Learn anytime, anywhere" },
    { icon: <SafetyCertificateOutlined />, text: "Certificate of completion" },
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.09)",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative" }}>
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=338&fit=crop"
          }
          alt={course.title}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Price + Buttons */}
      <div style={{ padding: "20px 20px 16px" }}>
        {isEnrolled ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#d1fae5",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <CheckCircleOutlined style={{ color: "#059669" }} />
            <Text strong style={{ color: "#065f46", fontSize: 13 }}>
              You are enrolled
            </Text>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <ATitle
              level={2}
              className="gradient-text"
              style={{ margin: 0, lineHeight: 1, display: "inline-block" }}
            >
              {isFree ? "Free" : `${course.price?.toLocaleString("vi-VN")} ₫`}
            </ATitle>
            {!isFree && (
              <Text
                delete
                type="secondary"
                style={{ marginLeft: 10, fontSize: 13 }}
              >
                {Math.round((course.price ?? 0) * 1.4).toLocaleString("vi-VN")} ₫
              </Text>
            )}
          </div>
        )}

        {/* Primary CTA */}
        {isEnrolled ? (
          <Button
            type="primary"
            size="large"
            block
            icon={<PlayCircleOutlined />}
            onClick={onLearn}
            style={{
              borderRadius: 8,
              height: 44,
              fontWeight: 700,
              fontSize: 15,
              background: "linear-gradient(135deg,#10b981,#059669)",
              border: "none",
            }}
          >
            Start Learning
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            block
            loading={paying}
            onClick={onBuy}
            className="btn-aurora"
            style={{ borderRadius: 8, height: 44, fontWeight: 700, fontSize: 15, border: "none" }}
          >
            {isFree ? "Enroll for Free" : "Buy Now"}
          </Button>
        )}

        {/* Wishlist */}
        {!isEnrolled && (
          <Button
            block
            size="middle"
            style={{ marginTop: 8, borderRadius: 8 }}
            icon={
              isWishlisted ? (
                <HeartFilled style={{ color: "#ef4444" }} />
              ) : (
                <HeartOutlined />
              )
            }
            onClick={onWishlist}
          >
            {isWishlisted ? "Saved" : "Save Course"}
          </Button>
        )}

        {/* Owner/Admin edit */}
        {(isOwner || isAdmin) && (
          <Button
            block
            size="middle"
            icon={<EditOutlined />}
            style={{ marginTop: 8, borderRadius: 8 }}
            onClick={onEdit}
          >
            {isAdmin ? "Manage Course" : "Edit Course"}
          </Button>
        )}
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Course info list */}
      <div style={{ padding: "14px 20px 18px" }}>
        {sidebarInfoItems.map((item) => (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "5px 0",
            }}
          >
            <span style={{ color: "#6b7280", fontSize: 15 }}>{item.icon}</span>
            <Text style={{ fontSize: 13 }}>{item.text}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CourseSidebar;
