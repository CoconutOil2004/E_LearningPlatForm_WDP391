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
  Alert,
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
import { pageVariants } from "../../../utils/helpers";

const { Title, Text, Paragraph } = Typography;

const fmtDuration = (s) => {
  if (!s) return null;
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

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

  // ── Handle VNPay payment callback ─────────────────────────────────────────
  useEffect(() => {
    const payment = searchParams.get("payment");
    const courseId = searchParams.get("courseId");
    if (payment === "success" && courseId) {
      message.success("Thanh toán thành công! Bạn có thể bắt đầu học ngay.");
      enroll(courseId);
      PaymentService.getEnrolledCourseIds()
        .then(setEnrolledCourseIds)
        .catch(() => {});
      navigate(`/courses/${courseId}`, { replace: true });
    } else if (payment === "failed") {
      message.error("Thanh toán thất bại. Vui lòng thử lại.");
      navigate(`/courses/${id}`, { replace: true });
    } else if (payment === "error") {
      message.error("Có lỗi xảy ra trong quá trình thanh toán.");
      navigate(`/courses/${id}`, { replace: true });
    }
  }, [searchParams]);

  // ── Sync enrollment from server (fresh check every time) ──────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setEnrollChecked(true);
      return;
    }
    PaymentService.getEnrolledCourseIds()
      .then((ids) => {
        setEnrolledCourseIds(ids);
      })
      .catch(() => {})
      .finally(() => setEnrollChecked(true));
  }, [isAuthenticated, id]);

  // ── Load course data ───────────────────────────────────────────────────────
  // Compatible với cả BE mới (optionalAuth) lẫn BE cũ (protect + 403 cho unenrolled)
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const load = async () => {
      try {
        const { course: data, isEnrolled: serverEnrolled } =
          await CourseService.getCourseDetail(id);
        if (!data) throw new Error("Not found");
        setCourse(data);
        if (serverEnrolled && data._id) {
          const courseIdStr = data._id.toString();
          const current = useCourseStore.getState().enrolledCourseIds ?? [];
          if (!current.includes(courseIdStr)) {
            setEnrolledCourseIds([...current, courseIdStr]);
          }
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 403 || status === 401) {
          // BE cũ: student chưa enroll hoặc guest → fallback về preview public
          try {
            const preview = await CourseService.getCoursePreview(id);
            if (preview) {
              setCourse(preview);
            } else {
              message.error("Không tìm thấy khóa học");
              navigate(ROUTES.COURSES);
            }
          } catch {
            message.error("Không tìm thấy khóa học");
            navigate(ROUTES.COURSES);
          }
        } else {
          message.error("Không tìm thấy khóa học");
          navigate(ROUTES.COURSES);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading || !enrollChecked) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!course) return null;

  // ── Derived state ──────────────────────────────────────────────────────────
  const courseId = course._id?.toString();
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const categoryName = course.category?.name ?? "";
  const isFree = course.price === 0;

  // isEnrolled = student đã mua & có paymentStatus=paid
  const isEnrolled = enrolledCourseIds.includes(courseId);

  // isOwner = instructor sở hữu khóa này
  const isOwner =
    !!user?._id &&
    (course.instructorId?._id?.toString() === user._id?.toString() ||
      course.instructorId?.toString() === user._id?.toString());

  const isAdmin = user?.role === "admin";

  // isUnlocked = có quyền xem nội dung đầy đủ (cho syllabus display)
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
  const duration = fmtDuration(course.totalDuration);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBuy = async () => {
    // 1. Kiểm tra đăng nhập
    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để tiếp tục");
      navigate(ROUTES.LOGIN);
      return;
    }

    // 2. XỬ LÝ KHÓA HỌC FREE
    if (isFree) {
      setPaying(true);
      try {
        // ✅ GỌI API ENROLL-FREE
        const res = await PaymentService.enrollFreeCourse(course._id);

        if (res?.success) {
          // Cập nhật local state
          enroll(courseId);

          // Refresh danh sách enrolled courses từ server
          try {
            const ids = await PaymentService.getEnrolledCourseIds();
            setEnrolledCourseIds(ids);
          } catch (err) {
            console.warn("Failed to refresh enrolled courses:", err);
          }

          // Hiển thị thông báo thành công
          message.success("Đăng ký khóa học miễn phí thành công!");

          // Navigate đến trang học
          navigate(`/student/learning/${course._id}`);
        } else {
          message.error(res?.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Enroll free course error:", err);

        // Xử lý các loại lỗi cụ thể
        const errorMessage = err?.response?.data?.message || err?.message;

        if (err?.response?.status === 400) {
          // Course không phải FREE hoặc đã enroll
          message.warning(errorMessage || "Không thể đăng ký khóa học này");
        } else if (err?.response?.status === 404) {
          message.error("Không tìm thấy khóa học");
        } else {
          message.error(errorMessage || "Có lỗi xảy ra khi đăng ký khóa học");
        }
      } finally {
        setPaying(false);
      }
      return;
    }

    // 3. XỬ LÝ KHÓA HỌC TRẢ PHÍ → VNPAY
    setPaying(true);
    try {
      const res = await PaymentService.createPayment(course._id, "vnpay");

      if (res?.paymentUrl) {
        // Redirect đến VNPay payment gateway
        window.location.href = res.paymentUrl;
      } else {
        message.error("Không thể tạo đơn thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Create payment error:", err);

      const errorMessage = err?.response?.data?.message || err?.message;

      if (err?.response?.status === 400) {
        // Đã mua khóa học hoặc lỗi validation
        message.warning(errorMessage || "Không thể tạo đơn thanh toán");
      } else {
        message.error(errorMessage || "Có lỗi xảy ra khi tạo đơn thanh toán");
      }
    } finally {
      setPaying(false);
    }
  };

  const handleLearn = () => {
    navigate(`/student/learning/${course._id}`);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    toggleWishlist(courseId);
    message.success(
      isWishlisted
        ? "Đã xóa khỏi danh sách yêu thích"
        : "Đã thêm vào yêu thích",
    );
  };

  // ── Curriculum collapse items ──────────────────────────────────────────────
  const collapseItems = (course.sections ?? []).map((sec, idx) => {
    const lessons = sec.items?.filter((i) => i.itemType === "lesson") ?? [];
    const quizzes = sec.items?.filter((i) => i.itemType === "quiz") ?? [];
    return {
      key: sec._id || idx,
      label: (
        <Space>
          <Text strong>{sec.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {lessons.length} bài học · {quizzes.length} quiz
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
                    {fmtDuration(dur)}
                  </Text>
                )}
                {!isUnlocked && !isQuiz && (
                  <Tag
                    icon={<LockOutlined />}
                    color="default"
                    style={{ margin: 0 }}
                  >
                    Mua để xem
                  </Tag>
                )}
              </div>
            );
          })}
        </div>
      ),
    };
  });

  // ── Render ─────────────────────────────────────────────────────────────────
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
          {/* ── LEFT: Course info ── */}
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
                      Đã đăng ký
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
              <Space wrap size="large">
                <Space>
                  <TeamOutlined />
                  <Text>{instructor}</Text>
                </Space>
                <Space>
                  <StarFilled style={{ color: "#F59E0B" }} />
                  <Text strong>{Number(course.rating ?? 0).toFixed(1)}</Text>
                  <Text type="secondary">
                    ({(course.enrollmentCount ?? 0).toLocaleString()} học viên)
                  </Text>
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
                    {totalLessons} bài học · {totalQuizzes} quiz
                  </Text>
                </Space>
              </Space>

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
                      {t === "overview" ? "Tổng quan" : "Chương trình học"}
                    </Button>
                  ))}
                </Space>

                {tab === "overview" && (
                  <Row gutter={[16, 16]}>
                    {[
                      {
                        icon: <BookOutlined />,
                        label: `${totalLessons} Bài học`,
                      },
                      {
                        icon: <QuestionCircleOutlined />,
                        label: `${totalQuizzes} Quiz`,
                      },
                      { icon: <ClockCircleOutlined />, label: duration || "—" },
                      {
                        icon: <TeamOutlined />,
                        label: `${(course.enrollmentCount ?? 0).toLocaleString()} Học viên`,
                      },
                    ].map((item) => (
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
                )}

                {tab === "curriculum" && (
                  <div>
                    {collapseItems.length === 0 ? (
                      <Text type="secondary">Chưa có nội dung khóa học.</Text>
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

          {/* ── RIGHT: Action card ── */}
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
                  {isEnrolled ? (
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
                      <CheckCircleOutlined
                        style={{ color: "#059669", fontSize: 18 }}
                      />
                      <Text strong style={{ color: "#065f46" }}>
                        Bạn đã đăng ký khóa học này
                      </Text>
                    </div>
                  ) : (
                    <>
                      {!isFree && (
                        <Text
                          delete
                          type="secondary"
                          style={{ display: "block", fontSize: 13 }}
                        >
                          ${(course.price * 1.4).toFixed(2)}
                        </Text>
                      )}
                      <Title
                        level={2}
                        style={{
                          margin: 0,
                          background: "linear-gradient(135deg,#667eea,#764ba2)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {isFree ? "Miễn phí" : `$${course.price}`}
                      </Title>
                    </>
                  )}
                </div>

                {/* ── MAIN CTA: Học / Mua ─────────────────────────── */}
                {isEnrolled ? (
                  /* ✅ Đã mua → Bắt đầu học */
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
                    Bắt đầu học
                  </Button>
                ) : (
                  /* ❌ Chưa mua → Mua ngay / Đăng ký miễn phí */
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={paying}
                    icon={isFree ? <CheckCircleOutlined /> : <TrophyOutlined />}
                    onClick={handleBuy}
                    style={{
                      borderRadius: 12,
                      height: 48,
                      fontSize: 16,
                      fontWeight: 700,
                      background: "linear-gradient(135deg,#667eea,#764ba2)",
                      border: "none",
                    }}
                  >
                    {isFree ? "Đăng ký miễn phí" : "Mua ngay"}
                  </Button>
                )}

                {/* Wishlist button (chỉ khi chưa đăng ký) */}
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
                    {isWishlisted ? "Đã lưu" : "Lưu khóa học"}
                  </Button>
                )}

                {/* Owner/Admin: nút chỉnh sửa riêng biệt (secondary) */}
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
                    {isAdmin ? "Quản lý khóa học" : "Chỉnh sửa khóa học"}
                  </Button>
                )}

                {/* 30-day guarantee */}
                {!isFree && !isEnrolled && (
                  <Alert
                    message="Đảm bảo hoàn tiền 30 ngày"
                    type="info"
                    showIcon
                    style={{ marginTop: 12, borderRadius: 10 }}
                  />
                )}

                <Divider />

                {/* Course info list */}
                <Space direction="vertical" style={{ width: "100%" }}>
                  {[
                    { icon: <BookOutlined />, text: `${totalLessons} bài học` },
                    {
                      icon: <QuestionCircleOutlined />,
                      text: `${totalQuizzes} quiz`,
                    },
                    { icon: <ClockCircleOutlined />, text: duration || "—" },
                    { icon: <GlobalOutlined />, text: "Truy cập trọn đời" },
                    { icon: <TrophyOutlined />, text: "Chứng chỉ hoàn thành" },
                  ].map((item) => (
                    <Space key={item.text}>
                      <span style={{ color: "var(--color-primary,#667eea)" }}>
                        {item.icon}
                      </span>
                      <Text>{item.text}</Text>
                    </Space>
                  ))}
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;
