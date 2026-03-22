import { Col, message, Row, Skeleton, Space, Typography } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CourseReview from "../../../components/shared/CourseReview";
import CourseService from "../../../services/api/CourseService";
import PaymentService from "../../../services/api/PaymentService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { formatDurationClock, pageVariants } from "../../../utils/helpers";

import CourseBreadcrumb from "./CourseBreadcrumb";
import CourseHero from "./CourseHero";
import CourseSidebar from "./CourseSidebar";
import CurriculumAccordion from "./CurriculumAccordion";

const { Title } = Typography;

const SectionHeading = ({ children }) => (
  <Title level={4} style={{ marginBottom: 14, marginTop: 0, fontWeight: 700 }}>
    {children}
  </Title>
);

/* ─── CourseDetailPage ───────────────────────────────────────────────────── */
const CourseDetailPage = () => {
  const { id } = useParams();
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

  /* ── Sync enrolled IDs from server ── */
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

  /* ── Load course ── */
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
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px" }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!course) return null;

  /* ── Derived state ── */
  const courseId = course._id?.toString();
  const isFree = course.price === 0;

  // ✅ FIX: dùng enrolledCourseIds từ store (đã sync từ server trước khi render)
  const isEnrolled = enrolledCourseIds.includes(courseId);
  const isOwner =
    !!user?._id &&
    (course.instructorId?._id?.toString() === user._id?.toString() ||
      course.instructorId?.toString() === user._id?.toString());
  const isAdmin = user?.role === "admin";
  const isUnlocked = isEnrolled || isOwner || isAdmin;
  const isWishlisted = wishlistIds.includes(courseId);

  const categoryName = course.category?.name ?? "";
  const totalLessons = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );
  const totalQuizzes = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "quiz").length ?? 0),
    0,
  );
  const duration = formatDurationClock(course.totalDuration);
  const sections = course.sections ?? [];

  /* ── Handlers ── */
  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (isFree) {
      setPaying(true);
      try {
        const res = await PaymentService.enrollFreeCourse(course._id);
        if (res?.success) {
          enroll(courseId);
          PaymentService.getEnrolledCourseIds()
            .then(setEnrolledCourseIds)
            .catch(() => {});
          navigate(`/student/learning/${course._id}`);
        }
      } catch {
        // Interceptor tự hiện toast từ BE — không cần message thủ công ở đây
      } finally {
        setPaying(false);
      }
      return;
    }
    // Paid course → redirect to payment
    setPaying(true);
    try {
      const res = await PaymentService.createPayment(course._id, "vnpay");
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch {
      // Interceptor tự hiện toast từ BE
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
  };
  const handleEdit = () => navigate(`/instructor/courses/edit/${course._id}`);

  /* ── Render ── */
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px" }}>
        <CourseBreadcrumb
          categoryName={categoryName}
          courseTitle={course.title}
        />

        <Row gutter={[40, 32]} align="top">
          {/* ── LEFT ── */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={36} style={{ width: "100%" }}>
              {/* ① Hero */}
              <CourseHero
                course={course}
                categoryName={categoryName}
                isEnrolled={isEnrolled}
                isOwner={isOwner}
                isAdmin={isAdmin}
                totalLessons={totalLessons}
                totalQuizzes={totalQuizzes}
                duration={duration}
              />

              {/* ② Curriculum */}
              <div>
                <SectionHeading>Course Content</SectionHeading>
                {sections.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>No course content yet.</p>
                ) : (
                  <CurriculumAccordion
                    sections={sections}
                    isUnlocked={isUnlocked}
                    totalLessons={totalLessons}
                    duration={duration}
                  />
                )}
              </div>

              {/* ③ Reviews */}
              <div>
                <SectionHeading>Student Reviews</SectionHeading>
                {/*
                  ✅ FIX: truyền isEnrolled để CourseReview hiện WriteReviewBox
                  ✅ FIX: chỉ instructor/admin mới không thấy form review
                */}
                <CourseReview
                  courseId={courseId}
                  isEnrolled={isEnrolled}
                  isInstructor={isOwner || isAdmin}
                />
              </div>
            </Space>
          </Col>

          {/* ── RIGHT SIDEBAR ── */}
          <Col
            xs={24}
            lg={8}
            style={{ alignSelf: "flex-start", position: "sticky", top: 24 }}
          >
            <CourseSidebar
              course={course}
              isEnrolled={isEnrolled}
              isOwner={isOwner}
              isAdmin={isAdmin}
              isWishlisted={isWishlisted}
              isFree={isFree}
              paying={paying}
              totalLessons={totalLessons}
              totalQuizzes={totalQuizzes}
              duration={duration}
              onBuy={handleBuy}
              onLearn={handleLearn}
              onWishlist={handleWishlist}
              onEdit={handleEdit}
            />
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;