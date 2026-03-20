import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  LoadingOutlined,
  PlusOutlined,

  SaveOutlined,

  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
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
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogTinyEditor from "../../../components/blog/BlogTinyEditor";
import BlogService from "../../../services/api/BlogService";
import CourseService from "../../../services/api/CourseService";
import UserService from "../../../services/api/UserService";
import { FilterBar } from "../../../components/shared";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const { Title, Text } = Typography;

const C = {
  primary: "#6366f1",
  primaryBg: "rgba(99,102,241,0.08)",
  mint: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  redBg: "rgba(239,68,68,0.08)",
  border: "#f1f0fe",
  text: "#111827",
  textSub: "#6b7280",
  textMuted: "#9ca3af",
  gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
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

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "#6b7280",
    bg: "#f3f4f6",
    icon: <FileTextOutlined />,
  },
  pending: {
    label: "In Review",
    color: "#d97706",
    bg: "#fef3c7",
    icon: <ClockCircleOutlined />,
  },
  approved: {
    label: "Published",
    color: "#059669",
    bg: "#d1fae5",
    icon: <CheckCircleOutlined />,
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "#fee2e2",
    icon: <CloseCircleOutlined />,
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "In Review" },
  { key: "approved", label: "Published" },
  { key: "rejected", label: "Rejected" },
];

const StatCard = ({ label, value, color, icon, delay }) => (
  <motion.div {...up(delay)}>
    <Card bordered={false} style={card} bodyStyle={{ padding: "20px 22px" }}>
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
              fontSize: 12,
              fontWeight: 700,
              color: C.textSub,
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
              color: color || C.text,
              lineHeight: 1.2,
              marginTop: 4,
            }}
          >
            {value}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: color + "22",
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
  </motion.div>
);

// ─── Blog Preview Modal ─────────────────────────────────────────────────────────
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
          <img
            src={blog.thumbnail}
            alt="cover"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ padding: "28px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Tag
            style={{
              borderRadius: 20,
              fontWeight: 700,
              border: "none",
              background: st.bg,
              color: st.color,
            }}
          >
            {st.icon} {st.label}
          </Tag>
          {blog.category?.name && (
            <Tag
              style={{
                borderRadius: 20,
                fontWeight: 600,
                border: "none",
                background: C.primaryBg,
                color: C.primary,
              }}
            >
              {blog.category.name}
            </Tag>
          )}
        </div>
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: 22,
            fontWeight: 800,
            color: C.text,
          }}
        >
          {blog.title}
        </h3>
        <Text
          style={{
            color: C.textSub,
            fontSize: 14,
            display: "block",
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          {blog.summary}
        </Text>
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 16,
            marginBottom: 16,
            fontSize: 14,
            lineHeight: 1.8,
            color: C.text,
          }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        {blog.rejectedReason && (
          <div
            style={{
              background: C.redBg,
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "12px 16px",
            }}
          >
            <Text style={{ color: C.red, fontWeight: 700, fontSize: 13 }}>
              Rejection reason:{" "}
            </Text>
            <Text style={{ color: C.red, fontSize: 13 }}>
              {blog.rejectedReason}
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Edit Blog Modal ────────────────────────────────────────────────────────────
const EditBlogModal = ({ blog, open, onClose, onSaved, categories }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);

  useEffect(() => {
    if (blog && open) {
      form.setFieldsValue({
        title: blog.title,
        summary: blog.summary,
        category: blog.category?._id || blog.category,
        content: blog.content || "",
      });
      setThumbnail(blog.thumbnail || "");
    }
  }, [blog, open]);

  // Save as draft — blog stays in "draft" so instructor can keep editing
  const handleSave = async (submitAfter = false) => {
    try {
      const vals = await form.validateFields();
      setSaving(true);
      await BlogService.updateBlog(blog._id, {
        title: vals.title.trim(),
        summary: vals.summary.trim(),
        category: vals.category,
        content: vals.content,
        thumbnail,
        status: "draft",
      });
      if (submitAfter) {
        await BlogService.submitForReview(blog._id);
        message.success("Blog updated and submitted for review!");
      } else {
        message.success("Draft saved successfully!");
      }
      onSaved();
      onClose();
    } catch (err) {
      // API interceptor handles the error message
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EditOutlined style={{ color: C.primary }} />
          <span style={{ fontWeight: 800, color: C.text }}>Edit Blog Post</span>
          {blog?.status === "rejected" && (
            <Tag
              style={{
                borderRadius: 20,
                border: "none",
                background: "#fee2e2",
                color: "#dc2626",
                fontWeight: 700,
                fontSize: 11,
                marginLeft: 4,
              }}
            >
              Rejected
            </Tag>
          )}
        </div>
      }
      width={920}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={() => handleSave(false)}
            loading={saving}
            style={{ borderRadius: 10, fontWeight: 700 }}
          >
            Save Draft
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSave(true)}
            loading={saving}
            style={{
              background: C.gradient,
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            Submit for Review
          </Button>
        </Space>
      }
    >
      {blog?.rejectedReason && (
        <div
          style={{
            background: C.redBg,
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <ExclamationCircleOutlined
            style={{ color: C.red, marginTop: 2, flexShrink: 0 }}
          />
          <div>
            <Text
              style={{
                color: C.red,
                fontWeight: 700,
                fontSize: 13,
                display: "block",
              }}
            >
              Rejection reason:
            </Text>
            <Text style={{ color: C.red, fontSize: 13 }}>
              {blog.rejectedReason}
            </Text>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 4 }}
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
      >
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: "Title is required" },
                { max: 255 },
              ]}
            >
              <Input
                style={{ borderRadius: 8, fontSize: 15, fontWeight: 600 }}
                placeholder="Blog title..."
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select
                style={{ borderRadius: 8 }}
                placeholder="Select category"
                options={categories.map((c) => ({
                  value: c._id,
                  label: c.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="summary"
          label="Summary"
          rules={[
            { required: true, message: "Summary is required" },
            { max: 1000 },
          ]}
        >
          <Input.TextArea
            rows={2}
            style={{ borderRadius: 8, resize: "none" }}
            placeholder="Short summary..."
          />
        </Form.Item>

        {/* Cover Image */}
        <Form.Item label="Cover Image">
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {thumbnail && (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={thumbnail}
                  alt="thumb"
                  style={{
                    width: 130,
                    height: 78,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setThumbnail("")}
                  style={{
                    position: "absolute",
                    top: -7,
                    right: -7,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: C.red,
                    border: "2px solid white",
                    color: "white",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={async (file) => {
                if (!file.type.startsWith("image/")) {
                  message.error("Only image files allowed!");
                  return false;
                }
                if (file.size / 1024 / 1024 > 5) {
                  message.error("Max 5MB!");
                  return false;
                }
                setUploadingThumb(true);
                try {
                  const res = await UserService.uploadImage(file);
                  if (res?.url) {
                    setThumbnail(res.url);
                    message.success("Cover uploaded!");
                  } else message.error("Upload failed.");
                } catch {
                  message.error("Upload failed.");
                } finally {
                  setUploadingThumb(false);
                }
                return false;
              }}
            >
              <Button
                icon={uploadingThumb ? <LoadingOutlined /> : <UploadOutlined />}
                loading={uploadingThumb}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                {thumbnail ? "Change Cover" : "Upload Cover"}
              </Button>
            </Upload>
            {!thumbnail && (
              <Input
                placeholder="Or paste image URL..."
                style={{ borderRadius: 8, flex: 1, minWidth: 180 }}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            )}
          </div>
        </Form.Item>

        {/* TinyMCE — same pattern as CreateBlogPage */}
        <Form.Item
          label="Blog Content"
          name="content"
          trigger="onEditorChange"
          validateTrigger={["onEditorChange"]}
          rules={[{ required: true, message: "Please write the blog content" }]}
          required
        >
          <BlogTinyEditor
            height="55vh"
            placeholder="Write your blog content..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Delete Confirm Modal ───────────────────────────────────────────────────────
const DeleteConfirmModal = ({ blog, open, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await BlogService.deleteOwnBlog(blog._id);
      message.success("Blog deleted successfully.");
      onDeleted();
      onClose();
    } catch (err) {
      // API interceptor handles the error message
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: C.red,
          }}
        >
          <ExclamationCircleOutlined />
          <span>Delete Blog Post</span>
        </div>
      }
      footer={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            loading={loading}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Space>
      }
      width={420}
    >
      <p
        style={{
          color: C.textSub,
          fontSize: 14,
          lineHeight: 1.6,
          marginTop: 8,
        }}
      >
        Are you sure you want to delete{" "}
        <strong style={{ color: C.text }}>"{blog?.title}"</strong>?<br />
        This action cannot be undone.
      </p>
    </Modal>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const InstructorBlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState([]);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [editBlog, setEditBlog] = useState(null);
  const [deleteBlog, setDeleteBlog] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [filterValues, setFilterValues] = useState({ keyword: "", category: "" });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    CourseService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [activeTab, pagination.current, filterValues.category]);

  const loadBlogs = async (overrides = {}) => {
    setLoading(true);
    try {
      const vals = { ...filterValues, ...overrides };
      const params = { page: pagination.current, limit: pagination.pageSize };
      if (activeTab !== "all") params.status = activeTab;
      if (vals.keyword.trim()) params.search = vals.keyword.trim();
      if (vals.category) params.category = vals.category;
      const res = await BlogService.getMyBlogs(params);
      setBlogs(res.data || []);
      setPagination((p) => ({ ...p, total: res.pagination?.totalItems || 0 }));
    } catch {
      // API interceptor handles the error message
    } finally {
      setLoading(false);
    }
  };

  // FilterBar handlers
  const handleFilterChange = (key, value) => {
    const next = { ...filterValues, [key]: value ?? "" };
    setFilterValues(next);
    if (key !== "keyword") {
      setPagination((p) => ({ ...p, current: 1 }));
      loadBlogs(next);
    }
  };

  const handleSearch = (val) => {
    const next = { ...filterValues, keyword: val ?? filterValues.keyword };
    setFilterValues(next);
    setPagination((p) => ({ ...p, current: 1 }));
    loadBlogs(next);
  };

  const handleReset = () => {
    const reset = { keyword: "", category: "" };
    setFilterValues(reset);
    setActiveTab("all");
    setPagination((p) => ({ ...p, current: 1 }));
    loadBlogs(reset);
  };

  const handleSubmitForReview = async (blog) => {
    setSubmittingId(blog._id);
    try {
      await BlogService.submitForReview(blog._id);
      message.success("Blog submitted for review!");
      loadBlogs();
    } catch (err) {
      // API interceptor handles the error message
    } finally {
      setSubmittingId(null);
    }
  };

  const counts = {
    draft: blogs.filter((b) => b.status === "draft").length,
    pending: blogs.filter((b) => b.status === "pending").length,
    approved: blogs.filter((b) => b.status === "approved").length,
    rejected: blogs.filter((b) => b.status === "rejected").length,
  };

  const columns = [
    {
      title: "Blog Post",
      key: "blog",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {r.thumbnail ? (
            <img
              src={r.thumbnail}
              alt=""
              style={{
                width: 56,
                height: 42,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 42,
                borderRadius: 8,
                background: C.primaryBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileTextOutlined style={{ color: C.primary }} />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <Text
              strong
              style={{
                fontSize: 13,
                color: C.text,
                display: "block",
                marginBottom: 2,
              }}
              ellipsis={{ tooltip: r.title }}
            >
              {r.title}
            </Text>
            <Text style={{ fontSize: 12, color: C.textMuted }}>
              {r.summary?.slice(0, 72)}
              {r.summary?.length > 72 ? "…" : ""}
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
        <Tag
          style={{
            borderRadius: 20,
            border: "none",
            background: C.primaryBg,
            color: C.primary,
            fontWeight: 600,
            fontSize: 11,
          }}
        >
          {r.category?.name || "—"}
        </Tag>
      ),
    },
    {
      title: "Created",
      key: "date",
      width: 110,
      render: (_, r) => (
        <Text style={{ fontSize: 12, color: C.textSub }}>
          {new Date(r.createdAt).toLocaleDateString("en-GB")}
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
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              style={{ color: C.primary }}
              onClick={() => setPreviewBlog(r)}
            />
          </Tooltip>
          {(r.status === "draft" || r.status === "rejected") && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                style={{ color: C.amber }}
                onClick={() => setEditBlog(r)}
              />
            </Tooltip>
          )}
          {r.status === "draft" && (
            <Tooltip title="Submit for Review">
              <Button
                type="text"
                icon={<SendOutlined />}
                size="small"
                style={{ color: C.mint }}
                loading={submittingId === r._id}
                onClick={() => handleSubmitForReview(r)}
              />
            </Tooltip>
          )}
          {(r.status === "draft" || r.status === "rejected") && (
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                style={{ color: C.red }}
                onClick={() => setDeleteBlog(r)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, r) => {
        const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
        return (
          <Tag
            style={{
              borderRadius: 20,
              border: "none",
              background: st.bg,
              color: st.color,
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {st.icon} {st.label}
          </Tag>
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
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
          padding: "28px 28px 40px",
        }}
      >
        {/* Header */}
        <motion.div
          {...up(0)}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: C.primaryBg,
                border: `1px solid ${C.border}`,
                borderRadius: 999,
                padding: "4px 14px",
                marginBottom: 8,
              }}
            >
              <FileTextOutlined style={{ color: C.primary, fontSize: 12 }} />
              <Text style={{ color: C.primary, fontWeight: 700, fontSize: 12 }}>
                Instructor Portal
              </Text>
            </div>
            <h2
              style={{
                margin: "0 0 4px",
                fontSize: 26,
                fontWeight: 900,
                background: C.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              My Blog Posts
            </h2>
            <Text style={{ color: C.textSub, fontSize: 13 }}>
              Manage, edit, and publish your articles
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate(ROUTES.INSTRUCTOR_BLOG_CREATE)}
            style={{
              borderRadius: 12,
              fontWeight: 700,
              background: C.gradient,
              border: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              height: 44,
              paddingInline: 24,
              flexShrink: 0,
            }}
          >
            New Blog Post
          </Button>
        </motion.div>

        {/* Stats */}
        <Row gutter={[14, 14]} style={{ marginBottom: 22 }}>
          <Col xs={12} sm={6}>
            <StatCard
              label="Total"
              value={pagination.total}
              color={C.primary}
              icon={<FileTextOutlined />}
              delay={0.05}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              label="Draft"
              value={counts.draft}
              color={C.textSub}
              icon={<FileTextOutlined />}
              delay={0.1}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              label="In Review"
              value={counts.pending}
              color={C.amber}
              icon={<ClockCircleOutlined />}
              delay={0.15}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              label="Published"
              value={counts.approved}
              color={C.mint}
              icon={<CheckCircleOutlined />}
              delay={0.2}
            />
          </Col>
        </Row>

        {/* Table */}
        <motion.div {...up(0.15)}>
          <Card bordered={false} style={card} bodyStyle={{ padding: 0 }}>
            {/* FilterBar — dùng component dùng chung */}
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
              <FilterBar
                filters={[
                  { key: "keyword", type: "search", placeholder: "Search posts...", width: 260 },
                  {
                    key: "category", type: "select", label: "Category", width: 180,
                    defaultValue: "", allowClear: true,
                    options: [
                      { value: "", label: "All Categories" },
                      ...categories.map((c) => ({ value: c._id, label: c.name })),
                    ],
                  },
                ]}
                values={filterValues}
                onChange={handleFilterChange}
                onSearch={handleSearch}
                onReset={handleReset}
                theme="purple"
              />
            </div>

            {/* Status tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setActiveTab(t.key); setPagination((p) => ({ ...p, current: 1 })); }}
                  style={{
                    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                    border: "none", cursor: "pointer",
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

            <Table
              columns={columns}
              dataSource={blogs}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page) =>
                  setPagination((p) => ({ ...p, current: page })),
                showTotal: (total) => (
                  <Text style={{ fontSize: 12, color: C.textSub }}>
                    {total} posts
                  </Text>
                ),
                style: { padding: "12px 20px" },
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text style={{ color: C.textMuted }}>
                        No blog posts yet
                      </Text>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate(ROUTES.INSTRUCTOR_BLOG_CREATE)}
                      style={{
                        background: C.gradient,
                        border: "none",
                        borderRadius: 10,
                      }}
                    >
                      Create your first post
                    </Button>
                  </Empty>
                ),
              }}
              style={{ borderRadius: 0 }}
            />
          </Card>
        </motion.div>
      </div>

      <BlogPreviewModal
        blog={previewBlog}
        open={!!previewBlog}
        onClose={() => setPreviewBlog(null)}
      />
      <EditBlogModal
        blog={editBlog}
        open={!!editBlog}
        onClose={() => setEditBlog(null)}
        onSaved={loadBlogs}
        categories={categories}
      />
      <DeleteConfirmModal
        blog={deleteBlog}
        open={!!deleteBlog}
        onClose={() => setDeleteBlog(null)}
        onDeleted={loadBlogs}
      />
    </motion.div>
  );
};

export default InstructorBlogPage;