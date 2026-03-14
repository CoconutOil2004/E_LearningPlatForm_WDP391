import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogService from "../../../services/api/BlogService";
import CourseService from "../../../services/api/CourseService";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const { Title, Text, Paragraph } = Typography;

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryBg: "rgba(99,102,241,0.08)",
  mint: "#10b981",
  mintBg: "rgba(16,185,129,0.08)",
  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.08)",
  red: "#ef4444",
  redBg: "rgba(239,68,68,0.08)",
  border: "#f1f0fe",
  text: "#111827",
  textSub: "#6b7280",
  textMuted: "#9ca3af",
  gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  gradientGreen: "linear-gradient(135deg, #10b981, #059669)",
};

const card = {
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
};

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut", delay },
});

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "#6b7280",
    bg: "#f3f4f6",
    border: "#d1d5db",
    icon: <FileTextOutlined />,
    antdColor: "default",
  },
  pending: {
    label: "In Review",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fde68a",
    icon: <ClockCircleOutlined />,
    antdColor: "warning",
  },
  approved: {
    label: "Published",
    color: "#059669",
    bg: "#d1fae5",
    border: "#a7f3d0",
    icon: <CheckCircleOutlined />,
    antdColor: "success",
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fecaca",
    icon: <CloseCircleOutlined />,
    antdColor: "error",
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "In Review" },
  { key: "approved", label: "Published" },
  { key: "rejected", label: "Rejected" },
];

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, bg, icon, delay }) => (
  <motion.div {...up(delay)}>
    <Card bordered={false} style={{ ...card, background: bg || "white" }} bodyStyle={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Text style={{ fontSize: 12, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</Text>
          <div style={{ fontSize: 28, fontWeight: 900, color: color || C.text, lineHeight: 1.2, marginTop: 4 }}>{value}</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color }}>
          {icon}
        </div>
      </div>
    </Card>
  </motion.div>
);

// ─── Blog Preview Modal ─────────────────────────────────────────────────────
const BlogPreviewModal = ({ blog, open, onClose }) => {
  if (!blog) return null;
  const st = STATUS_CONFIG[blog.status] || STATUS_CONFIG.draft;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      styles={{ body: { padding: 0 } }}
      style={{ borderRadius: 20, overflow: "hidden" }}
    >
      {blog.thumbnail && (
        <div style={{ height: 240, overflow: "hidden" }}>
          <img src={blog.thumbnail} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Tag style={{ borderRadius: 20, fontWeight: 700, border: "none", background: st.bg, color: st.color }}>
            {st.icon} {st.label}
          </Tag>
          {blog.category?.name && (
            <Tag style={{ borderRadius: 20, fontWeight: 600, border: "none", background: C.primaryBg, color: C.primary }}>
              {blog.category.name}
            </Tag>
          )}
        </div>
        <Title level={3} style={{ margin: "0 0 10px", color: C.text }}>{blog.title}</Title>
        <Text style={{ color: C.textSub, fontSize: 14, display: "block", marginBottom: 16, lineHeight: 1.6 }}>{blog.summary}</Text>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
          <div
            style={{ fontSize: 14, lineHeight: 1.8, color: C.text }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
        {blog.rejectedReason && (
          <div style={{ background: C.redBg, border: `1px solid #fecaca`, borderRadius: 10, padding: "12px 16px" }}>
            <Text style={{ color: C.red, fontWeight: 700, fontSize: 13 }}>Rejection reason: </Text>
            <Text style={{ color: C.red, fontSize: 13 }}>{blog.rejectedReason}</Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Edit Modal ─────────────────────────────────────────────────────────────
const EditBlogModal = ({ blog, open, onClose, onSaved, categories }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (blog && open) {
      form.setFieldsValue({
        title: blog.title,
        summary: blog.summary,
        category: blog.category?._id || blog.category,
        thumbnail: blog.thumbnail,
      });
    }
  }, [blog, open, form]);

  const handleSave = async (status = "draft") => {
    try {
      const vals = await form.validateFields();
      setSaving(true);
      await BlogService.updateBlog(blog._id, { ...vals, status });
      message.success("Blog updated successfully!");
      onSaved();
      onClose();
    } catch (err) {
      if (!err?.errorFields) {
        message.error(err?.response?.data?.message || "Update failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<Title level={5} style={{ margin: 0 }}>Edit Blog Post</Title>}
      width={620}
      footer={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => handleSave("draft")} loading={saving}>Save Draft</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={() => handleSave("pending")} loading={saving}
            style={{ background: C.gradient, border: "none" }}>
            Submit for Review
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
          <Input.TextArea rows={3} style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select
            style={{ borderRadius: 8 }}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
          />
        </Form.Item>
        <Form.Item name="thumbnail" label="Cover Image URL">
          <Input style={{ borderRadius: 8 }} placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
const InstructorBlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [editBlog, setEditBlog] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    CourseService.getCategories().then(setCategories).catch(() => {});
    loadBlogs();
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [activeTab, pagination.current]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      if (activeTab !== "all") params.status = activeTab;
      if (search.trim()) params.search = search.trim();
      const res = await BlogService.getMyBlogs(params);
      setBlogs(res.data || []);
      setPagination((p) => ({ ...p, total: res.pagination?.totalItems || 0 }));
    } catch {
      message.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((p) => ({ ...p, current: 1 }));
    loadBlogs();
  };

  const handleSubmitForReview = async (blog) => {
    setSubmittingId(blog._id);
    try {
      await BlogService.submitForReview(blog._id);
      message.success("Blog submitted for review!");
      loadBlogs();
    } catch (err) {
      message.error(err?.response?.data?.message || "Submit failed.");
    } finally {
      setSubmittingId(null);
    }
  };

  // Stats from all blogs
  const stats = {
    total: blogs.length,
    draft: blogs.filter((b) => b.status === "draft").length,
    pending: blogs.filter((b) => b.status === "pending").length,
    approved: blogs.filter((b) => b.status === "approved").length,
    rejected: blogs.filter((b) => b.status === "rejected").length,
  };

  // Columns
  const columns = [
    {
      title: "Blog Post",
      key: "blog",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {r.thumbnail ? (
            <img src={r.thumbnail} alt="" style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 52, height: 40, borderRadius: 8, background: C.primaryBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileTextOutlined style={{ color: C.primary }} />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ fontSize: 13, color: C.text, display: "block", marginBottom: 2 }}
              ellipsis={{ tooltip: r.title }}>
              {r.title}
            </Text>
            <Text style={{ fontSize: 12, color: C.textMuted }} ellipsis>
              {r.summary?.slice(0, 70)}{r.summary?.length > 70 ? "..." : ""}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 130,
      render: (_, r) => (
        <Tag style={{ borderRadius: 20, border: "none", background: C.primaryBg, color: C.primary, fontWeight: 600, fontSize: 11 }}>
          {r.category?.name || "—"}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, r) => {
        const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
        return (
          <Tag style={{ borderRadius: 20, border: "none", background: st.bg, color: st.color, fontWeight: 700, fontSize: 11 }}>
            {st.icon} {st.label}
          </Tag>
        );
      },
    },
    {
      title: "Created",
      key: "date",
      width: 110,
      render: (_, r) => (
        <Text style={{ fontSize: 12, color: C.textSub }}>
          {new Date(r.createdAt).toLocaleDateString("vi-VN")}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Preview">
            <Button type="text" icon={<EyeOutlined />} size="small"
              style={{ color: C.primary }}
              onClick={() => setPreviewBlog(r)} />
          </Tooltip>
          {(r.status === "draft" || r.status === "rejected") && (
            <Tooltip title="Edit">
              <Button type="text" icon={<EditOutlined />} size="small"
                style={{ color: C.amber }}
                onClick={() => setEditBlog(r)} />
            </Tooltip>
          )}
          {r.status === "draft" && (
            <Tooltip title="Submit for Review">
              <Button type="text" icon={<SendOutlined />} size="small"
                loading={submittingId === r._id}
                style={{ color: C.mint }}
                onClick={() => handleSubmitForReview(r)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "28px 28px 40px" }}>

        {/* Header */}
        <motion.div {...up(0)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.primaryBg, border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 14px", marginBottom: 8 }}>
              <FileTextOutlined style={{ color: C.primary, fontSize: 12 }} />
              <Text style={{ color: C.primary, fontWeight: 700, fontSize: 12 }}>Instructor Portal</Text>
            </div>
            <Title level={3} style={{ margin: 0, background: C.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              My Blog Posts
            </Title>
            <Text style={{ color: C.textSub, fontSize: 13 }}>
              Manage, edit, and publish your articles
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate(ROUTES.INSTRUCTOR_BLOG_CREATE)}
            style={{ borderRadius: 12, fontWeight: 700, background: C.gradient, border: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)", height: 44, paddingInline: 24 }}
          >
            New Blog Post
          </Button>
        </motion.div>

        {/* Stats */}
        <Row gutter={[14, 14]} style={{ marginBottom: 22 }}>
          <Col xs={12} sm={6}>
            <StatCard label="Total" value={pagination.total} color={C.primary} icon={<FileTextOutlined />} delay={0.05} />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard label="Draft" value={blogs.filter(b => b.status === "draft").length} color={C.textSub} icon={<FileTextOutlined />} delay={0.1} />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard label="In Review" value={blogs.filter(b => b.status === "pending").length} color={C.amber} icon={<ClockCircleOutlined />} delay={0.15} />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard label="Published" value={blogs.filter(b => b.status === "approved").length} color={C.mint} icon={<CheckCircleOutlined />} delay={0.2} />
          </Col>
        </Row>

        {/* Table Card */}
        <motion.div {...up(0.15)}>
          <Card bordered={false} style={card} bodyStyle={{ padding: 0 }}>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setActiveTab(t.key); setPagination(p => ({ ...p, current: 1 })); }}
                    style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                      background: activeTab === t.key ? C.primaryBg : "transparent",
                      color: activeTab === t.key ? C.primary : C.textSub,
                      outline: activeTab === t.key ? `1px solid ${C.primary}30` : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <Input
                prefix={<SearchOutlined style={{ color: C.textMuted }} />}
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 220, borderRadius: 10 }}
              />
              <Tooltip title="Refresh">
                <Button icon={<ReloadOutlined />} onClick={loadBlogs} style={{ borderRadius: 10, borderColor: C.border }} />
              </Tooltip>
            </div>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={blogs}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page) => setPagination(p => ({ ...p, current: page })),
                showTotal: (total) => <Text style={{ fontSize: 12, color: C.textSub }}>{total} blogs</Text>,
                style: { padding: "12px 20px" },
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text style={{ color: C.textMuted }}>No blog posts yet</Text>}
                  >
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.INSTRUCTOR_BLOG_CREATE)}
                      style={{ background: C.gradient, border: "none", borderRadius: 10 }}>
                      Create your first blog
                    </Button>
                  </Empty>
                ),
              }}
              style={{ borderRadius: 0 }}
            />
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <BlogPreviewModal blog={previewBlog} open={!!previewBlog} onClose={() => setPreviewBlog(null)} />
      <EditBlogModal
        blog={editBlog}
        open={!!editBlog}
        onClose={() => setEditBlog(null)}
        onSaved={loadBlogs}
        categories={categories}
      />
    </motion.div>
  );
};

export default InstructorBlogPage;