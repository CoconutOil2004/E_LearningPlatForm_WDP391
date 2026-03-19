/**
 * Admin Theme Configuration
 * Sử dụng Ant Design theme system
 */

export const adminTheme = {
  token: {
    colorPrimary: "#0077B6",
    colorSuccess: "#00C853",
    colorWarning: "#FFA726",
    colorError: "#EF5350",
    colorInfo: "#00BFA5",

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
    colorBgLayout: "#F8FAFB",
    colorBgContainer: "#FFFFFF",

    // Spacing
    paddingLG: 24,
    paddingMD: 16,
    paddingSM: 12,
    paddingXS: 8,
  },

  components: {
    Layout: {
      headerBg: "#FFFFFF",
      siderBg: "#001529",
      bodyBg: "#F8FAFB",
    },

    Button: {
      primaryShadow: "0 2px 8px rgba(0, 119, 182, 0.15)",
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
    },

    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
    },

    Table: {
      headerBg: "#FAFAFA",
      headerColor: "#666666",
      rowHoverBg: "#F5F5F5",
      borderRadius: 8,
    },

    Input: {
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
    },

    Select: {
      controlHeight: 36,
      controlHeightLG: 44,
    },

    Modal: {
      borderRadiusLG: 16,
    },
  },
};

export const COLOR = {
  ocean: "#0077B6",
  teal: "#00BFA5",
  green: "#00C853",
  bgPage: "#F8FAFB",
  white: "#FFFFFF",

  // Status colors
  success: "#00C853",
  warning: "#FFA726",
  error: "#EF5350",
  info: "#29B6F6",

  // Gray scale
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#EEEEEE",
  gray300: "#E0E0E0",
  gray400: "#BDBDBD",
  gray500: "#9E9E9E",
  gray600: "#757575",
  gray700: "#616161",
  gray800: "#424242",
  gray900: "#212121",
};

export const STATUS_CONFIG = {
  draft: {
    color: "default",
    label: "Draft",
    antdColor: "default",
  },
  pending: {
    color: "warning",
    label: "In Review",
    antdColor: "warning",
  },
  published: {
    color: "success",
    label: "Published",
    antdColor: "success",
  },
  rejected: {
    color: "error",
    label: "Rejected",
    antdColor: "error",
  },

  active: {
    color: "success",
    label: "Active",
    antdColor: "success",
  },
  inactive: {
    color: "default",
    label: "Inactive",
    antdColor: "default",
  },
  locked: {
    color: "error",
    label: "Locked",
    antdColor: "error",
  },
};
