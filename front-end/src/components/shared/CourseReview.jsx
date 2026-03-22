import {
  Avatar,
  Button,
  Empty,
  Input,
  message,
  Rate,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import ReviewService from "../../services/api/ReviewService";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ─── StarBar ────────────────────────────────────────────────────────────── */
const StarBar = ({ star, percent, count }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}
  >
    <div
      style={{ display: "flex", alignItems: "center", gap: 3, minWidth: 58 }}
    >
      {[...Array(star)].map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
    <div
      style={{
        flex: 1,
        height: 7,
        borderRadius: 99,
        background: "#f1f5f9",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 99,
          width: `${percent}%`,
          background:
            percent > 60 ? "#F59E0B" : percent > 30 ? "#fb923c" : "#e5e7eb",
          transition: "width 0.6s ease",
        }}
      />
    </div>
    <Text
      type="secondary"
      style={{ fontSize: 12, minWidth: 28, textAlign: "right" }}
    >
      {count}
    </Text>
  </div>
);

/* ─── RatingOverview ─────────────────────────────────────────────────────── */
const RatingOverview = ({ stats }) => {
  const avg = (
    Object.entries(stats.breakdown).reduce(
      (acc, [rating, count]) => acc + Number(rating) * count,
      0,
    ) / stats.totalReviews || 0
  ).toFixed(1);

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "stretch",
        background: "#fafafa",
        border: "1px solid #f0f0f0",
        borderRadius: 16,
        padding: "24px 28px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 100,
          paddingRight: 24,
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <Text
          style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1,
            color: "#1a1a1a",
            letterSpacing: "-2px",
            display: "block",
            marginBottom: 6,
          }}
        >
          {avg}
        </Text>
        <Rate
          disabled
          allowHalf
          value={parseFloat(avg)}
          style={{ fontSize: 13, color: "#F59E0B" }}
        />
        <Text
          type="secondary"
          style={{ fontSize: 12, marginTop: 6, display: "block" }}
        >
          {stats.totalReviews} ratings
        </Text>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.breakdown[star] ?? 0;
          const percent = Math.round((count / stats.totalReviews) * 100);
          return (
            <StarBar key={star} star={star} percent={percent} count={count} />
          );
        })}
      </div>
    </div>
  );
};

/* ─── WriteReviewBox ─────────────────────────────────────────────────────── */
const WriteReviewBox = ({ courseId, onSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      message.warning("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      message.warning("Please write your review");
      return;
    }
    setSubmitting(true);
    try {
      await ReviewService.createReview({ courseId, rating, comment });
      message.success("Review submitted!");
      setRating(0);
      setComment("");
      setOpen(false);
      onSubmitted?.();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: "14px 18px",
          background: "#fafafa",
          border: "1.5px dashed #d1d5db",
          borderRadius: 12,
          cursor: "pointer",
          marginBottom: 28,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f0f4ff";
          e.currentTarget.style.borderColor = "#6366f1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fafafa";
          e.currentTarget.style.borderColor = "#d1d5db";
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            flexShrink: 0,
            background: "linear-gradient(135deg,#6366f1,#a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div style={{ textAlign: "left" }}>
          <Text
            strong
            style={{ display: "block", fontSize: 14, color: "#374151" }}
          >
            Leave a Review
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Share your experience with this course
          </Text>
        </div>
      </button>
    );
  }

  return (
    <div
      style={{
        marginBottom: 28,
        padding: "22px 24px",
        background: "#fafbff",
        border: "1.5px solid #e0e7ff",
        borderRadius: 14,
      }}
    >
      <Text strong style={{ fontSize: 15, display: "block", marginBottom: 16 }}>
        Write a Review
      </Text>

      {/* Star picker */}
      <div style={{ marginBottom: 16 }}>
        <Text
          type="secondary"
          style={{ fontSize: 13, display: "block", marginBottom: 8 }}
        >
          Your rating
        </Text>
        <Rate
          value={rating}
          onChange={setRating}
          style={{ fontSize: 28, color: "#F59E0B" }}
        />
        {rating > 0 && (
          <Text style={{ marginLeft: 12, fontSize: 13, color: "#6b7280" }}>
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </Text>
        )}
      </div>

      {/* Comment */}
      <div style={{ marginBottom: 25 }}>
        <Text
          type="secondary"
          style={{ fontSize: 13, display: "block", marginBottom: 8 }}
        >
          Your review
        </Text>
        <TextArea
          rows={4}
          placeholder="What did you like or dislike? What did you learn? Would you recommend this course?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          showCount
          style={{ borderRadius: 8, fontSize: 13, resize: "none" }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button
          onClick={() => {
            setOpen(false);
            setRating(0);
            setComment("");
          }}
          style={{ borderRadius: 8 }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          style={{
            borderRadius: 8,
            fontWeight: 600,
            background: "linear-gradient(135deg,#10b981,#059669)",
            border: "none",
          }}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
};

/* ─── ReviewCard ─────────────────────────────────────────────────────────── */
const ReviewCard = ({
  item,
  dark,
  isInstructor,
  replyValue,
  replyLoading,
  onReplyChange,
  onReplySubmit,
}) => {
  const [expanded, setExpanded] = useState(false);
  const comment = item.comment || "";
  const isLong = comment.length > 200;

  return (
    <div style={{ padding: "20px 0", borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", gap: 14 }}>
        <Avatar
          src={item.userId?.avatarURL}
          size={42}
          style={{
            flexShrink: 0,
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {item.userId?.fullname?.charAt(0)?.toUpperCase()}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Text strong style={{ fontSize: 14 }}>
                {item.userId?.fullname || "Anonymous"}
              </Text>
              <Rate
                disabled
                value={item.rating}
                style={{ fontSize: 11, color: "#F59E0B" }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </div>

          <div style={{ marginTop: 6 }}>
            <Paragraph
              style={{
                color: dark ? "#D1D5DB" : "#4b5563",
                fontSize: 14,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {isLong && !expanded ? `${comment.slice(0, 200)}…` : comment}
            </Paragraph>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "#6366f1",
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Instructor Reply */}
          {item.instructorReply?.content && (
            <div
              style={{
                marginTop: 14,
                padding: "14px 16px",
                background: "#f0f9ff",
                borderRadius: 10,
                borderLeft: "3px solid #38bdf8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#38bdf8,#6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                  </div>
                  <Text strong style={{ fontSize: 13, color: "#0c4a6e" }}>
                    Instructor Response
                  </Text>
                </div>
                <Text style={{ fontSize: 11, color: "#64748b" }}>
                  {new Date(item.instructorReply.repliedAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </Text>
              </div>
              <Text style={{ color: "#1e40af", fontSize: 13, lineHeight: 1.6 }}>
                {item.instructorReply.content}
              </Text>
            </div>
          )}

          {/* Instructor Reply Form */}
          {isInstructor && !item.instructorReply?.content && (
            <div style={{ marginTop: 14 }}>
              <TextArea
                rows={2}
                placeholder="Reply to this review…"
                value={replyValue || ""}
                onChange={(e) => onReplyChange(e.target.value)}
                style={{
                  borderRadius: 8,
                  fontSize: 13,
                  resize: "none",
                  border: "1px solid #e2e8f0",
                  marginBottom: 8,
                }}
              />
              <div style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  size="small"
                  loading={replyLoading}
                  onClick={onReplySubmit}
                  style={{ borderRadius: 6, fontWeight: 600 }}
                >
                  Post Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── CourseReview (main) ────────────────────────────────────────────────── */
const CourseReview = ({
  courseId,
  dark = false,
  isInstructor = false,
  isEnrolled = false,
}) => {
  const [reviews, setReviews] = useState([]);
  const [replyLoading, setReplyLoading] = useState({});
  const [replyValues, setReplyValues] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 0 });
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

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

      // Check if current user already reviewed (by checking ReviewService or a flag from API)
      try {
        const myReviewResponse = await ReviewService.getMyReview?.(courseId);
        setHasUserReviewed(!!myReviewResponse?.data);
      } catch {
        setHasUserReviewed(false);
      }
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
    } catch {
      message.error("Failed to post reply");
    } finally {
      setReplyLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  useEffect(() => {
    if (courseId) fetchReviews();
  }, [courseId]);

  if (loading && reviews.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasReviews = reviews.length > 0;
  // Show write box only if enrolled, not an instructor/owner, and hasn't reviewed yet
  const showWriteBox = isEnrolled && !isInstructor && !hasUserReviewed;

  return (
    <div>
      {/* Rating Overview */}
      {stats && stats.totalReviews > 0 && <RatingOverview stats={stats} />}

      {/* Write Review Box — only for enrolled students who haven't reviewed */}
      {showWriteBox && (
        <WriteReviewBox
          courseId={courseId}
          onSubmitted={() => {
            setHasUserReviewed(true);
            fetchReviews();
          }}
        />
      )}

      {/* Already reviewed notice */}
      {isEnrolled && !isInstructor && hasUserReviewed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            marginBottom: 24,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeWidth="2"
              stroke="#16a34a"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Text style={{ fontSize: 13, color: "#15803d" }}>
            You have already submitted a review for this course.
          </Text>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 15 }}>
          {pagination.total > 0 ? `${pagination.total} Reviews` : "Reviews"}
        </Text>
      </div>

      {/* Review list */}
      {!hasReviews ? (
        <Empty
          description={
            <Text type="secondary">No reviews yet. Be the first!</Text>
          }
          style={{ padding: "40px 0" }}
        />
      ) : (
        <>
          {reviews.map((item) => (
            <ReviewCard
              key={item._id}
              item={item}
              dark={dark}
              isInstructor={isInstructor}
              replyValue={replyValues[item._id]}
              replyLoading={replyLoading[item._id]}
              onReplyChange={(val) =>
                setReplyValues((prev) => ({ ...prev, [item._id]: val }))
              }
              onReplySubmit={() => handleReply(item._id)}
            />
          ))}

          {/* Pagination */}
          {pagination.total > 10 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              <Button
                disabled={pagination.current === 1}
                onClick={() => fetchReviews(pagination.current - 1)}
                style={{ borderRadius: 8 }}
              >
                ← Previous
              </Button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 16px",
                  background: "#f8fafc",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Text style={{ fontSize: 13 }}>
                  Page {pagination.current} of{" "}
                  {Math.ceil(pagination.total / 10)}
                </Text>
              </div>
              <Button
                disabled={
                  pagination.current >= Math.ceil(pagination.total / 10)
                }
                onClick={() => fetchReviews(pagination.current + 1)}
                style={{ borderRadius: 8 }}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseReview;
