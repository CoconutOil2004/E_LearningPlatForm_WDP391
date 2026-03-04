/**
 * Merge class names (Tailwind-safe)
 * @param {...string} classes
 * @returns {string}
 */
export const cn = (...classes) => classes.filter(Boolean).join(" ");

/**
 * Framer Motion page transition variants
 */
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/**
 * Framer Motion card hover variants
 */
export const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: {
    y: -4,
    boxShadow: "var(--shadow-primary)",
    transition: { duration: 0.2 },
  },
};

/**
 * Framer Motion sidebar item variants
 */
export const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05 },
  }),
};

/**
 * Truncate text
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (str, maxLen = 60) =>
  str.length > maxLen ? str.slice(0, maxLen) + "..." : str;

/**
 * Get initials from name
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * Format large numbers
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};
