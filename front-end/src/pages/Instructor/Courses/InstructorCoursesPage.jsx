import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SendOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
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

const { Title, Text } = Typography;

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

const InstructorCoursesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = await CourseService.getInstructorCourses();
      setCourses(list ?? []);
    } catch (error) {
      message.error("Error loading course list");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (courseId) => {
    setSubmittingId(courseId);
    try {
      await CourseService.submitCourse(courseId);
      message.success("Course submitted for review!");
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, status: "pending" } : c)),
      );
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to submit for review",
      );
    } finally {
      setSubmittingId(null);
    }
  };

  // ─── Filter & Stats ──────────────────────────────────────────────────────────
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

  // ─── Table Columns Configuration ─────────────────────────────────────────────
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
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config =
          INSTRUCTOR_STATUS_CONFIG[status] || INSTRUCTOR_STATUS_CONFIG.draft;
        return (
          <Tag
            color={config.antdColor}
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
      render: (duration) => (
        <Text type="secondary" className="text-sm">
          {fmtDuration(duration)}
        </Text>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const canEdit = ["draft", "rejected"].includes(record.status);
        const canSubmit = ["draft", "rejected"].includes(record.status);
        const isPending = record.status === "pending";

        return (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-purple-600 hover:bg-purple-50"
              onClick={() => navigate(`/instructor/courses/${record._id}`)}
              title="View details"
            />

            {(canEdit || isPending) && (
              <Button
                type="text"
                icon={<EditOutlined />}
                className="text-blue-500 hover:bg-blue-50"
                onClick={() =>
                  navigate(`/instructor/courses/edit/${record._id}`)
                }
                title="Edit"
              />
            )}

            {canSubmit && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submittingId === record._id}
                onClick={() => handleSubmit(record._id)}
                className="bg-purple-500 border-none shadow-sm hover:bg-purple-600"
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
      {/* ── Header ── */}
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

      {/* ── Stats ── */}
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

      {/* ── Filter Tabs & Data Table ── */}
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
    </motion.div>
  );
};

export default InstructorCoursesPage;
