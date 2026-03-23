/**
 * helpers.js — Centralized utility helpers
 * All shared formatting, animation, and UI helpers live here.
 */

// ─── Class merging ────────────────────────────────────────────────────────────
export const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Framer Motion variants ───────────────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: {
    y: -4,
    boxShadow: "var(--shadow-primary)",
    transition: { duration: 0.2 },
  },
};

export const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05 },
  }),
};

// ─── String helpers ───────────────────────────────────────────────────────────
/**
 * Truncate text to a max length with "..."
 */
export const truncate = (str, maxLen = 60) =>
  str.length > maxLen ? str.slice(0, maxLen) + "..." : str;

/**
 * Get initials from a full name (up to 2 chars)
 */
export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── Number formatting ────────────────────────────────────────────────────────

export const formatThousands = (num) => {
  if (num == null || isNaN(num)) return "0";
  // Use 'en-US' for English formatting
  return Number(num).toLocaleString("en-US") + "đ";
};

// ─── Input formatting ─────────────────────────────────────────────────────────

export const inputNumberFormatter = (value) =>
  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const inputNumberParser = (value) => value?.replace(/\$\s?|(,*)/g, "");

// ─── Duration formatting ──────────────────────────────────────────────────────
/**
 * Format duration in seconds to "Xh Ym" (used in course cards, course detail)
 * e.g. 3700 → "1h 1m", 180 → "3m"
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/**
 * Format duration in seconds to "hh:mm:ss" or "mm:ss" (used in lesson/video lists)
 * e.g. 3700 → "1:01:40", 185 → "3:05"
 */
export const formatDurationClock = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [
    h > 0 ? h : null,
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ].filter(Boolean);
  return parts.join(":");
};

/**
 * Format duration in seconds to short "m:ss" (used in sidebar / lesson row)
 * e.g. 185 → "3:05"
 */
export const formatDurationShort = (seconds) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};
/**
 * Format date to "X units ago"
 * e.g. "5 minutes ago", "2 hours ago", "yesterday", "3 days ago"
 */
export const formatTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  return past.toLocaleDateString("en-US");
};
