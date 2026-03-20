import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import CommentService from "../../../services/api/CommentService";
import CourseService from "../../../services/api/CourseService";
import { COLOR } from "../../../styles/adminTheme";
import { formatTimeAgo } from "../../../utils/helpers";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import StatsRow from "../../../components/admin/StatsRow";
import { FilterBar } from "../../../components/shared";

const { Text, Paragraph } = Typography;

const cardStyle = {
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(0,119,182,0.06)",
  overflow: "hidden",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminCommentPage = () => {
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [courseOptions, setCourseOptions] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filterValues, setFilterValues] = useState({ keyword: "", courseId: "" });

  // Load published courses cho dropdown filter
  useEffect(() => {
    CourseService.getAdminAllCourses({ status: "published", limit: 100 })
      .then(({ courses }) =>
        setCourseOptions(courses.map((c) => ({ value: c._id, label: c.title })))
      )
      .catch(() => {});
  }, []);

  const fetchComments = async (page = 1, overrides = {}) => {
    setLoading(true);
    try {
      const vals = { ...filterValues, ...overrides };
      const res = await CommentService.getAllComments({
        page,
        limit: pagination.pageSize,
        search:   vals.keyword  || undefined,
        courseId: vals.courseId || undefined,
      });
      if (res.success) {
        setData(res.data);
        setPagination((p) => ({ ...p, current: page, total: res.pagination?.total || 0 }));
      }
    } catch {
      message.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(1); }, []);

  // FilterBar handlers
  const handleFilterChange = (key, value) => {
    const next = { ...filterValues, [key]: value ?? "" };
    setFilterValues(next);
    if (key !== "keyword") fetchComments(1, next);
  };

  const handleSearch = (val) => {
    const next = { ...filterValues, keyword: val ?? filterValues.keyword };
    setFilterValues(next);
    fetchComments(1, next);
  };

  const handleReset = () => {
    const reset = { keyword: "", courseId: "" };
    setFilterValues(reset);
    fetchComments(1, reset);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Comment",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this comment? This will also delete all its replies.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await CommentService.deleteComment(id);
          message.success("Comment deleted");
          fetchComments(pagination.current);
        } catch {
          message.error("Failed to delete comment");
        }
      },
    });
  };

  // Thống kê từ data hiện tại
  const topLevel  = data.filter((c) => !c.parentCommentId).length;
  const replies   = data.filter((c) =>  c.parentCommentId).length;

  const stats = [
    { title: "Total Comments",  value: pagination.total, prefix: <MessageOutlined />, valueColor: COLOR.ocean },
    { title: "Top-Level",       value: topLevel,          prefix: <MessageOutlined />, valueColor: COLOR.teal  },
    { title: "Replies",         value: replies,           prefix: <MessageOutlined />, valueColor: COLOR.green },
    { title: "Courses w/ Discussion", value: courseOptions.length, prefix: <UserOutlined />, valueColor: COLOR.warning },
  ];

  const filterConfig = [
    {
      key: "keyword",
      type: "search",
      placeholder: "Search by content, user or course...",
      width: 300,
    },
    {
      key: "courseId",
      type: "select",
      label: "Course",
      width: 220,
      defaultValue: "",
      allowClear: true,
      options: [
        { value: "", label: "All Courses" },
        ...courseOptions,
      ],
    },
  ];

  // Columns — no status column so no reorder needed; Actions is last
  const columns = [
    {
      title: "User",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.userId?.avatarURL}
            size={36}
            style={{ background: `linear-gradient(135deg, ${COLOR.ocean}, ${COLOR.teal})`, fontWeight: 700 }}
          >
            {record.userId?.fullname?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 13, color: COLOR.ocean, display: "block" }}>
              {record.userId?.fullname || "Unknown"}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.userId?.email || ""}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
          style={{ margin: 0, maxWidth: 400, fontSize: 13 }}
        >
          {content}
        </Paragraph>
      ),
    },
    {
      title: "Course",
      key: "course",
      width: 200,
      render: (_, record) => (
        <Tag
          style={{
            borderRadius: 8,
            border: "none",
            background: `rgba(0,119,182,0.08)`,
            color: COLOR.ocean,
            fontWeight: 600,
            fontSize: 12,
            maxWidth: 180,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          {record.courseId?.title || "Unknown Course"}
        </Tag>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: 110,
      render: (_, record) =>
        record.parentCommentId ? (
          <Tag color="cyan" style={{ borderRadius: 8, fontWeight: 600 }}>Reply</Tag>
        ) : (
          <Tag color="blue" style={{ borderRadius: 8, fontWeight: 600 }}>Comment</Tag>
        ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 140,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 13 }}>{formatTimeAgo(date)}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Delete comment">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Comment Management"
        subtitle="Review and moderate user discussions across all courses"
      />

      <StatsRow items={stats} />

      {/* FilterBar */}
      <Card bordered={false} style={{ ...cardStyle, marginBottom: 16 }} bodyStyle={{ padding: "12px 24px" }}>
        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
          theme="blue"
        />
      </Card>

      <Card bordered={false} style={cardStyle}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showTotal: (t) => `Total ${t} comments`,
            onChange: (page) => fetchComments(page),
          }}
          size="middle"
        />
      </Card>
    </AdminPageLayout>
  );
};

export default AdminCommentPage;