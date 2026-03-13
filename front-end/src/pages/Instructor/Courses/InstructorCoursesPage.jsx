import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SendOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  INSTRUCTOR_COLORS,
  INSTRUCTOR_STATUS_CONFIG,
} from "../../../../src/styles/instructorTheme";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const { Title, Text, Paragraph } = Typography;

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "In Review" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
];

const fmtDuration = (s) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const fmtDurationShort = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// ─── Course Detail Modal ──────────────────────────────────────────────────────
const CourseDetailModal = ({ course, open, onClose }) => {
  if (!course) return null;

  const statusCfg =
    INSTRUCTOR_STATUS_CONFIG[course.status] || INSTRUCTOR_STATUS_CONFIG.draft;

  const totalLessons = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );
  const totalQuizzes = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "quiz").length ?? 0),
    0,
  );

  const collapseItems = (course.sections ?? []).map((sec, si) => {
    const lessonCount =
      sec.items?.filter((i) => i.itemType === "lesson").length ?? 0;
    const quizCount =
      sec.items?.filter((i) => i.itemType === "quiz").length ?? 0;

    return {
      key: sec._id ?? si,
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text strong style={{ fontSize: 14 }}>
            {sec.title || `Section ${si + 1}`}
          </Text>
          <Space size={6}>
            {lessonCount > 0 && (
              <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                {lessonCount} lesson{lessonCount > 1 ? "s" : ""}
              </Tag>
            )}
            {quizCount > 0 && (
              <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>
                {quizCount} quiz
              </Tag>
            )}
          </Space>
        </div>
      ),
      children: (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {(sec.items ?? []).length === 0 ? (
            <Text type="secondary" style={{ fontSize: 13, padding: "8px 0" }}>
              No items in this section
            </Text>
          ) : (
            (sec.items ?? []).map((item, ii) => {
              const isLesson = item.itemType === "lesson";
              const dur = item.itemId?.duration;
              const hasVideo = !!item.itemId?.videoUrl;

              return (
                <div
                  key={item._id ?? ii}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: ii % 2 === 0 ? "#fafafa" : "#fff",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: isLesson ? "#EDE9FE" : "#F3E8FF",
                    }}
                  >
                    {isLesson ? (
                      <PlayCircleOutlined
                        style={{
                          fontSize: 13,
                          color: INSTRUCTOR_COLORS.primary,
                        }}
                      />
                    ) : (
                      <QuestionCircleOutlined
                        style={{ fontSize: 13, color: "#9333ea" }}
                      />
                    )}
                  </div>

                  <Text style={{ flex: 1, fontSize: 13 }}>{item.title}</Text>

                  <Space size={6}>
                    <Tag
                      style={{
                        margin: 0,
                        fontSize: 11,
                        background: isLesson ? "#EDE9FE" : "#F3E8FF",
                        color: isLesson ? INSTRUCTOR_COLORS.primary : "#9333ea",
                        border: "none",
                        borderRadius: 4,
                      }}
                    >
                      {isLesson ? "Lesson" : "Quiz"}
                    </Tag>
                    {isLesson && (
                      <Tag
                        style={{
                          margin: 0,
                          fontSize: 11,
                          background: hasVideo ? "#D1FAE5" : "#FEE2E2",
                          color: hasVideo ? "#059669" : "#DC2626",
                          border: "none",
                          borderRadius: 4,
                        }}
                      >
                        {hasVideo ? "Has Video" : "No Video"}
                      </Tag>
                    )}
                    {isLesson && dur > 0 && (
                      <Text
                        type="secondary"
                        style={{ fontSize: 11, whiteSpace: "nowrap" }}
                      >
                        {fmtDurationShort(dur)}
                      </Text>
                    )}
                    {!isLesson && item.itemId?.questions?.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.itemId.questions.length} questions
                      </Text>
                    )}
                  </Space>
                </div>
              );
            })
          )}
        </div>
      ),
    };
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      title={null}
      styles={{ body: { padding: 0 } }}
      style={{ top: 24 }}
      destroyOnClose
    >
      {/* ── Header banner ── */}
      <div
        style={{
          position: "relative",
          height: 200,
          background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
          borderRadius: "8px 8px 0 0",
          overflow: "hidden",
        }}
      >
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "20px 24px",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Tag
              style={{
                background: statusCfg.bg,
                color: statusCfg.text,
                border: `1px solid ${statusCfg.border}`,
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 6,
              }}
            >
              {statusCfg.label}
            </Tag>
          </div>
          <Title
            level={3}
            style={{
              color: "#fff",
              margin: 0,
              lineHeight: 1.3,
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}
          >
            {course.title}
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {course.instructorId?.fullname ||
              course.instructorId?.email ||
              "Instructor"}
          </Text>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "20px 24px" }}>
        {/* ── REJECTION REASON ── */}
        {course.status === "rejected" && (
          <div
            style={{
              background: "#FFF1F0",
              border: "1px solid #FFCCC7",
              borderLeft: "4px solid #FF4D4F",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 20,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <WarningOutlined
              style={{
                color: "#FF4D4F",
                fontSize: 18,
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <Text
                strong
                style={{
                  color: "#CF1322",
                  fontSize: 14,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Course Rejected
              </Text>
              <Text style={{ color: "#820014", fontSize: 13, lineHeight: 1.6 }}>
                {course.rejectionReason ||
                  "No reason provided. Please contact admin for details."}
              </Text>
              {course.rejectedAt && (
                <Text
                  type="secondary"
                  style={{ fontSize: 11, display: "block", marginTop: 6 }}
                >
                  Rejected on{" "}
                  {new Date(course.rejectedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              )}
            </div>
          </div>
        )}

        {/* ── Stats row ── */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {[
            {
              icon: <BookOutlined />,
              label: "Lessons",
              value: totalLessons,
              color: INSTRUCTOR_COLORS.primary,
              bg: "#EDE9FE",
            },
            {
              icon: <QuestionCircleOutlined />,
              label: "Quizzes",
              value: totalQuizzes,
              color: "#9333ea",
              bg: "#F3E8FF",
            },
            {
              icon: <ClockCircleOutlined />,
              label: "Duration",
              value: fmtDuration(course.totalDuration),
              color: "#0284c7",
              bg: "#E0F2FE",
            },
            {
              icon: <TeamOutlined />,
              label: "Students",
              value: (course.enrollmentCount ?? 0).toLocaleString(),
              color: "#059669",
              bg: "#D1FAE5",
            },
          ].map((item) => (
            <Col xs={12} sm={6} key={item.label}>
              <div
                style={{
                  background: item.bg,
                  borderRadius: 10,
                  padding: "12px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: item.color,
                    fontSize: 20,
                    marginBottom: 4,
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#111827",
                  }}
                >
                  {item.value || "—"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Course info ── */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {[
            { label: "Category", value: course.category?.name },
            { label: "Level", value: course.level },
            {
              label: "Price",
              value: course.price === 0 ? "Free" : `$${course.price}`,
              color: course.price === 0 ? "#059669" : "#7C3AED",
            },
          ].map((item) => (
            <Col xs={24} sm={8} key={item.label}>
              <div
                style={{
                  background: "#F9FAFB",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  strong
                  style={{ fontSize: 13, color: item.color || undefined }}
                >
                  {item.value ?? "—"}
                </Text>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Description ── */}
        {course.description && (
          <>
            <Text
              type="secondary"
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Description
            </Text>
            <Paragraph
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              {course.description}
            </Paragraph>
          </>
        )}

        <Divider style={{ margin: "0 0 16px" }} />

        {/* ── Curriculum ── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#6B7280",
            display: "block",
            marginBottom: 12,
          }}
        >
          Curriculum — {course.sections?.length ?? 0} section
          {(course.sections?.length ?? 0) !== 1 ? "s" : ""}
        </Text>

        {(course.sections?.length ?? 0) === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 0",
              background: "#F9FAFB",
              borderRadius: 10,
            }}
          >
            <BookOutlined
              style={{
                fontSize: 28,
                marginBottom: 8,
                display: "block",
                color: "#9CA3AF",
              }}
            />
            <Text type="secondary">No sections added yet</Text>
          </div>
        ) : (
          <Collapse
            items={collapseItems}
            defaultActiveKey={collapseItems.slice(0, 2).map((i) => i.key)}
            style={{
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
            }}
            expandIconPosition="end"
          />
        )}
      </div>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InstructorCoursesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = await CourseService.getInstructorCourses();
      setCourses(list ?? []);
    } catch {
      message.error("Error loading course list");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (record) => {
    setSelectedCourse(record);
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const { course: full } = await CourseService.getCourseDetail(record._id);
      if (full) setSelectedCourse(full);
    } catch {
      // giữ nguyên data cơ bản đã set
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
    setDetailLoading(false);
  };

  const handleSubmit = async (courseId) => {
    setSubmittingId(courseId);
    try {
      await CourseService.submitCourse(courseId);
      message.success("Course submitted for review!");
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, status: "pending" } : c)),
      );
      if (selectedCourse?._id === courseId) {
        setSelectedCourse((prev) =>
          prev ? { ...prev, status: "pending" } : prev,
        );
      }
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to submit for review",
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredCourses =
    activeTab === "all"
      ? courses
      : courses.filter((c) => c.status === activeTab);

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "published").length,
    pending: courses.filter((c) => c.status === "pending").length,
    students: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
  };

  const statCards = [
    {
      label: "Total Courses",
      value: stats.total,
      icon: <BookOutlined />,
      color: INSTRUCTOR_COLORS.primary,
      bg: `${INSTRUCTOR_COLORS.primary}15`,
    },
    {
      label: "Published",
      value: stats.published,
      icon: <CheckCircleOutlined />,
      color: INSTRUCTOR_COLORS.success,
      bg: `${INSTRUCTOR_COLORS.success}15`,
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: <ClockCircleOutlined />,
      color: INSTRUCTOR_COLORS.warning,
      bg: `${INSTRUCTOR_COLORS.warning}15`,
    },
    {
      label: "Total Students",
      value: stats.students,
      icon: <TeamOutlined />,
      color: INSTRUCTOR_COLORS.accent,
      bg: `${INSTRUCTOR_COLORS.accent}15`,
    },
  ];

  const columns = [
    {
      title: "COURSE",
      key: "course",
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-20 overflow-hidden bg-gray-100 border border-gray-200 rounded-lg h-14 shrink-0">
            <img
              src={
                record.thumbnail ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=160&h=112&fit=crop"
              }
              alt={record.title}
              className="object-cover w-full h-full"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <div className="flex flex-col max-w-[250px]">
            <Text
              className="font-bold text-gray-900 truncate"
              title={record.title}
            >
              {record.title}
            </Text>
            <div className="flex items-center gap-2 mt-1">
              <Text type="secondary" className="text-xs truncate">
                {record.category?.name || "Uncategorized"}
              </Text>
              <Text type="secondary" className="text-xs">
                •
              </Text>
              <Text className="text-xs font-semibold text-purple-600 capitalize">
                {record.level}
              </Text>
            </div>
            {record.status === "rejected" && record.rejectionReason && (
              <Tooltip title={record.rejectionReason} placement="bottom">
                <div className="flex items-center gap-1 mt-1 cursor-help">
                  <CloseCircleOutlined
                    style={{ color: "#DC2626", fontSize: 11 }}
                  />
                  <Text
                    style={{ color: "#DC2626", fontSize: 11 }}
                    className="truncate max-w-[180px]"
                  >
                    {record.rejectionReason}
                  </Text>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const config =
          INSTRUCTOR_STATUS_CONFIG[status] || INSTRUCTOR_STATUS_CONFIG.draft;
        return (
          <Tag
            className="px-3 py-1 font-semibold border-none rounded-md"
            style={{ backgroundColor: config.bg, color: config.text }}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "PRICE",
      dataIndex: "price",
      key: "price",
      width: 90,
      render: (price) => (
        <span className="font-bold text-gray-900">
          {price === 0 ? (
            <span className="text-green-500">Free</span>
          ) : (
            `$${price}`
          )}
        </span>
      ),
    },
    {
      title: "STUDENTS",
      dataIndex: "enrollmentCount",
      key: "enrollmentCount",
      width: 110,
      render: (count) => (
        <Space className="font-semibold text-gray-700">
          <TeamOutlined className="text-gray-400" />{" "}
          {(count || 0).toLocaleString()}
        </Space>
      ),
    },
    {
      title: "DURATION",
      dataIndex: "totalDuration",
      key: "duration",
      width: 100,
      render: (d) => (
        <Text type="secondary" className="text-sm">
          {fmtDuration(d)}
        </Text>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      width: 160,
      render: (_, record) => {
        const canEdit = ["draft", "rejected"].includes(record.status);
        const canSubmit = ["draft", "rejected"].includes(record.status);
        const isPending = record.status === "pending";
        return (
          <Space>
            <Tooltip title="View details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                className="text-purple-600 hover:bg-purple-50"
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            {(canEdit || isPending) && (
              <Tooltip title="Edit course">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  className="text-blue-500 hover:bg-blue-50"
                  onClick={() =>
                    navigate(`/instructor/courses/edit/${record._id}`)
                  }
                />
              </Tooltip>
            )}
            {canSubmit && (
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                loading={submittingId === record._id}
                onClick={() => handleSubmit(record._id)}
                style={{
                  background: `linear-gradient(135deg, ${INSTRUCTOR_COLORS.primary}, ${INSTRUCTOR_COLORS.primaryDark})`,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Submit
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Title level={2} className="m-0 font-black text-gray-900">
            My Courses
          </Title>
          <Text type="secondary" className="text-base">
            Manage and track your content performance
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_COURSE)}
          className="font-bold transition-all border-none shadow-md rounded-xl hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${INSTRUCTOR_COLORS.primary}, ${INSTRUCTOR_COLORS.primaryDark})`,
          }}
        >
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-8">
        {statCards.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              className="transition-all border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-sm"
              bodyStyle={{ padding: "20px" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center w-12 h-12 text-xl rounded-xl"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={TABS.map((tab) => ({
            key: tab.key,
            label: (
              <span className="text-sm font-semibold">
                {tab.label}
                <Tag className="ml-2 text-gray-600 bg-gray-100 border-none rounded-full">
                  {tab.key === "all"
                    ? courses.length
                    : courses.filter((c) => c.status === tab.key).length}
                </Tag>
              </span>
            ),
          }))}
          className="mb-4 instructor-tabs"
        />
        <Table
          columns={columns}
          dataSource={filteredCourses}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, className: "mt-6" }}
          className="instructor-table"
          locale={{ emptyText: "You have no courses in this status." }}
        />
      </div>

      {/* Detail Modal */}
      {detailLoading ? (
        <Modal
          open={modalOpen}
          onCancel={handleCloseModal}
          footer={null}
          width={780}
          title="Loading..."
          style={{ top: 24 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px 0",
            }}
          >
            <Spin size="large" />
          </div>
        </Modal>
      ) : (
        <CourseDetailModal
          course={selectedCourse}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </motion.div>
  );
};

export default InstructorCoursesPage;
