import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
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
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  INSTRUCTOR_COLORS,
  INSTRUCTOR_STATUS_CONFIG,
} from "../../../../src/styles/instructorTheme";
import { FilterBar } from "../../../components/shared";
import CourseDetailModal from "../../../components/shared/CourseDetailModal";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import { ROUTES } from "../../../utils/constants";
import {
  formatDurationClock,
  formatThousands,
  pageVariants,
} from "../../../utils/helpers";

const { Text } = Typography;

// ─── Filter config ─────────────────────────────────────────────────────────────
const FILTER_CONFIG = [
  {
    key: "keyword",
    type: "search",
    placeholder: "Search by course name...",
    btnText: "Search",
    width: 280,
  },
  {
    key: "status",
    type: "select",
    label: "Status",
    width: 150,
    defaultValue: "",
    options: [
      { value: "", label: "All Status" },
      { value: "draft", label: "Draft" },
      { value: "pending", label: "In Review" },
      { value: "published", label: "Published" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  {
    key: "priceSort",
    type: "sort",
    label: "Price",
    width: 185,
    defaultValue: "",
    options: [
      { value: "", label: "Default order" },
      { value: "priceAsc", label: "Price: Low → High" },
      { value: "priceDesc", label: "Price: High → Low" },
    ],
  },
];

// ─── StatCards ─────────────────────────────────────────────────────────────────
const StatCards = ({ stats }) => (
  <Row gutter={[16, 16]} className="mb-6">
    {stats.map((stat, idx) => (
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
);

// ─── CourseRow ─────────────────────────────────────────────────────────────────
const CourseRow = ({ record }) => (
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
      <Text className="font-bold text-gray-900 truncate" title={record.title}>
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
            <CloseCircleOutlined style={{ color: "#DC2626", fontSize: 11 }} />
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
);

// ─── InstructorCoursesPage ─────────────────────────────────────────────────────
const InstructorCoursesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const [filterValues, setFilterValues] = useState({
    keyword: "",
    status: "",
    priceSort: "",
  });

  const [globalStats, setGlobalStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    students: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load global stats once (no filter)
  const loadStats = async () => {
    try {
      const list = await CourseService.getInstructorCourses();
      setGlobalStats({
        total: list.length,
        published: list.filter((c) => c.status === "published").length,
        pending: list.filter((c) => c.status === "pending").length,
        students: list.reduce((s, c) => s + (c.enrollmentCount || 0), 0),
      });
    } catch {
      /* silent */
    }
  };

  // Load courses – tất cả sort/filter đều do BE xử lý
  const loadCourses = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      try {
        const vals = { ...filterValues, ...overrides };
        const list = await CourseService.getInstructorCourses({
          status: vals.status,
          keyword: vals.keyword,
          sortBy: vals.priceSort || undefined,
        });
        setCourses(list ?? []);
      } catch {
        message.error("Error loading course list");
      } finally {
        setLoading(false);
      }
    },
    [filterValues],
  );

  useEffect(() => {
    loadStats();
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // FilterBar: onChange fires for select/sort immediately
  const handleFilterChange = (key, value) => {
    const next = { ...filterValues, [key]: value };
    setFilterValues(next);
    if (key !== "keyword") {
      loadCourses(next);
    }
  };

  // FilterBar: onSearch fires only on button/Enter for type:"search"
  const handleSearch = (val) => {
    const next = { ...filterValues, keyword: val ?? filterValues.keyword };
    setFilterValues(next);
    loadCourses(next);
  };

  const handleReset = () => {
    const reset = { keyword: "", status: "", priceSort: "" };
    setFilterValues(reset);
    loadCourses(reset);
  };

  const handleViewDetail = async (record) => {
    setSelectedCourse(record);
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const { course: full } = await CourseService.getCourseDetail(record._id);
      if (full) setSelectedCourse(full);
    } catch {
      /* keep basic */
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (courseId) => {
    setSubmittingId(courseId);
    try {
      await CourseService.submitCourse(courseId);
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, status: "pending" } : c)),
      );
      if (selectedCourse?._id === courseId)
        setSelectedCourse((p) => (p ? { ...p, status: "pending" } : p));
      loadStats();
    } catch {
      /* silent */
    } finally {
      setSubmittingId(null);
    }
  };

  const statCards = [
    {
      label: "Total Courses",
      value: globalStats.total,
      icon: <BookOutlined />,
      color: INSTRUCTOR_COLORS.primary,
      bg: `${INSTRUCTOR_COLORS.primary}15`,
    },
    {
      label: "Published",
      value: globalStats.published,
      icon: <CheckCircleOutlined />,
      color: INSTRUCTOR_COLORS.success,
      bg: `${INSTRUCTOR_COLORS.success}15`,
    },
    {
      label: "Pending Review",
      value: globalStats.pending,
      icon: <ClockCircleOutlined />,
      color: INSTRUCTOR_COLORS.warning,
      bg: `${INSTRUCTOR_COLORS.warning}15`,
    },
    {
      label: "Total Students",
      value: globalStats.students,
      icon: <TeamOutlined />,
      color: INSTRUCTOR_COLORS.accent,
      bg: `${INSTRUCTOR_COLORS.accent}15`,
    },
  ];

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_, record) => <CourseRow record={record} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s) => {
        const cfg =
          INSTRUCTOR_STATUS_CONFIG[s] || INSTRUCTOR_STATUS_CONFIG.draft;
        return (
          <Tag
            className="px-3 py-1 font-semibold border-none rounded-md"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price) => (
        <span className="font-bold text-gray-900">
          {price === 0 ? (
            <span className="text-green-500">Free</span>
          ) : (
            formatThousands(price)
          )}
        </span>
      ),
    },
    {
      title: "Students",
      dataIndex: "enrollmentCount",
      key: "enrollmentCount",
      width: 110,
      render: (count) => (
        <Space className="font-semibold text-gray-700">
          <TeamOutlined className="text-gray-400" />
          {(count || 0).toLocaleString()}
        </Space>
      ),
    },
    {
      title: "Duration",
      dataIndex: "totalDuration",
      key: "duration",
      width: 100,
      render: (d) => (
        <Text type="secondary" className="text-sm">
          {formatDurationClock(d)}
        </Text>
      ),
    },
    {
      title: "Actions",
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
    >
      {/* Header */}

      <div className="flex items-center justify-between pb-8">
        <div>
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: 26,
              fontWeight: 900,
              color: "#8B5CF6",
            }}
          >
            My Blog Posts
          </h2>
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

      {/* Stat cards */}
      <StatCards stats={statCards} />

      {/* Filter bar – giữa StatCards và Table */}
      <FilterBar
        filters={FILTER_CONFIG}
        values={filterValues}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        resultCount={courses.length}
        loading={loading}
        theme="purple"
        style={{ marginBottom: 16 }}
      />

      {/* Table */}
      <Card
        bordered={false}
        className="rounded-2xl"
        style={{
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
        }}
        bodyStyle={{ padding: "0 0 8px" }}
      >
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, className: "px-6 mt-2" }}
          className="instructor-table"
          locale={{ emptyText: "No courses found." }}
        />
      </Card>

      <CourseDetailModal
        course={selectedCourse}
        open={modalOpen}
        loading={detailLoading}
        onClose={() => {
          setModalOpen(false);
          setSelectedCourse(null);
        }}
      />
    </motion.div>
  );
};

export default InstructorCoursesPage;
