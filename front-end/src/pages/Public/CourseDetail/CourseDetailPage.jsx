import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  GlobalOutlined,
  HeartFilled,
  HeartOutlined,
  LockOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  StarFilled,
  TeamOutlined,
  TrophyOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  message,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import CourseService from "../../../services/api/CourseService";
import PaymentService from "../../../services/api/PaymentService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import {
  formatDurationClock,
  formatThousands,
  pageVariants,
} from "../../../utils/helpers";

const { Title, Text, Paragraph } = Typography;

/* ─── CourseMeta ──────────────────────────────────────────────────────────── */
const CourseMeta = ({
  instructor,
  course,
  duration,
  totalLessons,
  totalQuizzes,
}) => (
  <Space wrap size="large">
    <Space>
      <TeamOutlined />
      <Text>{instructor}</Text>
    </Space>
    <Space>
      <StarFilled style={{ color: "#F59E0B" }} />
      <Text strong>{Number(course.rating ?? 0).toFixed(1)}</Text>
    </Space>
    {duration && (
      <Space>
        <ClockCircleOutlined />
        <Text>{duration}</Text>
      </Space>
    )}
    <Space>
      <BookOutlined />
      <Text>
        {totalLessons} lessons · {totalQuizzes} quizzes
      </Text>
    </Space>
  </Space>
);

/* ─── CourseOverviewCards ─────────────────────────────────────────────────── */
const CourseOverviewCards = ({
  totalLessons,
  totalQuizzes,
  duration,
  enrollmentCount,
}) => {
  const items = [
    { icon: <BookOutlined />, label: `${totalLessons} Lessons` },
    { icon: <QuestionCircleOutlined />, label: `${totalQuizzes} Quizzes` },
    { icon: <ClockCircleOutlined />, label: duration || "—" },
    {
      icon: <TeamOutlined />,
      label: `${formatThousands(enrollmentCount)} Students`,
    },
  ];
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col xs={12} sm={6} key={item.label}>
          <Card size="small" style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 20,
                marginBottom: 4,
                color: "var(--color-primary,#667eea)",
              }}
            >
              {item.icon}
            </div>
            <Text strong>{item.label}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

/* ─── CourseInfoSidebar ───────────────────────────────────────────────────── */
const CourseInfoSidebar = ({ totalLessons, totalQuizzes, duration }) => {
  const items = [
    { icon: <BookOutlined />, text: `${totalLessons} lessons` },
    { icon: <QuestionCircleOutlined />, text: `${totalQuizzes} quizzes` },
    { icon: <ClockCircleOutlined />, text: duration || "—" },
    { icon: <GlobalOutlined />, text: "Lifetime access" },
    { icon: <TrophyOutlined />, text: "Certificate of completion" },
  ];
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {items.map((item) => (
        <Space key={item.text}>
          <span style={{ color: "var(--color-primary,#667eea)" }}>
            {item.icon}
          </span>
          <Text>{item.text}</Text>
        </Space>
      ))}
    </Space>
  );
};

/* ─── PriceBlock ──────────────────────────────────────────────────────────── */
const PriceBlock = ({ isEnrolled, isFree, course }) => {
  if (isEnrolled) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
          borderRadius: 12,
          marginBottom: 4,
        }}
      >
        <CheckCircleOutlined style={{ color: "#059669", fontSize: 18 }} />
        <Text strong style={{ color: "#065f46" }}>
          You are enrolled in this course
        </Text>
      </div>
    );
  }

  return (
    <>
      {!isFree && (
        <Text
          delete
          type="secondary"
          style={{ display: "block", fontSize: 13 }}
        >
          {formatThousands(Math.round(course.price * 1.4))}
        </Text>
      )}
      <Title
        className="gradient-text"
        level={2}
        style={{
          margin: 0,
          // background: "linear-gradient(135deg,#667eea,#764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {isFree ? "Free" : formatThousands(course.price)}
      </Title>
    </>
  );
};

/* ─── CourseDetailPage ────────────────────────────────────────────────────── */
const CourseDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    enrolledCourseIds,
    wishlistIds,
    enroll,
    toggleWishlist,
    setEnrolledCourseIds,
  } = useCourseStore();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollChecked, setEnrollChecked] = useState(false);
  const [paying, setPaying] = useState(false);
  const [tab, setTab] = useState("overview");

  // Handle VNPay payment callback
  useEffect(() => {
    const payment = searchParams.get("payment");
    const courseId = searchParams.get("courseId");
    if (payment === "success" && courseId) {
      message.success("Payment successful! You can start learning now.");
      enroll(courseId);
      PaymentService.getEnrolledCourseIds()
        .then(setEnrolledCourseIds)
        .catch(() => {});
      navigate(`/courses/${courseId}`, { replace: true });
    } else if (payment === "failed") {
      message.error("Payment failed. Please try again.");
      navigate(`/courses/${id}`, { replace: true });
    } else if (payment === "error") {
      message.error("An error occurred during payment.");
      navigate(`/courses/${id}`, { replace: true });
    }
  }, [searchParams]);

  // Sync enrollment from server
  useEffect(() => {
    if (!isAuthenticated) {
      setEnrollChecked(true);
      return;
    }
    PaymentService.getEnrolledCourseIds()
      .then(setEnrolledCourseIds)
      .catch(() => {})
      .finally(() => setEnrollChecked(true));
  }, [isAuthenticated, id]);

  // Load course data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    CourseService.getCoursePreview(id)
      .then((data) => {
        if (!data) {
          message.error("Course not found");
          navigate(ROUTES.COURSES);
          return;
        }
        setCourse(data);
      })
      .catch(() => {
        message.error("Course not found");
        navigate(ROUTES.COURSES);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !enrollChecked) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!course) return null;

  // Derived state
  const courseId = course._id?.toString();
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const categoryName = course.category?.name ?? "";
  const isFree = course.price === 0;
  const isEnrolled = enrolledCourseIds.includes(courseId);
  const isOwner =
    !!user?._id &&
    (course.instructorId?._id?.toString() === user._id?.toString() ||
      course.instructorId?.toString() === user._id?.toString());
  const isAdmin = user?.role === "admin";
  const isUnlocked = isEnrolled || isOwner || isAdmin;
  const isWishlisted = wishlistIds.includes(courseId);

  const totalLessons = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );
  const totalQuizzes = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "quiz").length ?? 0),
    0,
  );
  const duration = formatDurationClock(course.totalDuration);

  // Handlers
  const handleBuy = async () => {
    if (!isAuthenticated) {
      message.info("Please log in to continue");
      navigate(ROUTES.LOGIN);
      return;
    }

    if (isFree) {
      setPaying(true);
      try {
        const res = await PaymentService.enrollFreeCourse(course._id);
        if (res?.success) {
          enroll(courseId);
          try {
            const ids = await PaymentService.getEnrolledCourseIds();
            setEnrolledCourseIds(ids);
          } catch (_) {}
          message.success("Enrolled in free course successfully!");
          navigate(`/student/learning/${course._id}`);
        } else {
          message.error(res?.message || "Enrollment failed. Please try again.");
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message;
        if (err?.response?.status === 400)
          message.warning(msg || "Cannot enroll in this course");
        else if (err?.response?.status === 404)
          message.error("Course not found");
        else message.error(msg || "An error occurred while enrolling");
      } finally {
        setPaying(false);
      }
      return;
    }

    setPaying(true);
    try {
      const res = await PaymentService.createPayment(course._id, "vnpay");
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        message.error("Could not create payment. Please try again.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      if (err?.response?.status === 400)
        message.warning(msg || "Cannot create payment");
      else message.error(msg || "An error occurred while creating payment");
    } finally {
      setPaying(false);
    }
  };

  const handleLearn = () => navigate(`/student/learning/${course._id}`);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    toggleWishlist(courseId);
    message.success(
      isWishlisted ? "Removed from wishlist" : "Added to wishlist",
    );
  };

  // Curriculum collapse items
  const collapseItems = (course.sections ?? []).map((sec, idx) => {
    const lessons = sec.items?.filter((i) => i.itemType === "lesson") ?? [];
    const quizzes = sec.items?.filter((i) => i.itemType === "quiz") ?? [];
    return {
      key: sec._id || idx,
      label: (
        <Space>
          <Text strong>{sec.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {lessons.length} lessons · {quizzes.length} quizzes
          </Text>
        </Space>
      ),
      children: (
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
                  padding: "8px 0",
                  borderBottom:
                    i < sec.items.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                {isQuiz ? (
                  <QuestionCircleOutlined style={{ color: "#8B5CF6" }} />
                ) : isUnlocked ? (
                  <PlayCircleOutlined style={{ color: "#10b981" }} />
                ) : (
                  <LockOutlined style={{ color: "#9ca3af" }} />
                )}
                <Text style={{ flex: 1 }}>{item.title}</Text>
                {dur > 0 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDurationClock(dur)}
                  </Text>
                )}
                {!isUnlocked && !isQuiz && (
                  <Tag
                    icon={<LockOutlined />}
                    color="default"
                    style={{ margin: 0 }}
                  >
                    Purchase to view
                  </Tag>
                )}
              </div>
            );
          })}
        </div>
      ),
    };
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Breadcrumb */}
        <Space style={{ marginBottom: 24, fontSize: 13 }}>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => navigate(ROUTES.COURSES)}
          >
            Courses
          </Button>
          <Text type="secondary">/</Text>
          {categoryName && (
            <>
              <Text type="secondary">{categoryName}</Text>
              <Text type="secondary">/</Text>
            </>
          )}
          <Text style={{ maxWidth: 300 }} ellipsis>
            {course.title}
          </Text>
        </Space>

        <Row gutter={[32, 32]}>
          {/* Left: Course info */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Thumbnail */}
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  aspectRatio: "16/9",
                  background: "linear-gradient(135deg,#667eea22,#764ba222)",
                }}
              >
                <img
                  src={
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"
                  }
                  alt={course.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Tags + Title */}
              <div>
                <Space wrap style={{ marginBottom: 12 }}>
                  {categoryName && <Tag color="blue">{categoryName}</Tag>}
                  <Tag>{course.level}</Tag>
                  {isEnrolled && (
                    <Tag icon={<UnlockOutlined />} color="success">
                      Enrolled
                    </Tag>
                  )}
                  {!isEnrolled && !isOwner && !isAdmin && (
                    <Tag icon={<LockOutlined />} color="warning">
                      Preview Only
                    </Tag>
                  )}
                  {(isOwner || isAdmin) && !isEnrolled && (
                    <Tag color="purple">{isAdmin ? "Admin" : "Instructor"}</Tag>
                  )}
                </Space>
                <Title level={2} style={{ marginBottom: 8 }}>
                  {course.title}
                </Title>
                <Paragraph type="secondary">{course.description}</Paragraph>
              </div>

              {/* Meta */}
              <CourseMeta
                instructor={instructor}
                course={course}
                duration={duration}
                totalLessons={totalLessons}
                totalQuizzes={totalQuizzes}
              />

              {/* Tabs */}
              <div>
                <Space
                  style={{
                    borderBottom: "2px solid #f0f0f0",
                    marginBottom: 20,
                  }}
                >
                  {["overview", "curriculum"].map((t) => (
                    <Button
                      key={t}
                      type="text"
                      onClick={() => setTab(t)}
                      style={{
                        fontWeight: tab === t ? 700 : 400,
                        color:
                          tab === t
                            ? "var(--color-primary,#667eea)"
                            : undefined,
                        borderBottom:
                          tab === t
                            ? "2px solid var(--color-primary,#667eea)"
                            : "2px solid transparent",
                        borderRadius: 0,
                      }}
                    >
                      {t === "overview" ? "Overview" : "Curriculum"}
                    </Button>
                  ))}
                </Space>

                {tab === "overview" && (
                  <CourseOverviewCards
                    totalLessons={totalLessons}
                    totalQuizzes={totalQuizzes}
                    duration={duration}
                    enrollmentCount={course.enrollmentCount ?? 0}
                  />
                )}

                {tab === "curriculum" && (
                  <div>
                    {collapseItems.length === 0 ? (
                      <Text type="secondary">No course content yet.</Text>
                    ) : (
                      <Collapse
                        items={collapseItems}
                        defaultActiveKey={[collapseItems[0]?.key]}
                      />
                    )}
                  </div>
                )}
              </div>
            </Space>
          </Col>

          {/* Right: Action card */}
          <Col xs={24} lg={8}>
            <div style={{ position: "sticky", top: 90 }}>
              <Card
                style={{
                  borderRadius: 20,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
              >
                {/* Price */}
                <div style={{ marginBottom: 20 }}>
                  <PriceBlock
                    isEnrolled={isEnrolled}
                    isFree={isFree}
                    course={course}
                  />
                </div>

                {/* CTA */}
                {isEnrolled ? (
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlayCircleOutlined />}
                    onClick={handleLearn}
                    style={{
                      borderRadius: 12,
                      height: 48,
                      fontSize: 16,
                      fontWeight: 700,
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
                    icon={isFree ? <CheckCircleOutlined /> : <TrophyOutlined />}
                    onClick={handleBuy}
                    className="btn-aurora"
                    style={{
                      borderRadius: 12,
                      height: 48,
                      fontSize: 16,
                      fontWeight: 700,
                      // background: "linear-gradient(135deg,#667eea,#764ba2)",
                      border: "none",
                    }}
                  >
                    {isFree ? "Enroll for Free" : "Buy Now"}
                  </Button>
                )}

                {/* Wishlist */}
                {!isEnrolled && (
                  <Button
                    block
                    size="large"
                    style={{ marginTop: 10, borderRadius: 12 }}
                    icon={
                      isWishlisted ? (
                        <HeartFilled style={{ color: "#ef4444" }} />
                      ) : (
                        <HeartOutlined />
                      )
                    }
                    onClick={handleWishlist}
                  >
                    {isWishlisted ? "Saved" : "Save Course"}
                  </Button>
                )}

                {/* Owner/Admin edit */}
                {(isOwner || isAdmin) && (
                  <Button
                    block
                    size="large"
                    icon={<EditOutlined />}
                    style={{ marginTop: 10, borderRadius: 12 }}
                    onClick={() =>
                      navigate(`/instructor/courses/edit/${course._id}`)
                    }
                  >
                    {isAdmin ? "Manage Course" : "Edit Course"}
                  </Button>
                )}

                <Divider />
                <CourseInfoSidebar
                  totalLessons={totalLessons}
                  totalQuizzes={totalQuizzes}
                  duration={duration}
                />
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;
