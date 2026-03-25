import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  MailOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Card,
  Col,
  ConfigProvider,
  Empty,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { INSTRUCTOR_COLORS } from "../../../../src/styles/instructorTheme";
import { FilterBar } from "../../../components/shared";
import CourseService from "../../../services/api/CourseService";
import UserService from "../../../services/api/UserService";
import { pageVariants } from "../../../utils/helpers";

const { Text, Title } = Typography;

// ─── Filter config (tĩnh — course options load sau) ────────────────────────────
const buildFilterConfig = (courseOptions) => [
  {
    key: "keyword",
    type: "search",
    placeholder: "Search by name, email or course...",
    width: 290,
  },
  {
    key: "courseId",
    type: "select",
    label: "Course",
    width: 220,
    defaultValue: "",
    allowClear: true,
    options: [{ value: "", label: "All Courses" }, ...courseOptions],
  },
  {
    key: "completed",
    type: "select",
    label: "Status",
    width: 160,
    defaultValue: "",
    allowClear: true,
    options: [
      { value: "", label: "All Status" },
      { value: "false", label: "In Progress" },
      { value: "true", label: "Completed" },
    ],
  },
];

// ─── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, bg }) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 16,
      border: "1px solid #f0f0f0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}
    bodyStyle={{ padding: "20px 24px" }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Text
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </Text>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: color || "#111827",
            lineHeight: 1.2,
            marginTop: 4,
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          color,
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const InstructorStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filterValues, setFilterValues] = useState({
    keyword: "",
    courseId: "",
    completed: "",
  });

  // Stats tổng hợp (load lần đầu không filter)
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    courses: 0,
  });

  // Load course list cho filter dropdown
  useEffect(() => {
    CourseService.getInstructorCourses({ status: "published" })
      .then((list) =>
        setCourseOptions(list.map((c) => ({ value: c._id, label: c.title }))),
      )
      .catch(() => {});
  }, []);

  const fetchStudents = useCallback(
    async (page = 1, overrides = {}) => {
      setLoading(true);
      try {
        const vals = { ...filterValues, ...overrides };
        const res = await UserService.getInstructorStudents({
          page,
          limit: pagination.pageSize,
          search: vals.keyword || undefined,
          courseId: vals.courseId || undefined,
          completed: vals.completed !== "" ? vals.completed : undefined,
        });
        const list = res.students ?? [];
        setStudents(list);
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: res.pagination?.total ?? 0,
        }));
        // Cập nhật stats khi không có filter (page 1, no filter)
        if (!vals.keyword && !vals.courseId && vals.completed === "") {
          setStats({
            total: res.pagination?.total ?? 0,
            inProgress: list.filter((s) => !s.completed).length,
            completed: list.filter((s) => s.completed).length,
            courses: new Set(list.map((s) => s.course?._id)).size,
          });
        }
      } catch (err) {
        message.error(
          err?.response?.data?.message ?? "Failed to load student list",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, filterValues],
  );

  useEffect(() => {
    fetchStudents(1);
  }, []);

  // FilterBar handlers
  const handleFilterChange = (key, value) => {
    const next = { ...filterValues, [key]: value ?? "" };
    setFilterValues(next);
    if (key !== "keyword") {
      fetchStudents(1, next);
    }
  };

  const handleSearch = (val) => {
    const next = { ...filterValues, keyword: val ?? "" };
    setFilterValues(next);
    fetchStudents(1, next);
  };

  const handleReset = () => {
    const reset = { keyword: "", courseId: "", completed: "" };
    setFilterValues(reset);
    fetchStudents(1, reset);
  };

  // ─── Columns: Actions trước Status ─────────────────────────────────────────
  const columns = [
    {
      title: "Student",
      key: "student",
      width: 350,
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            src={record.student.avatarURL}
            size={42}
            style={{
              background: `linear-gradient(135deg, ${INSTRUCTOR_COLORS.primary}, ${INSTRUCTOR_COLORS.primaryDark})`,
              fontWeight: 800,
            }}
          >
            {!record.student.avatarURL &&
              record.student.fullname?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text
              strong
              style={{ fontSize: 14, display: "block", lineHeight: 1.3 }}
            >
              {record.student.fullname}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined style={{ fontSize: 10, marginRight: 4 }} />
              {record.student.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Enrolled Course",
      key: "course",
      render: (_, record) => (
        <Space>
          {record.course.thumbnail ? (
            <img
              src={record.course.thumbnail}
              alt=""
              style={{
                width: 44,
                height: 30,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
              }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 30,
                borderRadius: 6,
                background: `${INSTRUCTOR_COLORS.primary}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOutlined
                style={{ color: INSTRUCTOR_COLORS.primary, fontSize: 14 }}
              />
            </div>
          )}
          <Text style={{ fontSize: 13.5, fontWeight: 500 }}>
            {record.course.title}
          </Text>
        </Space>
      ),
    },
    {
      title: "Enrolled Date",
      dataIndex: "enrollmentDate",
      key: "date",
      width: 150,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {new Date(date).toLocaleDateString("en-GB")}
        </Text>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      width: 180,
      render: (_, record) => (
        <div style={{ paddingRight: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.completed ? "Completed" : "In Progress"}
            </Text>
            <Text
              strong
              style={{
                fontSize: 12,
                color: record.completed
                  ? INSTRUCTOR_COLORS.success
                  : INSTRUCTOR_COLORS.primary,
              }}
            >
              {record.progress}%
            </Text>
          </div>
          <Progress
            percent={record.progress}
            size="small"
            showInfo={false}
            strokeColor={
              record.completed
                ? INSTRUCTOR_COLORS.success
                : INSTRUCTOR_COLORS.primary
            }
            trailColor="#F0F5FF"
          />
        </div>
      ),
    },
    // Actions trước Status
    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 100,
    //   render: (_, record) => (
    //     <Tooltip title="View progress detail">
    //       <Tag
    //         icon={<LineChartOutlined />}
    //         style={{
    //           cursor: "pointer",
    //           borderRadius: 8,
    //           border: `1px solid ${INSTRUCTOR_COLORS.primary}40`,
    //           color: INSTRUCTOR_COLORS.primary,
    //           background: `${INSTRUCTOR_COLORS.primary}10`,
    //           fontWeight: 600,
    //           padding: "3px 10px",
    //         }}
    //       >
    //         Detail
    //       </Tag>
    //     </Tooltip>
    //   ),
    // },
    // Status sau Actions
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag
          icon={record.completed ? <CheckCircleOutlined /> : null}
          color={record.completed ? "success" : "processing"}
          style={{
            borderRadius: 20,
            border: "none",
            fontWeight: 700,
            fontSize: 12,
            padding: "3px 12px",
          }}
        >
          {record.completed ? "Completed" : "Learning"}
        </Tag>
      ),
    },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Title
              level={2}
              style={{
                margin: "0 0 4px",
                fontWeight: 900,
                color: INSTRUCTOR_COLORS.primary,
              }}
            >
              Student Management
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Track learners' progress and enrollment details
            </Text>
          </div>
        </div>

        {/* Stat cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <StatCard
              label="Total Students"
              value={pagination.total}
              icon={<TeamOutlined />}
              color={INSTRUCTOR_COLORS.primary}
              bg={`${INSTRUCTOR_COLORS.primary}15`}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              label="In Progress"
              value={stats.inProgress}
              icon={<LineChartOutlined />}
              color={INSTRUCTOR_COLORS.warning}
              bg={`${INSTRUCTOR_COLORS.warning}15`}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              label="Completed"
              value={stats.completed}
              icon={<CheckCircleOutlined />}
              color={INSTRUCTOR_COLORS.success}
              bg={`${INSTRUCTOR_COLORS.success}15`}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              label="Courses"
              value={courseOptions.length}
              icon={<BookOutlined />}
              color={INSTRUCTOR_COLORS.accent}
              bg={`${INSTRUCTOR_COLORS.accent}15`}
            />
          </Col>
        </Row>

        {/* FilterBar — dùng component dùng chung */}
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "12px 24px" }}
        >
          <FilterBar
            filters={buildFilterConfig(courseOptions)}
            values={filterValues}
            onChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
            theme="purple"
          />
        </Card>

        {/* Table */}
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #f0f0f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  rowHoverBg: `${INSTRUCTOR_COLORS.primary}06`,
                  headerBg: "#f8fafc",
                  headerColor: "#475569",
                  colorBgContainer: "transparent",
                },
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={students}
              loading={loading}
              rowKey="_id"
              scroll={{ x: 900 }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page) => fetchStudents(page),
                showTotal: (total) => `Total ${total} students`,
                showSizeChanger: false,
                style: { padding: "12px 24px" },
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text type="secondary">No students found</Text>
                    }
                  />
                ),
              }}
            />
          </ConfigProvider>
        </Card>
      </div>
    </motion.div>
  );
};

export default InstructorStudentsPage;
