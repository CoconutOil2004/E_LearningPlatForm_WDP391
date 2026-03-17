import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import BlogService from "../../../services/api/BlogService";
import { COLOR } from "../../../styles/adminTheme";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";

const { Title, Text } = Typography;

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: COLOR.ocean, // Sync with image 1 vibrant blue
  primaryBg: "rgba(0,119,182,0.08)",
  mint: COLOR.green,
  mintBg: "rgba(0,200,83,0.08)",
  amber: COLOR.warning,
  amberBg: "rgba(255,167,38,0.08)",
  red: COLOR.error,
  redBg: "rgba(239,83,80,0.08)",
  border: "#f1f0fe",
  text: "#111827",
  textSub: "#6b7280",
};

const cardStyle = {
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  boxShadow: "0 2px 12px rgba(0,119,182,0.06)",
};

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "#6b7280", bg: "#f3f4f6", icon: <FileTextOutlined /> },
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7", icon: <ClockCircleOutlined /> },
  approved: { label: "Approved", color: "#059669", bg: "#d1fae5", icon: <CheckCircleOutlined /> },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fee2e2", icon: <CloseCircleOutlined /> },
};

const TABS = [
  { key: "all", label: "All Posts" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Published" },
  { key: "rejected", label: "Rejected" },
];

// ─── Modals ────────────────────────────────────────────────────────────────────

const BlogPreviewModal = ({ blog, open, onClose }) => {
  if (!blog) return null;
  const st = STATUS_CONFIG[blog.status] || STATUS_CONFIG.draft;
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={800} styles={{ body: { padding: 0 } }}>
      {blog.thumbnail && (
        <div style={{ height: 300, overflow: "hidden" }}>
          <img src={blog.thumbnail} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Tag color={st.bg === "#f3f4f6" ? "default" : ""} style={{ borderRadius: 20, fontWeight: 700, border: "none", background: st.bg, color: st.color }}>
            {st.icon} {st.label}
          </Tag>
          <Text type="secondary">By <strong>{blog.author?.fullname || "Unknown"}</strong></Text>
        </div>
        <Title level={2} style={{ color: COLOR.ocean, fontWeight: 900 }}>{blog.title}</Title>
        <Text style={{ color: C.textSub, fontSize: 16, display: "block", marginBottom: 20, fontStyle: "italic" }}>{blog.summary}</Text>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </div>
      <style>{`
        .blog-content img { max-width: 100%; border-radius: 8px; }
        .blog-content pre { background: #f4f4f4; padding: 12px; border-radius: 8px; overflow-x: auto; }
      `}</style>
    </Modal>
  );
};

const RejectModal = ({ blog, open, onClose, onConfirm }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    try {
      const vals = await form.validateFields();
      setLoading(true);
      await onConfirm(blog._id, vals.reason);
      form.resetFields();
      onClose();
    } catch (err) {
      // form error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Reject Blog Post"
      open={open}
      onCancel={onClose}
      onOk={handleReject}
      okText="Reject Post"
      okButtonProps={{ danger: true, loading }}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="Reason for rejection" rules={[{ required: true, message: "Please provide a reason" }]}>
          <Input.TextArea rows={4} placeholder="Explain why this blog is being rejected..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

const AdminBlogPage = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [previewBlog, setPreviewBlog] = useState(null);
  const [rejectBlog, setRejectBlog] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchBlogs();
  }, [activeTab, pagination.current]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined
      };
      if (activeTab !== "all") params.status = activeTab;

      const res = await BlogService.manageBlogs(params);
      if (res.success) {
        setBlogs(res.data);
        setPagination(p => ({ ...p, total: res.pagination?.totalItems || 0 }));
      }
    } catch (err) {
      // API interceptor handles the error message
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await BlogService.approveBlog(id);
      message.success("Blog post approved!");
      fetchBlogs();
    } catch (err) {
      message.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await BlogService.rejectBlog(id, reason);
      message.success("Blog post rejected.");
      fetchBlogs();
    } catch (err) {
      message.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Delete Blog Post",
      content: "Are you sure you want to delete this blog? This will be a soft delete.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await BlogService.adminDeleteBlog(id);
          message.success("Blog post deleted.");
          fetchBlogs();
        } catch (err) {
          // API interceptor handles the error message
        }
      }
    });
  };

  const columns = [
    {
      title: "Content",
      key: "content",
      render: (_, r) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar shape="square" size={48} src={r.thumbnail} icon={<FileTextOutlined />} />
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ display: "block", color: COLOR.ocean }} ellipsis>{r.title}</Text>
            <Text type="secondary" size="small" ellipsis>{r.summary}</Text>
          </div>
        </div>
      )
    },
    {
      title: "Author",
      key: "author",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            src={r.author?.avatarURL}
            style={{ background: `linear-gradient(135deg, ${COLOR.ocean}, ${COLOR.teal})`, fontWeight: 900 }}
          >
            {r.author?.fullname?.[0]?.toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: COLOR.ocean }}>{r.author?.fullname || "User"}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.author?.email}</Text>
          </Space>
        </div>
      )
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, r) => {
        const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
        return (
          <Tag style={{ borderRadius: 12, border: "none", background: st.bg, color: st.color, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px" }}>
            {st.label}
          </Tag>
        );
      }
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN")
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, r) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewBlog(r)} />
          </Tooltip>

          {r.status === "pending" && (
            <>
              <Tooltip title="Approve">
                <Button type="text" icon={<CheckCircleOutlined />} style={{ color: COLOR.green }} onClick={() => handleApprove(r._id)} />
              </Tooltip>
              <Tooltip title="Reject">
                <Button type="text" icon={<CloseCircleOutlined />} style={{ color: COLOR.error }} onClick={() => setRejectBlog(r)} />
              </Tooltip>
            </>
          )}

          <Tooltip title="Delete">
            <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(r._id)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Blog Management"
        subtitle="Review and manage platform articles"
        extra={
          <Space>
            <Input
              placeholder="Search by title..."
              prefix={<SearchOutlined />}
              style={{ width: 250, borderRadius: 8 }}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => { setPagination(p => ({ ...p, current: 1 })); fetchBlogs(); }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchBlogs} />
          </Space>
        }
      />

      <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLOR.gray100}`, display: "flex", gap: 8 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setPagination(p => ({ ...p, current: 1 })); }}
              style={{
                padding: "6px 20px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: activeTab === t.key ? COLOR.ocean : "transparent",
                color: activeTab === t.key ? "#fff" : COLOR.gray600,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          dataSource={blogs}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page) => setPagination(p => ({ ...p, current: page })),
          }}
          locale={{ emptyText: <Empty description="No blogs found" /> }}
          style={{ padding: "0" }}
        />
      </Card>

      <BlogPreviewModal blog={previewBlog} open={!!previewBlog} onClose={() => setPreviewBlog(null)} />
      <RejectModal blog={rejectBlog} open={!!rejectBlog} onClose={() => setRejectBlog(null)} onConfirm={handleReject} />
    </AdminPageLayout>
  );
};

export default AdminBlogPage;
