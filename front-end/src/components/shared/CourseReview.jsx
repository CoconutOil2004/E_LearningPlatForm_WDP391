import {
  Empty,
  Rate,
  Space,
  Typography,
  Avatar,
  List,
  Progress,
  Row,
  Col,
  Card,
  Spin,
  Input,
  Button,
  message,
} from "antd";
import { useEffect, useState } from "react";
import ReviewService from "../../services/api/ReviewService";
import { COLOR } from "../../styles/adminTheme";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CourseReview = ({ courseId, dark = false, isInstructor = false }) => {
  const [reviews, setReviews] = useState([]);
  const [replyLoading, setReplyLoading] = useState({});
  const [replyValues, setReplyValues] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 0 });

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.all([
        ReviewService.getCourseReviews(courseId, page),
        ReviewService.getCourseRatingStats(courseId),
      ]);
      setReviews(reviewsData.reviews);
      setStats(statsData.stats);
      setPagination({
        current: reviewsData.pagination.page,
        total: reviewsData.pagination.total,
      });
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId) => {
    const content = replyValues[reviewId];
    if (!content?.trim()) return;

    setReplyLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await ReviewService.replyToReview(reviewId, content);
      message.success("Reply posted!");
      setReplyValues((prev) => ({ ...prev, [reviewId]: "" }));
      fetchReviews();
    } catch (err) {
      message.error("Failed to post reply");
    } finally {
      setReplyLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  useEffect(() => {
    if (courseId) fetchReviews();
  }, [courseId]);

  if (loading && reviews.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>;
  }

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Stats Summary */}
      {stats && stats.totalReviews > 0 && (
        <Row gutter={[32, 32]} style={{ marginBottom: 40 }}>
          <Col xs={24} md={8} style={{ textAlign: "center" }}>
            <div
              style={{
                background: "#f8fafc",
                padding: "32px",
                borderRadius: 24,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Title level={1} style={{ margin: 0, fontSize: 48, color: COLOR.ocean }}>
                {(
                  Object.entries(stats.breakdown).reduce(
                    (acc, [rating, count]) => acc + Number(rating) * count,
                    0
                  ) / stats.totalReviews || 0
                ).toFixed(1)}
              </Title>
              <Rate
                disabled
                allowHalf
                defaultValue={
                  Object.entries(stats.breakdown).reduce(
                    (acc, [rating, count]) => acc + Number(rating) * count,
                    0
                  ) / stats.totalReviews || 0
                }
              />
              <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
                Course Rating · {stats.totalReviews} reviews
              </Text>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Text style={{ minWidth: 60, fontWeight: 600 }}>{star} stars</Text>
                  <Progress
                    percent={Math.round((stats.breakdown[star] / stats.totalReviews) * 100)}
                    status="normal"
                    strokeColor={COLOR.ocean}
                    showInfo={false}
                    style={{ flex: 1 }}
                  />
                  <Text type="secondary" style={{ minWidth: 40 }}>
                    {Math.round((stats.breakdown[star] / stats.totalReviews) * 100)}%
                  </Text>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      )}

      {/* Review List */}
      <Title level={4} style={{ marginBottom: 24 }}>
        Student Feedback
      </Title>
      <List
        dataSource={reviews}
        locale={{ emptyText: <Empty description="Be the first to review this course!" /> }}
        pagination={
          pagination.total > 10
            ? {
                current: pagination.current,
                total: pagination.total,
                pageSize: 10,
                onChange: (page) => fetchReviews(page),
              }
            : false
        }
        renderItem={(item) => (
          <Card
            bordered={false}
            style={{
              marginBottom: 16,
              borderRadius: 16,
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <Avatar src={item.userId?.avatarURL} size={48}>
                {item.userId?.fullname?.charAt(0)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 16, display: "block" }}>
                      {item.userId?.fullname}
                    </Text>
                    <Rate
                      disabled
                      defaultValue={item.rating}
                      style={{ fontSize: 12, marginTop: 4 }}
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <Paragraph style={{ marginTop: 12, color: dark ? "#D1D5DB" : "#475569" }}>
                  {item.comment}
                </Paragraph>

                {/* Instructor Reply Display */}
                {item.instructorReply?.content && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: "16px",
                      background: dark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                      borderRadius: 12,
                      borderLeft: `4px solid ${COLOR.ocean}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text strong style={{ color: dark ? "#fff" : "#1e293b", fontSize: 13 }}>
                        Instructor Response
                      </Text>
                      <Text style={{ fontSize: 11, color: "#64748b" }}>
                        {new Date(item.instructorReply.repliedAt).toLocaleDateString()}
                      </Text>
                    </div>
                    <Text style={{ color: dark ? "#D1D5DB" : "#475569", fontSize: 13 }}>
                      {item.instructorReply.content}
                    </Text>
                  </div>
                )}

                {/* Instructor Reply Form */}
                {isInstructor && !item.instructorReply?.content && (
                  <div style={{ marginTop: 16 }}>
                    <TextArea
                      rows={2}
                      placeholder="Write a reply to this review..."
                      value={replyValues[item._id] || ""}
                      onChange={(e) => setReplyValues(prev => ({ ...prev, [item._id]: e.target.value }))}
                      style={{
                        background: dark ? "rgba(255,255,255,0.05)" : "#fff",
                        border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                        color: dark ? "#fff" : "#1e293b",
                        borderRadius: 8,
                        marginBottom: 10
                      }}
                    />
                    <div style={{ textAlign: "right" }}>
                      <Button
                        type="primary"
                        size="small"
                        loading={replyLoading[item._id]}
                        onClick={() => handleReply(item._id)}
                      >
                        Submit Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      />
    </div>
  );
};

export default CourseReview;
