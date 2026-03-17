import {
  CalendarOutlined,
  ReadOutlined,
  SearchOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Empty, Input, Select, Skeleton, Tag, Typography } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BlogService from "../../../services/api/BlogService";
import CourseService from "../../../services/api/CourseService";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const { Title, Text, Paragraph } = Typography;

// ─── Design tokens (đồng nhất với HomePage/CSS vars) ──────────────────────────
const C = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  gradient: "var(--gradient-brand)",
  gradientPurple: "var(--gradient-purple)",
  text: "var(--text-heading)",
  textSub: "var(--text-muted)",
  border: "var(--border-default)",
  glassBg: "var(--glass-bg)",
  glassBorder: "var(--glass-border)",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=340&fit=crop";

// ─── Blog Card ─────────────────────────────────────────────────────────────────
const BlogCard = ({ blog, index }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const authorName = blog.author?.fullname || blog.author?.email || "Unknown";
  const categoryName = blog.category?.name;
  const date = blog.approvedAt || blog.createdAt;
  const dateStr = date
    ? new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  // Estimate read time
  const wordCount = blog.content?.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length || 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut", delay: (index % 3) * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/blog/${blog._id}`)}
      style={{
        cursor: "pointer",
        borderRadius: 24,
        overflow: "hidden",
        background: C.glassBg,
        border: `1px solid ${C.glassBorder}`,
        backdropFilter: "blur(12px)",
        boxShadow: hovered
          ? "0 16px 48px rgba(2,132,199,0.14), 0 2px 12px rgba(0,0,0,0.06)"
          : "0 4px 20px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={blog.thumbnail || FALLBACK_IMG}
          alt={blog.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.5) 100%)",
          }}
        />
        {categoryName && (
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                color: "var(--color-primary)",
                fontWeight: 700,
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 999,
                letterSpacing: "0.04em",
              }}
            >
              {categoryName}
            </span>
          </div>
        )}
        <div style={{ position: "absolute", bottom: 14, right: 14 }}>
          <span
            style={{
              background: "rgba(0,0,0,0.55)",
              color: "white",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ReadOutlined style={{ fontSize: 10 }} />
            {readMins} min read
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: C.text,
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: C.textSub,
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {blog.summary}
        </p>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 10,
            borderTop: `1px solid ${C.border}`,
            marginTop: "auto",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "white",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {authorName}
            </div>
            <div style={{ fontSize: 11, color: C.textSub }}>{dateStr}</div>
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--color-primary-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              transition: "all 0.2s",
              transform: hovered ? "translateX(2px)" : "translateX(0)",
            }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Featured Blog (large card) ────────────────────────────────────────────────
const FeaturedBlogCard = ({ blog }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const authorName = blog.author?.fullname || blog.author?.email || "Unknown";
  const wordCount = blog.content?.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length || 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const date = blog.approvedAt || blog.createdAt;
  const dateStr = date
    ? new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/blog/${blog._id}`)}
      style={{
        cursor: "pointer",
        borderRadius: 32,
        overflow: "hidden",
        background: C.glassBg,
        border: `1px solid ${C.glassBorder}`,
        backdropFilter: "blur(16px)",
        boxShadow: hovered
          ? "0 24px 64px rgba(2,132,199,0.16)"
          : "0 8px 32px rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(.22,1,.36,1)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        marginBottom: 40,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
        <img
          src={blog.thumbnail || FALLBACK_IMG}
          alt={blog.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(2,132,199,0.15) 0%, rgba(16,185,129,0.1) 100%)",
          }}
        />
        {/* Featured badge */}
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <span
            style={{
              background: "var(--gradient-brand)",
              color: "white",
              fontWeight: 800,
              fontSize: 11,
              padding: "5px 14px",
              borderRadius: 999,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 4px 14px rgba(2,132,199,0.4)",
            }}
          >
            ✦ Featured
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "40px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {blog.category?.name && (
          <span
            style={{
              color: "var(--color-primary)",
              fontWeight: 700,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <TagOutlined style={{ marginRight: 6 }} />
            {blog.category.name}
          </span>
        )}

        <h2
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 900,
            color: C.text,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          {blog.title}
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: C.textSub,
            lineHeight: 1.7,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.summary}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              color: "white",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{authorName}</div>
            <div style={{ fontSize: 12, color: C.textSub }}>
              {dateStr} · {readMins} min read
            </div>
          </div>
        </div>

        <button
          style={{
            marginTop: 4,
            alignSelf: "flex-start",
            background: "var(--gradient-brand)",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "10px 22px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 16px rgba(2,132,199,0.3)",
            transition: "all 0.2s",
            transform: hovered ? "translateX(2px)" : "translateX(0)",
          }}
        >
          Read Article
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const BlogListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 9 });

  useEffect(() => {
    CourseService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [pagination.current, selectedCategory]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await BlogService.getPublicBlogs({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
      });
      setBlogs(res.data || []);
      setPagination((p) => ({ ...p, total: res.pagination?.totalItems || 0 }));
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((p) => ({ ...p, current: 1 }));
    loadBlogs();
  };

  const featuredBlog = blogs[0];
  const restBlogs = blogs.slice(1);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* ── Aurora bg ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at 0% 0%,var(--aurora-tl) 0%,transparent 40%),
                       radial-gradient(circle at 100% 0%,var(--aurora-tr) 0%,transparent 40%),
                       radial-gradient(circle at 100% 100%,var(--aurora-br) 0%,transparent 40%)`,
          filter: "blur(60px)",
          opacity: 0.8,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "0 0 60px" }}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section
          style={{
            textAlign: "center",
            padding: "72px 24px 48px",
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: C.textSub,
              display: "block",
              marginBottom: 16,
            }}
          >
            KNOWLEDGE HUB
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              margin: "0 0 16px",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              background: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Insights & Articles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{ fontSize: 16, color: C.textSub, lineHeight: 1.6, margin: 0 }}
          >
            Expert knowledge from our instructor community — tutorials, trends, and deep dives.
          </motion.p>

          {/* Search + Filter */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              display: "flex",
              gap: 10,
              marginTop: 32,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Input
              prefix={<SearchOutlined style={{ color: C.textSub }} />}
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              style={{
                width: 300,
                borderRadius: 12,
                height: 44,
                fontSize: 14,
              }}
            />
            <Select
              placeholder="All Categories"
              value={selectedCategory || undefined}
              onChange={(v) => {
                setSelectedCategory(v || "");
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              allowClear
              style={{ width: 180, height: 44, borderRadius: 12 }}
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
            <Button
              type="primary"
              onClick={handleSearch}
              style={{
                height: 44,
                borderRadius: 12,
                fontWeight: 700,
                background: "var(--gradient-brand)",
                border: "none",
                paddingInline: 24,
                boxShadow: "0 4px 14px rgba(2,132,199,0.3)",
              }}
            >
              Search
            </Button>
          </motion.div>
        </section>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 24,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    padding: 16,
                  }}
                >
                  <Skeleton.Image active style={{ width: "100%", height: 180, borderRadius: 16 }} />
                  <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "80px 0" }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: C.textSub, fontSize: 15 }}>
                    No articles found. Try a different search.
                  </span>
                }
              />
            </motion.div>
          ) : (
            <>
              {/* Featured */}
              {featuredBlog && !search && pagination.current === 1 && (
                <FeaturedBlogCard blog={featuredBlog} />
              )}

              {/* Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${pagination.current}-${selectedCategory}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                    gap: 24,
                  }}
                >
                  {(search || pagination.current > 1 ? blogs : restBlogs).map((blog, i) => (
                    <BlogCard key={blog._id} blog={blog} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              {pagination.total > pagination.pageSize && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
                  <Button
                    disabled={pagination.current === 1}
                    onClick={() => setPagination((p) => ({ ...p, current: p.current - 1 }))}
                    style={{ borderRadius: 10, fontWeight: 700, height: 40 }}
                  >
                    ← Previous
                  </Button>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 16px",
                      fontSize: 13,
                      color: C.textSub,
                      fontWeight: 600,
                    }}
                  >
                    Page {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                  </span>
                  <Button
                    disabled={
                      pagination.current >= Math.ceil(pagination.total / pagination.pageSize)
                    }
                    onClick={() => setPagination((p) => ({ ...p, current: p.current + 1 }))}
                    style={{ borderRadius: 10, fontWeight: 700, height: 40 }}
                    type="primary"
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BlogListPage;