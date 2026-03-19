/**
 * Instructor Theme Configuration
 * Sử dụng Ant Design theme system kết hợp với Purple Theme hiện đại
 */

export const instructorTheme = {
  token: {
    colorPrimary: "#8B5CF6", // Purple 500
    colorSuccess: "#10B981", // Green 500
    colorWarning: "#F59E0B", // Amber 500
    colorError: "#EF4444", // Red 500
    colorInfo: "#3B82F6", // Blue 500

    // Typography
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Layout
    colorBgLayout: "#F9FAFB", // Gray 50 (Màu nền tổng thể)
    colorBgContainer: "#FFFFFF", // Màu nền thẻ/card

    // Spacing
    paddingLG: 24,
    paddingMD: 16,
    paddingSM: 12,
    paddingXS: 8,
  },

  components: {
    Layout: {
      headerBg: "#FFFFFF",
      siderBg: "#FFFFFF",
      bodyBg: "#F9FAFB",
    },

    Button: {
      primaryShadow: "0 2px 8px rgba(139, 92, 246, 0.3)", // Đổ bóng màu tím cho nút primary
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      borderRadius: 10,
    },

    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.1)", // Bóng nhẹ nhàng
    },

    Table: {
      headerBg: "#F3F4F6", // Gray 100
      headerColor: "#4B5563", // Gray 600
      rowHoverBg: "#F5F3FF", // Tím nhạt khi hover
      borderRadius: 12,
    },

    Input: {
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      activeBorderColor: "#8B5CF6",
      hoverBorderColor: "#A78BFA",
      borderRadius: 8,
    },

    Select: {
      controlHeight: 36,
      controlHeightLG: 44,
      borderRadius: 8,
    },

    Modal: {
      borderRadiusLG: 16,
    },

    Tag: {
      borderRadiusSM: 6,
    },
  },
};

export const INSTRUCTOR_COLORS = {
  primary: "#8B5CF6", // Purple 500
  primaryLight: "#A78BFA", // Purple 400
  primaryDark: "#7C3AED", // Purple 600
  accent: "#EC4899", // Pink 500
  success: "#10B981", // Green 500
  warning: "#F59E0B", // Amber 500
  error: "#EF4444", // Red 500

  // Backgrounds
  bgPage: "#F9FAFB", // Gray 50
  bgCard: "#FFFFFF",
  bgHover: "#F3F4F6", // Gray 100
  bgPurpleHover: "#F5F3FF", // Purple 50

  // Text
  textPrimary: "#111827", // Gray 900
  textSecondary: "#6B7280", // Gray 500
  textMuted: "#9CA3AF", // Gray 400

  // Borders
  border: "#E5E7EB", // Gray 200
  borderHover: "#8B5CF6", // Purple 500
};

export const INSTRUCTOR_STATUS_CONFIG = {
  draft: {
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#D1D5DB",
    label: "Draft",
    icon: "file",
    antdColor: "default",
  },
  pending: {
    bg: "#FEF3C7",
    text: "#D97706",
    border: "#FDE68A",
    label: "In Review",
    icon: "clock",
    antdColor: "warning",
  },
  published: {
    bg: "#D1FAE5",
    text: "#059669",
    border: "#A7F3D0",
    label: "Published",
    icon: "check",
    antdColor: "success",
  },
  rejected: {
    bg: "#FEE2E2",
    text: "#DC2626",
    border: "#FECACA",
    label: "Rejected",
    icon: "x",
    antdColor: "error",
  },
};
