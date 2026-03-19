import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Skeleton, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlogService from "../../../services/api/BlogService";
import { pageVariants } from "../../../utils/helpers";

const { Text } = Typography;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=600&fit=crop";

const C = {
  primary: "var(--color-primary)",
  text: "var(--text-heading)",
  textSub: "var(--text-muted)",
  border: "var(--border-default)",
  glassBg: "var(--glass-bg)",
  glassBorder: "var(--glass-border)",
};

// ─── Related Blog Card ─────────────────────────────────────────────────────────
const RelatedCard = ({ blog }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const authorName = blog.author?.fullname || blog.author?.email || "Unknown";

  return (
    <div
      onClick={() => { navigate(`/blog/${blog._id}`); window.scrollTo(0, 0); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        borderRadius: 16,
        overflow: "hidden",
        background: C.glassBg,
        border: `1px solid ${C.glassBorder}`,
        boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.1)" : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 140, overflow: "hidden" }}>
        <img
          src={blog.thumbnail || FALLBACK_IMG}
          alt={blog.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        {blog.category?.name && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: C.primary,
            textTransform: "uppercase", letterSpacing: "0.08em",
            display: "block", marginBottom: 6,
          }}>
            {blog.category.name}
          </span>
        )}
        <h4 style={{
          margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: C.text,
          lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {blog.title}
        </h4>
        <div style={{ fontSize: 11, color: C.textSub }}>{authorName}</div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    BlogService.getPublicBlogById(id)
      .then((res) => {
        setBlog(res.data);
        setRelated(res.related || []);
      })
      .catch(() => setError("Article not found."))
      .finally(() => setLoading(false));

    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
        <Skeleton.Image active style={{ width: "100%", height: 380, borderRadius: 24 }} />
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 32 }} />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          {error || "Blog not found"}
        </div>
        <Button onClick={() => navigate("/blog")} style={{ borderRadius: 10, fontWeight: 700 }}>
          ← Back to Blog
        </Button>
      </div>
    );
  }

  const authorName = blog.author?.fullname || blog.author?.email || "Unknown";
  const wordCount = blog.content?.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length || 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const date = blog.approvedAt || blog.createdAt;
  const dateStr = date
    ? new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Aurora bg */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: `radial-gradient(circle at 0% 0%,var(--aurora-tl) 0%,transparent 40%),
                       radial-gradient(circle at 100% 0%,var(--aurora-tr) 0%,transparent 40%)`,
          filter: "blur(60px)", opacity: 0.6,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", paddingBottom: 80 }}>
        {/* Back button */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 0" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/blog")}
            style={{ borderRadius: 10, fontWeight: 700, height: 38 }}
          >
            All Articles
          </Button>
        </div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 1100, margin: "24px auto 0", padding: "0 24px" }}
        >
          <div style={{ borderRadius: 28, overflow: "hidden", maxHeight: 460 }}>
            <img
              src={blog.thumbnail || FALLBACK_IMG}
              alt={blog.title}
              style={{ width: "100%", height: 460, objectFit: "cover", display: "block" }}
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
          </div>
        </motion.div>

        {/* Main layout */}
        <div
          style={{
            maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0",
            display: "grid", gridTemplateColumns: "1fr 300px", gap: 40,
          }}
        >
          {/* ─ Article ────────────────────────────────────────────────────── */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {/* Category */}
            {blog.category?.name && (
              <span style={{
                fontSize: 11, fontWeight: 800, color: C.primary,
                textTransform: "uppercase", letterSpacing: "0.1em",
                display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 14,
              }}>
                <TagOutlined /> {blog.category.name}
              </span>
            )}

            {/* Title */}
            <h1 style={{
              margin: "0 0 20px", fontSize: "clamp(1.7rem, 3vw, 2.6rem)",
              fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.2, color: C.text,
            }}>
              {blog.title}
            </h1>

            {/* Meta row */}
            <div style={{
              display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
              paddingBottom: 20, borderBottom: `1px solid ${C.border}`, marginBottom: 32,
            }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "white", fontWeight: 800, flexShrink: 0,
                }}>
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{authorName}</div>
                  <div style={{ fontSize: 11, color: C.textSub }}>Instructor</div>
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: C.border }} />

              <span style={{ fontSize: 12, color: C.textSub, display: "flex", alignItems: "center", gap: 5 }}>
                <CalendarOutlined /> {dateStr}
              </span>
              <span style={{ fontSize: 12, color: C.textSub, display: "flex", alignItems: "center", gap: 5 }}>
                <ClockCircleOutlined /> {readMins} min read
              </span>
            </div>

            {/* Summary */}
            {blog.summary && (
              <p style={{
                fontSize: 16, color: C.textSub, lineHeight: 1.75,
                fontStyle: "italic", margin: "0 0 28px",
                padding: "16px 20px",
                borderLeft: "3px solid var(--color-primary)",
                background: "rgba(var(--color-primary-rgb, 99,102,241),0.05)",
                borderRadius: "0 10px 10px 0",
              }}>
                {blog.summary}
              </p>
            )}

            {/* Content — render TinyMCE HTML */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              style={{ color: C.text }}
            />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginRight: 10 }}>
                  Tags:
                </Text>
                {blog.tags.map((t) => (
                  <Tag key={t} style={{
                    borderRadius: 20, fontWeight: 600, fontSize: 12, border: "none",
                    background: "rgba(99,102,241,0.08)", color: "var(--color-primary)",
                  }}>
                    {t}
                  </Tag>
                ))}
              </div>
            )}

            {/* Author card */}
            <div style={{
              marginTop: 40, padding: "24px 28px", borderRadius: 20,
              background: C.glassBg, border: `1px solid ${C.glassBorder}`,
              display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "var(--gradient-brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, color: "white", fontWeight: 800, flexShrink: 0,
              }}>
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>
                  {authorName}
                </div>
                <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>
                  Instructor at NexusAcademy — sharing knowledge through articles and courses.
                </div>
              </div>
            </div>
          </motion.article>

          {/* ─ Sidebar ────────────────────────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Article info */}
            <div style={{
              background: C.glassBg, border: `1px solid ${C.glassBorder}`,
              borderRadius: 20, padding: 20,
            }}>
              <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, color: C.text }}>
                About This Article
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Author", value: authorName, icon: <UserOutlined /> },
                  { label: "Published", value: dateStr, icon: <CalendarOutlined /> },
                  { label: "Read time", value: `${readMins} min`, icon: <ClockCircleOutlined /> },
                  ...(blog.category?.name ? [{ label: "Category", value: blog.category.name, icon: <TagOutlined /> }] : []),
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span style={{ color: C.textSub, display: "flex", alignItems: "center", gap: 5 }}>
                      {icon} {label}
                    </span>
                    <span style={{ fontWeight: 700, color: C.text, textAlign: "right", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div>
                <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, color: C.text }}>
                  Related Articles
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {related.map((r) => (
                    <RelatedCard key={r._id} blog={r} />
                  ))}
                </div>
              </div>
            )}

            {/* Browse all */}
            <Button
              block
              onClick={() => navigate("/blog")}
              style={{
                borderRadius: 12, fontWeight: 700, height: 44,
                background: "var(--gradient-brand)", border: "none", color: "white",
                boxShadow: "0 4px 14px rgba(2,132,199,0.3)",
              }}
            >
              Browse All Articles →
            </Button>
          </motion.aside>
        </div>
      </div>

      {/* Global styles for rendered TinyMCE content */}
      <style>{`
        .blog-content { font-size: 15px; line-height: 1.85; }
        .blog-content h2 { font-size: 22px; font-weight: 800; margin: 32px 0 14px; color: var(--text-heading); }
        .blog-content h3 { font-size: 18px; font-weight: 700; margin: 26px 0 10px; color: var(--text-heading); }
        .blog-content h4 { font-size: 15px; font-weight: 700; margin: 20px 0 8px; }
        .blog-content p { margin: 0 0 18px; }
        .blog-content a { color: var(--color-primary); text-decoration: underline; }
        .blog-content img { max-width: 100%; border-radius: 12px; margin: 16px auto; display: block; }
        .blog-content blockquote { border-left: 3px solid var(--color-primary); padding-left: 18px; margin: 20px 0; color: var(--text-muted); font-style: italic; }
        .blog-content pre { background: #f1f0fe; border: 1px solid #c7d2fe; border-radius: 10px; padding: 16px; overflow-x: auto; font-size: 13px; margin: 16px 0; }
        .blog-content code { background: #f1f0fe; border-radius: 4px; padding: 2px 6px; font-size: 13px; }
        .blog-content ul, .blog-content ol { padding-left: 26px; margin: 0 0 18px; }
        .blog-content li { margin: 6px 0; }
        .blog-content table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .blog-content td, .blog-content th { border: 1px solid #e5e7eb; padding: 10px 14px; font-size: 14px; }
        .blog-content th { background: #f9fafb; font-weight: 700; }
        @media (max-width: 768px) {
          .blog-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default BlogDetailPage;