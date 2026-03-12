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
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import StatsRow from "../../../components/admin/StatsRow";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import { COLOR, STATUS_CONFIG } from "../../../styles/adminTheme";

const { Text } = Typography;
const { Option } = Select;

const STATUS_TABS = ["all", "draft", "pending", "published", "rejected"];

const fmtDuration = (s) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  return h > 0 ? `${h}h` : `${Math.floor(s / 60)}m`;
};

// ─── AdminCoursesPage ─────────────────────────────────────────────────────────
const AdminCoursesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      CourseService.searchCourses({ page: 1, limit: 100 }),
      CourseService.getPendingCourses().catch(() => []),
    ])
      .then(([searchRes, pendingList]) => {
        const published = searchRes.courses ?? [];
        const pendingIds = new Set(
          (pendingList ?? []).map((c) => c._id?.toString()),
        );
        const merged = [
          ...(pendingList ?? []),
          ...published.filter((c) => !pendingIds.has(c._id?.toString())),
        ];
        setCourses(merged);
      })
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses
    .filter((c) => filterStatus === "all" || c.status === filterStatus)
    .filter(
      (c) => !search || c.title?.toLowerCase().includes(search.toLowerCase()),
    );

  const stats = [
    { title: "Total Courses", value: courses.length, prefix: <BookOutlined /> },
    {
      title: "Published",
      value: courses.filter((c) => c.status === "published").length,
      valueColor: COLOR.green,
    },
    {
      title: "In Review",
      value: courses.filter((c) => c.status === "pending").length,
      valueColor: COLOR.warning,
    },
    {
      title: "Total Enrollments",
      value: courses
        .reduce((a, c) => a + (c.enrollmentCount ?? 0), 0)
        .toLocaleString(),
      prefix: <TeamOutlined />,
    },
  ];

  const columns = [
    {
      title: "Course",
      key: "course",
      fixed: "left",
      width: 300,
      render: (_, record) => (
        <Space size={12}>
          <Image
            src={
              record.thumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=56&fit=crop"
            }
            width={64}
            height={44}
            style={{ borderRadius: 8, objectFit: "cover" }}
            preview={false}
          />
          <Space direction="vertical" size={0}>
            <Text
              strong
              style={{ color: COLOR.ocean }}
              ellipsis={{ tooltip: record.title }}
            >
              {record.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.category?.name ?? "—"} · {record.level}
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
          onClick={() => navigate(`/courses/${record._id}`)}
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
        {/* Toolbar */}
        <Space
          style={{
            marginBottom: 16,
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
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
            style={{ width: 160, borderRadius: 8 }}
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
          dataSource={filtered}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t) => `Total ${t} courses`,
          }}
        />
      </Card>
    </AdminPageLayout>
  );
};

export default AdminCoursesPage;
