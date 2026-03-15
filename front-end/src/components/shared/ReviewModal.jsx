import { Modal, Rate, Input, message, Typography, Space, Button } from "antd";
import { useState } from "react";
import ReviewService from "../../services/api/ReviewService";

const { Text, Title } = Typography;
const { TextArea } = Input;

const ReviewModal = ({ open, onCancel, courseId, onReviewSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      message.warning("Please provide a rating");
      return;
    }

    setLoading(true);
    try {
      await ReviewService.createReview({
        courseId,
        rating,
        comment,
      });
      message.success("Review submitted! Thank you for your feedback.");
      if (onReviewSuccess) onReviewSuccess();
      onCancel();
      // Reset form
      setRating(0);
      setComment("");
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      bodyStyle={{ padding: "32px", borderRadius: "16px" }}
    >
      <div style={{ textAlign: "center" }}>
        <Title level={3} style={{ margin: "0 0 8px" }}>
          How's your learning experience?
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
          Your feedback helps us and other students!
        </Text>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Select Rating</Text>
            </div>
            <Rate
              value={rating}
              onChange={setRating}
              style={{ fontSize: 36 }}
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Your Review (Optional)</Text>
            </div>
            <TextArea
              rows={4}
              placeholder="Tell us what you liked or how we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              showCount
            />
          </div>
        </Space>

        <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
          <Button block size="large" onClick={onCancel}>
            Maybe later
          </Button>
          <Button
            block
            size="large"
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{
              background: "#0077B6", // Ocean
              borderColor: "#0077B6",
              fontWeight: 600,
            }}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewModal;
