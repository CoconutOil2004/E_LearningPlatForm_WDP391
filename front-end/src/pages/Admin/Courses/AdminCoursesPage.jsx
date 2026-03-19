import { BookOutlined, EyeOutlined, TeamOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Image,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import StatsRow from "../../../components/admin/StatsRow";
import { FilterBar } from "../../../components/shared";
import CourseDetailModal from "../../../components/shared/CourseDetailModal";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import { COLOR, STATUS_CONFIG } from "../../../styles/adminTheme";
import { formatDurationClock, formatThousands } from "../../../utils/helpers";

const { Text } = Typography;

// ─── Filter config ─────────────────────────────────────────────────────────────
const FILTER_CONFIG = [
  {
    key: "keyword",
    type: "search",
    placeholder: "Search by course name...",
    btnText: "Search",
    width: 290,
  },
  {
    key: "status",
    type: "select",
    label: "Status",
    width: 155,
    defaultValue: "all",
    options: [
      { value: "all", label: "All Status" },
      { value: "draft", label: "Draft" },
      { value: "pending", label: "In Review" },
      { value: "published", label: "Published" },
      { value: "rejected", label: "Rejected" },
      { value: "archived", label: "Archived" },
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
      { value: "asc", label: "Price: Low → High" },
      { value: "desc", label: "Price: High → Low" },
    ],
  },
];

// ─── AdminCoursesPage ──────────────────────────────────────────────────────────
const AdminCoursesPage = () => {
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Single filter values object
  const [filterValues, setFilterValues] = useState({
    keyword: "",
    status: "all",
    priceSort: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCourses = async ({
    page = 1,
    pageSize = pagination.pageSize,
    vals = filterValues,
  } = {}) => {
    setLoading(true);
    try {
      const res = await CourseService.getAdminAllCourses({
        page,
        limit: pageSize,
        status: vals.status !== "all" ? vals.status : undefined,
        keyword: vals.keyword.trim() || undefined,
      });
      const list = res.courses ?? [];
      const sort = vals.priceSort;
      const sorted =
        sort === "asc"
          ? [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
          : sort === "desc"
            ? [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
            : list;
      setCourses(sorted);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: res.total ?? 0,
      }));
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // FilterBar: onChange for select/sort fires immediately
  const handleFilterChange = (key, value) => {
    const next = { ...filterValues, [key]: value };
    setFilterValues(next);
    if (key !== "keyword") {
      fetchCourses({ page: 1, vals: next });
    }
  };

  // FilterBar: onSearch fires only on button/Enter
  const handleSearch = (val) => {
    const next = { ...filterValues, keyword: val ?? filterValues.keyword };
    setFilterValues(next);
    fetchCourses({ page: 1, vals: next });
  };

  const handleReset = () => {
    const reset = { keyword: "", status: "all", priceSort: "" };
    setFilterValues(reset);
    fetchCourses({ page: 1, vals: reset });
  };

  const handleTableChange = (pag) =>
    fetchCourses({ page: pag.current, pageSize: pag.pageSize });

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

  const statusCounts = {
    published: courses.filter((c) => c.status === "published").length,
    pending: courses.filter((c) => c.status === "pending").length,
    enrollments: courses.reduce((a, c) => a + (c.enrollmentCount ?? 0), 0),
  };

  const stats = [
    {
      title: "Total Courses",
      value: pagination.total,
      prefix: <BookOutlined />,
    },
    {
      title: "Published (page)",
      value: statusCounts.published,
      valueColor: COLOR.green,
    },
    {
      title: "In Review (page)",
      value: statusCounts.pending,
      valueColor: COLOR.warning,
    },
    {
      title: "Enrollments (page)",
      value: statusCounts.enrollments.toLocaleString(),
      prefix: <TeamOutlined />,
    },
  ];

  const columns = [
    {
      title: "Course",
      key: "course",
      fixed: "left",
      width: 320,
      render: (_, record) => (
        <Space size={12}>
          <div
            style={{
              width: 72,
              height: 48,
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              background: "#f0f0f0",
            }}
          >
            <Image
              src={
                record.thumbnail ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=56&fit=crop"
              }
              width={72}
              height={48}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              preview={false}
            />
          </div>
          <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
            <Text
              strong
              style={{ color: COLOR.ocean, display: "block", maxWidth: 200 }}
              ellipsis={{ tooltip: record.title }}
            >
              {record.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.category?.name ?? "—"} · {record.level ?? "—"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Instructor",
      key: "instructor",
      width: 180,
      render: (_, record) => {
        const name =
          record.instructorId?.fullname ?? record.instructorId?.email ?? "—";
        return (
          <Space size={8}>
            <Avatar
              size={28}
              style={{
                background: `linear-gradient(135deg, ${COLOR.teal}, ${COLOR.ocean})`,
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              {name[0]?.toUpperCase()}
            </Avatar>
            <Text style={{ fontSize: 13 }}>{name}</Text>
          </Space>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
        return (
          <Tag
            color={cfg.antdColor}
            style={{ fontWeight: 700, borderRadius: 8 }}
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
      render: (p) => (
        <Text strong style={{ color: p === 0 ? COLOR.green : COLOR.ocean }}>
          {p === 0 ? "Free" : formatThousands(p)}
        </Text>
      ),
    },
    {
      title: "Students",
      dataIndex: "enrollmentCount",
      key: "students",
      width: 100,
      render: (v) => (
        <Text style={{ color: COLOR.gray700 }}>
          {(v ?? 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Duration",
      dataIndex: "totalDuration",
      key: "duration",
      width: 100,
      render: (v) => (
        <Text style={{ color: COLOR.gray600 }}>
          {formatDurationClock(v) ?? "—"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
          style={{ borderRadius: 8 }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Course Management"
        subtitle="View and manage all courses across the platform"
      />

      {/* Stat cards */}
      <StatsRow items={stats} />

      {/* Filter bar – giữa StatsRow và Table */}
      <FilterBar
        filters={FILTER_CONFIG}
        values={filterValues}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        resultCount={pagination.total}
        loading={loading}
        theme="blue"
        style={{ marginBottom: 16 }}
      />

      {/* Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <Table
          columns={columns}
          dataSource={courses}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (t) => `Total ${t} courses`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={handleTableChange}
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
    </AdminPageLayout>
  );
};

export default AdminCoursesPage;
