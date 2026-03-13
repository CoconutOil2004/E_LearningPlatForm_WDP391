import {
  BookOutlined,
  EyeOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Image,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import StatsRow from "../../../components/admin/StatsRow";
import CourseDetailModal from "../../../components/shared/CourseDetailModal";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import { COLOR, STATUS_CONFIG } from "../../../styles/adminTheme";

const { Text } = Typography;
const { Option } = Select;

const STATUS_TABS = [
  "all",
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
];

const fmtDuration = (s) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  return h > 0 ? `${h}h` : `${Math.floor(s / 60)}m`;
};

const AdminCoursesPage = () => {
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCourses = async (
    page = 1,
    pageSize = 10,
    status = "all",
    keyword = "",
  ) => {
    setLoading(true);
    try {
      const res = await CourseService.getAdminAllCourses({
        page,
        limit: pageSize,
        status: status !== "all" ? status : undefined,
        keyword: keyword.trim() || undefined,
      });
      setCourses(res.courses ?? []);
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
    fetchCourses(1, pagination.pageSize, filterStatus, search);
  }, []);
  useEffect(() => {
    const t = setTimeout(
      () => fetchCourses(1, pagination.pageSize, filterStatus, search),
      300,
    );
    return () => clearTimeout(t);
  }, [filterStatus, search]);

  const handleTableChange = (pag) =>
    fetchCourses(pag.current, pag.pageSize, filterStatus, search);

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
      width: 90,
      render: (p) => (
        <Text strong style={{ color: COLOR.ocean }}>
          {p === 0 ? "Free" : `$${p}`}
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
        <Text style={{ color: COLOR.gray600 }}>{fmtDuration(v)}</Text>
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
      <StatsRow items={stats} />
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <Space
          style={{
            marginBottom: 16,
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Input
            placeholder="Search courses..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 160 }}
          >
            {STATUS_TABS.map((s) => (
              <Option key={s} value={s}>
                {s === "all" ? "All Status" : (STATUS_CONFIG[s]?.label ?? s)}
              </Option>
            ))}
          </Select>
        </Space>
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
