import {
  CommentOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Modal,
  Rate,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import ReviewService from "../../../services/api/ReviewService";
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AdminReviewPage = () => {
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [courseOptions, setCourseOptions] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filterValues, setFilterValues] = useState({ keyword: "", rating: "", courseId: "" });

  // Load published courses cho dropdown filter
  useEffect(() => {
    CourseService.getAdminAllCourses({ status: "published", limit: 100 })
      .then(({ courses }) =>
        setCourseOptions(courses.map((c) => ({ value: c._id, label: c.title })))
      )
      .catch(() => {});
  }, []);

  const fetchReviews = async (page = 1, overrides = {}) => {
    setLoading(true);
    try {
      const vals = { ...filterValues, ...overrides };
      const res = await ReviewService.getAllReviews({
        page,
        limit: pagination.pageSize,
        search:   vals.keyword  || undefined,
        rating:   vals.rating   || undefined,
        courseId: vals.courseId || undefined,
      });
      if (res.success) {
        setData(res.reviews);
        setPagination((p) => ({ ...p, current: page, total: res.pagination?.total || 0 }));
      }
    } catch {
      message.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(1); }, []);

  // FilterBar handlers
  const handleFilterChange = (key, value) => {
    const next = { ...filterValues, [key]: value ?? "" };
    setFilterValues(next);
    if (key !== "keyword") fetchReviews(1, next);
  };

  const handleSearch = (val) => {
    const next = { ...filterValues, keyword: val ?? filterValues.keyword };
    setFilterValues(next);
    fetchReviews(1, next);
  };

  const handleReset = () => {
    const reset = { keyword: "", rating: "", courseId: "" };
    setFilterValues(reset);
    fetchReviews(1, reset);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Review",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this review? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await ReviewService.deleteReview(id);
          message.success("Review deleted successfully");
          fetchReviews(pagination.current);
        } catch {
          message.error("Failed to delete review");
        }
      },
    });
  };

  // Tính stats từ data hiện tại
  const avgRating = data.length
    ? (data.reduce((s, r) => s + (r.rating || 0), 0) / data.length).toFixed(1)
    : "—";
  const replied  = data.filter((r) => r.instructorReply).length;
  const noReply  = data.filter((r) => !r.instructorReply).length;

  const stats = [
    { title: "Total Reviews",    value: pagination.total, prefix: <StarFilled style={{ color: "#F59E0B" }} />, valueColor: COLOR.ocean },
    { title: "Avg Rating",       value: avgRating,         prefix: <StarFilled style={{ color: "#F59E0B" }} />, valueColor: "#F59E0B" },
    { title: "Instructor Replied", value: replied,         prefix: <CommentOutlined />,                        valueColor: COLOR.green },
    { title: "Awaiting Reply",   value: noReply,           prefix: <CommentOutlined />,                        valueColor: COLOR.warning },
  ];

  const filterConfig = [
    {
      key: "keyword",
      type: "search",
      placeholder: "Search by comment, user or course...",
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
    {
      key: "rating",
      type: "select",
      label: "Rating",
      width: 150,
      defaultValue: "",
      allowClear: true,
      options: [
        { value: "",  label: "All Ratings" },
        { value: "5", label: "⭐⭐⭐⭐⭐  5 Stars" },
        { value: "4", label: "⭐⭐⭐⭐  4 Stars" },
        { value: "3", label: "⭐⭐⭐  3 Stars" },
        { value: "2", label: "⭐⭐  2 Stars" },
        { value: "1", label: "⭐  1 Star" },
      ],
    },
  ];

  const columns = [
    {
      title: "Student",
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
          <Text strong style={{ fontSize: 13, color: COLOR.ocean }}>
            {record.userId?.fullname || "Unknown"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      sorter: (a, b) => a.rating - b.rating,
      render: (rating) => (
        <Space size={4}>
          <Rate disabled value={rating} style={{ fontSize: 13 }} />
          <Text strong style={{ fontSize: 13, color: "#F59E0B" }}>{rating}</Text>
        </Space>
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (content) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
          style={{ margin: 0, maxWidth: 350, fontSize: 13 }}
        >
          {content || <Text type="secondary" italic>No comment provided</Text>}
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
            background: "rgba(0,191,165,0.10)",
            color: COLOR.teal,
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
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 130,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 13 }}>{formatTimeAgo(date)}</Text>
      ),
    },
    // Actions trước Status (theo pattern chung)
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Delete review">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Tooltip>
      ),
    },
    // Status sau Actions
    {
      title: "Reply",
      key: "reply",
      width: 110,
      render: (_, record) =>
        record.instructorReply ? (
          <Tag color="success" style={{ borderRadius: 8, fontWeight: 600 }}>Replied</Tag>
        ) : (
          <Tag color="default" style={{ borderRadius: 8, fontWeight: 600 }}>No Reply</Tag>
        ),
    },
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Review Management"
        subtitle="Monitor platform quality and student feedback"
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
            showTotal: (t) => `Total ${t} reviews`,
            onChange: (page) => fetchReviews(page),
          }}
          size="middle"
        />
      </Card>
    </AdminPageLayout>
  );
};

export default AdminReviewPage;