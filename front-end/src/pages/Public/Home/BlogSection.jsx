import { Skeleton } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FALLBACK_IMG } from "./homeConstants";

/* ── HomeBlogCard ── */
const HomeBlogCard = ({ blog, index }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const authorName = blog.author?.fullname || blog.author?.email || "Unknown";
  const wordCount =
    blog.content
      ?.replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter(Boolean).length || 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const date = blog.approvedAt || blog.createdAt;
  const dateStr = date
    ? new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/blog/${blog._id}`)}
      style={{
        cursor: "pointer",
        borderRadius: 24,
        overflow: "hidden",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(12px)",
        boxShadow: hovered
          ? "0 16px 40px rgba(2,132,199,0.12), 0 2px 10px rgba(0,0,0,0.05)"
          : "0 4px 16px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.32s cubic-bezier(.22,1,.36,1)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: "relative",
          height: 180,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={blog.thumbnail || FALLBACK_IMG}
          alt={blog.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.45s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 45%, rgba(15,23,42,0.45) 100%)",
          }}
        />
        {/* Category badge */}
        {blog.category?.name && (
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(6px)",
                color: "var(--color-primary)",
                fontWeight: 700,
                fontSize: 10,
                padding: "3px 10px",
                borderRadius: 999,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {blog.category.name}
            </span>
          </div>
        )}
        {/* Read time */}
        <div style={{ position: "absolute", bottom: 12, right: 12 }}>
          <span
            style={{
              background: "rgba(0,0,0,0.5)",
              color: "white",
              fontSize: 10,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            {readMins} min read
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "18px 20px 20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 8,
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            color: "var(--text-heading)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.title}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--text-muted)",
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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingTop: 10,
            borderTop: "1px solid var(--border-default)",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
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
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-body)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {authorName}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {dateStr}
            </div>
          </div>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--color-primary-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              transition: "transform 0.2s",
              transform: hovered ? "translateX(2px)" : "none",
              flexShrink: 0,
            }}
          >
            <svg
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── BlogSection ── */
const BlogSection = ({ latestBlogs, blogsLoading }) => {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-16 mx-auto max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 8,
            }}
          >
            FROM OUR INSTRUCTORS
          </motion.span>
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
            Latest Insights
          </h2>
          <p className="font-medium text-muted">
            Expert articles, tutorials and deep dives from our community
          </p>
        </div>
        <button
          onClick={() => navigate("/blog")}
          className="items-center hidden gap-2 text-sm font-bold transition-all duration-200 sm:flex text-primary hover:gap-3"
          style={{ color: "var(--color-primary)", whiteSpace: "nowrap" }}
        >
          View all articles
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </motion.div>

      {/* Loading */}
      {blogsLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: 24,
                overflow: "hidden",
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                padding: 16,
              }}
            >
              <Skeleton.Image
                active
                style={{ width: "100%", height: 180, borderRadius: 14 }}
              />
              <Skeleton
                active
                paragraph={{ rows: 2 }}
                style={{ marginTop: 14 }}
              />
            </div>
          ))}
        </div>
      ) : latestBlogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            borderRadius: 24,
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
          <p
            style={{
              color: "var(--text-muted)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            No articles published yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestBlogs.map((blog, i) => (
            <HomeBlogCard key={blog._id} blog={blog} index={i} />
          ))}
        </div>
      )}

      {/* Mobile CTA */}
      {latestBlogs.length > 0 && (
        <div className="mt-10 text-center sm:hidden">
          <button
            className="btn-aurora-outline"
            onClick={() => navigate("/blog")}
          >
            View All Articles
          </button>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
