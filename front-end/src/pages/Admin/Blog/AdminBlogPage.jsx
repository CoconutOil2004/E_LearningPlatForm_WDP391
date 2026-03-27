import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UndoOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
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
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import BlogService from "../../../services/api/BlogService";
import CourseService from "../../../services/api/CourseService";
import { COLOR } from "../../../styles/adminTheme";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import { FilterBar } from "../../../components/shared";

const { Title, Text } = Typography;

const C = {
  primary: "var(--color-primary)",
  primaryBg: "var(--color-primary-bg)",
  secondary: "var(--color-secondary)",
  secondaryBg: "var(--color-secondary-bg)",
  danger: "var(--color-danger)",
  warning: "var(--color-warning)",
  text: "var(--text-heading)",
  textSub: "var(--text-muted)",
  border: "var(--border-default)",
  glass: "var(--glass-bg)",
  glassBorder: "var(--glass-border)",
};

const cardStyle = {
  borderRadius: "var(--radius-lg)",
  border: `1px solid ${C.glassBorder}`,
  background: C.glass,
  backdropFilter: "blur(20px)",
  boxShadow: "var(--shadow-md)",
};

const softCardStyle = {
  borderRadius: "var(--radius-lg)",
  border: `1px solid ${C.border}`,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
};

const STATUS_CONFIG = {
  draft:    { label: "Draft",    color: "var(--text-muted)", bg: "var(--bg-subtle)", icon: <FileTextOutlined /> },
  pending:  { label: "Pending",  color: "var(--color-warning)", bg: "rgba(245, 158, 11, 0.1)", icon: <ClockCircleOutlined /> },
  approved: { label: "Published", color: "var(--color-success)", bg: "var(--color-secondary-bg)", icon: <CheckCircleOutlined /> },
  rejected: { label: "Rejected", color: "var(--color-danger)", bg: "rgba(239, 68, 68, 0.1)", icon: <CloseCircleOutlined /> },
};

const TABS = [
  { key: "all",      label: "All Posts" },
  { key: "pending",  label: "Pending Review" },
  { key: "approved", label: "Published" },
  { key: "rejected", label: "Rejected" },
  { key: "hidden",   label: "Hidden" },
];

// ─── Modals ──────────────────────────────────────────────────────────────────────

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
          <Tag style={{ borderRadius: 20, fontWeight: 700, border: "none", background: st.bg, color: st.color }}>
            {st.icon} {st.label}
          </Tag>
          <Text type="secondary">By <strong>{blog.author?.fullname || "Unknown"}</strong></Text>
        </div>
        <Title level={2} style={{ color: COLOR.ocean, fontWeight: 900 }}>{blog.title}</Title>
        <Text style={{ color: C.textSub, fontSize: 16, display: "block", marginBottom: 20, fontStyle: "italic" }}>{blog.summary}</Text>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </div>
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
    } catch { } finally { setLoading(false); }
  };
  return (
    <Modal title="Reject Blog Post" open={open} onCancel={onClose} onOk={handleReject}
      okText="Reject Post" okButtonProps={{ danger: true, loading }} confirmLoading={loading}>
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="Reason for rejection"
          rules={[{ required: true, message: "Please provide a reason" }]}>
          <Input.TextArea rows={4} placeholder="Explain why this blog is being rejected..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────────

const AdminBlogPage = () => {
  const [loading, setLoading]       = useState(true);
  const [blogs, setBlogs]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab]   = useState("all");
  const [filterValues, setFilterValues] = useState({ keyword: "", category: "" });
  const [previewBlog, setPreviewBlog] = useState(null);
  const [rejectBlog, setRejectBlog]   = useState(null);
  const [pagination, setPagination]   = useState({ current: 1, pageSize: 10, total: 0 });

  // Load categories từ BE — dùng để build filterConfig động
  useEffect(() => {
    CourseService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { fetchBlogs(); }, [activeTab, pagination.current, filterValues.category]);

  const filterConfig = [
    {
      key: "keyword",
      type: "search",
      placeholder: "Search by title or summary...",
      width: 280,
    },
    {
      key: "category",
      type: "select",
      label: "Category",
      width: 180,
      defaultValue: "",
      allowClear: true,
      options: [
        { value: "", label: "All Categories" },
        ...categories.map((c) => ({ value: c._id, label: c.name })),
      ],
    },
  ];

  const fetchBlogs = async (overrides = {}) => {
    setLoading(true);
    try {
      const vals = { ...filterValues, ...overrides };
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search:   vals.keyword.trim() || undefined,
        category: vals.category       || undefined,
      };
      if (activeTab === "hidden") {
        params.deleted = true;
      } else {
        params.deleted = false;
        if (activeTab !== "all") params.status = activeTab;
      }

      const res = await BlogService.manageBlogs(params);
      if (res.success) {
        setBlogs(res.data);
        setPagination((p) => ({ ...p, total: res.pagination?.totalItems || 0 }));
      }
    } catch { } finally { setLoading(false); }
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filterValues, [key]: value };
    setFilterValues(next);
    if (key !== "keyword") {
      setPagination((p) => ({ ...p, current: 1 }));
      fetchBlogs(next);
    }
  };

  const handleSearch = (val) => {
    const next = { ...filterValues, keyword: val ?? "" };
    setFilterValues(next);
    setPagination((p) => ({ ...p, current: 1 }));
    fetchBlogs(next);
  };

  const handleReset = () => {
    const reset = { keyword: "", category: "" };
    setFilterValues(reset);
    setActiveTab("all");
    setPagination((p) => ({ ...p, current: 1 }));
    fetchBlogs(reset);
  };

  const handleApprove = async (id) => {
    try { await BlogService.approveBlog(id); message.success("Blog post approved!"); fetchBlogs(); }
    catch (err) { message.error(err.response?.data?.message || "Action failed"); }
  };

  const handleReject = async (id, reason) => {
    try { await BlogService.rejectBlog(id, reason); message.success("Blog post rejected."); fetchBlogs(); }
    catch (err) { message.error(err.response?.data?.message || "Action failed"); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Blog Post",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to permanently delete this blog?",
      okText: "Delete", okType: "danger",
      onOk: async () => {
        try { await BlogService.adminDeleteBlog(id); message.success("Deleted."); fetchBlogs(); } catch { }
      },
    });
  };

  const handleHide = (id) => {
    Modal.confirm({
      title: "Hide Blog Post",
      icon: <EyeInvisibleOutlined style={{ color: "#d97706" }} />,
      content: "This blog will be hidden from public view. You can restore it anytime.",
      okText: "Hide Post",
      okButtonProps: { style: { background: "#d97706", borderColor: "#d97706", color: "#fff" } },
      onOk: async () => {
        try { await BlogService.adminDeleteBlog(id); message.success("Blog hidden from public."); fetchBlogs(); } catch { }
      },
    });
  };

  const handleRestore = (id) => {
    Modal.confirm({
      title: "Restore Blog Post",
      icon: <UndoOutlined style={{ color: "#059669" }} />,
      content: "This blog will be visible to the public again.",
      okText: "Restore",
      okButtonProps: { style: { background: "#059669", borderColor: "#059669", color: "#fff" } },
      onOk: async () => {
        try { await BlogService.restoreBlog(id); message.success("Blog is now visible again."); fetchBlogs(); } catch { }
      },
    });
  };

  // Actions trước Status
  const columns = [
    {
      title: "Content",
      key: "content",
      width: 300,
      ellipsis: true,
      render: (_, r) => (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", gap: 16, alignItems: "center" }}
        >
          <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
            <img 
              src={r.thumbnail} 
              alt="thumb" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover", 
                borderRadius: "var(--radius-md)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }} 
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <Text 
              strong 
              style={{ 
                display: "block", 
                color: "var(--color-primary)", 
                fontSize: 15,
                lineHeight: 1.3,
                marginBottom: 4
              }} 
              ellipsis
            >
              {r.title}
            </Text>
            <Text 
              type="secondary" 
              style={{ fontSize: 13, color: "var(--text-muted)" }} 
              ellipsis={{ rows: 1 }}
            >
              {r.summary}
            </Text>
          </div>
        </motion.div>
      ),
    },
    {
      title: "Author",
      key: "author",
      width: 140,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={r.author?.avatarURL}
            style={{ 
              flexShrink: 0,
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`, 
              fontWeight: 900 
            }}>
            {r.author?.fullname?.[0]?.toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Text strong style={{ color: "var(--color-primary)", fontSize: 13, whiteSpace: "nowrap" }}>{r.author?.fullname || "User"}</Text>
            <Text type="secondary" style={{ fontSize: 11, whiteSpace: "nowrap" }} ellipsis>{r.author?.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 100,
      render: (_, r) => r.category?.name
        ? <Tag style={{ borderRadius: 12, border: "none", background: C.primaryBg, color: C.primary, fontWeight: 600 }}>{r.category.name}</Tag>
        : <Text type="secondary">—</Text>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 100,
      render: (d) => <Text type="secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{dayjs(d).format("DD/MM/YYYY")}</Text>,
    },
    // Actions trước Status
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="View">
            <Button 
              shape="circle" 
              icon={<EyeOutlined />} 
              onClick={() => setPreviewBlog(r)} 
              style={{ border: "none", background: "var(--bg-subtle)" }}
            />
          </Tooltip>
          
          {r.status === "pending" && (
            <>
              <Tooltip title="Approve">
                <Button 
                  shape="circle" 
                  icon={<CheckCircleOutlined />} 
                  style={{ color: "#fff", background: "var(--color-success)", border: "none" }} 
                  onClick={() => handleApprove(r._id)} 
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button 
                  shape="circle" 
                  icon={<CloseCircleOutlined />} 
                  style={{ color: "#fff", background: "var(--color-danger)", border: "none" }} 
                  onClick={() => setRejectBlog(r)} 
                />
              </Tooltip>
            </>
          )}

          {r.deleted ? (
            <Tooltip title="Restore">
              <Button 
                shape="circle" 
                icon={<UndoOutlined />} 
                style={{ color: "#fff", background: "var(--color-secondary)", border: "none" }} 
                onClick={() => handleRestore(r._id)} 
              />
            </Tooltip>
          ) : (
            <Tooltip title="Hide">
              <Button 
                shape="circle" 
                icon={<EyeInvisibleOutlined />} 
                style={{ color: "#fff", background: "var(--color-warning)", border: "none" }} 
                onClick={() => handleHide(r._id)} 
              />
            </Tooltip>
          )}

          <Tooltip title="Delete">
            <Button 
              shape="circle" 
              icon={<DeleteOutlined />} 
              danger 
              type="primary"
              ghost
              onClick={() => handleDelete(r._id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
    // Status sau Actions
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, r) => {
        const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Tag 
              style={{ 
                borderRadius: 20, 
                border: "none", 
                background: st.bg, 
                color: st.color, 
                fontWeight: 600, 
                padding: "4px 12px",
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {st.icon} {st.label}
            </Tag>
            {r.deleted && (
              <Tag 
                style={{ 
                  borderRadius: 20, 
                  border: "none", 
                  background: "rgba(245, 158, 11, 0.1)", 
                  color: "var(--color-warning)", 
                  fontWeight: 600, 
                  padding: "4px 12px" 
                }}
              >
                <EyeInvisibleOutlined /> Hidden
              </Tag>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminPageLayout>
      <PageHeader title="Blog Management" subtitle="Review and manage platform articles" />

      {/* FilterBar dùng component dùng chung — đặt dưới header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card bordered={false} style={{ ...cardStyle, marginBottom: 20 }} bodyStyle={{ padding: "16px 28px" }}>
          <FilterBar
            filters={filterConfig}
            values={filterValues}
            onChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
            theme="blue"
          />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card bordered={false} style={softCardStyle} bodyStyle={{ padding: 0 }}>
          {/* Status tabs */}
          <div style={{ padding: "16px 24px", borderBottom: `1px solid var(--border-default)`, display: "flex", gap: 12, background: 'rgba(0,0,0,0.01)' }}>
            {TABS.map((t) => (
              <motion.button
                key={t.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveTab(t.key); setPagination((p) => ({ ...p, current: 1 })); }}
                style={{
                  padding: "8px 24px", 
                  borderRadius: "var(--radius-full)", 
                  fontSize: 14, 
                  fontWeight: 600,
                  border: "none", 
                  cursor: "pointer",
                  background: activeTab === t.key ? "var(--color-primary)" : "transparent",
                  color: activeTab === t.key ? "#fff" : "var(--text-muted)",
                  boxShadow: activeTab === t.key ? "var(--shadow-primary)" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {t.label}
              </motion.button>
            ))}
          </div>

          <Table
            className="premium-table"
            columns={columns}
            dataSource={blogs}
            rowKey="_id"
            loading={loading}
            // Removed scroll.x to prevent horizontal scrollbar
            pagination={{ 
              ...pagination, 
              onChange: (page) => setPagination((p) => ({ ...p, current: page })),
              showSizeChanger: false,
              style: { padding: '16px 24px' }
            }}
            locale={{ emptyText: <Empty description="No blogs found" /> }}
          />
        </Card>
      </motion.div>

      <BlogPreviewModal blog={previewBlog} open={!!previewBlog} onClose={() => setPreviewBlog(null)} />
      <RejectModal blog={rejectBlog} open={!!rejectBlog} onClose={() => setRejectBlog(null)} onConfirm={handleReject} />
    </AdminPageLayout>
  );
};

export default AdminBlogPage;