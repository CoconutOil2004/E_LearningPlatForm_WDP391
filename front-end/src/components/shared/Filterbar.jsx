import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select } from "antd";
import PropTypes from "prop-types";

const { Option } = Select;

const THEMES = {
  blue: {
    primary: "#0077B6",

    primaryDark: "#005f99",

    badgeBg: "rgba(0,119,182,0.10)",

    badgeColor: "#0077B6",

    divider: "#e5e7eb",

    labelColor: "#9ca3af",

    resetColor: "#6b7280",

    resetBorder: "#e5e7eb",

    cardBorder: "#f0f0f0",

    cardShadow: "0 1px 4px rgba(0,0,0,0.06)",

    searchBtn: "linear-gradient(135deg, #0077B6, #005f99)",
  },

  purple: {
    primary: "#8B5CF6",

    primaryDark: "#7C3AED",

    badgeBg: "rgba(139,92,246,0.10)",

    badgeColor: "#8B5CF6",

    divider: "#e5e7eb",

    labelColor: "#9ca3af",

    resetColor: "#6b7280",

    resetBorder: "#e5e7eb",

    cardBorder: "#f0f0f0",

    cardShadow: "0 1px 4px rgba(0,0,0,0.06)",

    searchBtn: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
  },
};
const FilterBar = ({
  filters = [],
  values = {},
  onChange,
  onSearch,
  onReset,
  theme = "purple",
  className = "",
  style = {},
  showReset = true,
}) => {
  const t = THEMES[theme] ?? THEMES.blue;

  const hasActive = filters.some((f) => {
    const v = values[f.key];
    const defaultVal = f.defaultValue ?? "";
    return v != null && v !== "" && v !== defaultVal;
  });

  const renderFilterItem = (filter) => {
    const val = values[filter.key] ?? "";

    switch (filter.type) {
      case "search":
        return (
          <div
            key={filter.key}
            style={{
              display: "flex",
              alignItems: "stretch",
              borderRadius: 10,
              border: `1px solid #d9d9d9`,
              overflow: "hidden",
              height: 40,
              backgroundColor: "#fff",
              transition: "all 0.3s",
            }}
            className="search-group-wrapper"
          >
            <Input
              placeholder={filter.placeholder ?? "Search..."}
              value={val}
              bordered={false}
              onChange={(e) => onChange(filter.key, e.target.value)}
              onPressEnter={() => onSearch?.(val)}
              style={{ width: filter.width ?? 220, fontSize: 14 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => onSearch?.(val)}
              style={{
                background: t.searchBtn,
                border: "none",
                borderRadius: 0,
                height: "100%",
                fontWeight: 600,
                padding: "0 20px",
              }}
            >
              Search
            </Button>
          </div>
        );

      case "select":
      case "sort":
        return (
          <div
            key={filter.key}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {filter.type === "sort"}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#8c8c8c",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {filter.label}
              </span>
            </div>
            <Select
              value={val}
              onChange={(v) => onChange(filter.key, v)}
              placeholder={filter.placeholder ?? "Select..."}
              allowClear={filter.allowClear}
              style={{ width: filter.width ?? 150, ...filter.style }}
              className="custom-filter-select"
            >
              {(filter.options ?? []).map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
        padding: "10px 0",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Render Search đầu tiên nếu có */}
        {filters.filter((f) => f.type === "search").map(renderFilterItem)}

        {/* Cụm các Select Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {filters.filter((f) => f.type !== "search").map(renderFilterItem)}
        </div>
      </div>

      {/* Nút Reset */}
      {showReset && hasActive && (
        <Button
          icon={<ReloadOutlined />}
          onClick={onReset}
          type="text"
          style={{
            color: t.primary,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
};
FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["search", "select", "sort"]).isRequired,
      label: PropTypes.string,
      placeholder: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.any, label: PropTypes.string }),
      ),
      width: PropTypes.number,
      style: PropTypes.object,
      defaultValue: PropTypes.any,
      btnText: PropTypes.string,
      allowClear: PropTypes.bool,
    }),
  ),
  /** Giá trị hiện tại: { [key]: value } */
  values: PropTypes.object,
  /** Gọi khi filter thay đổi (key, value) – tất cả loại trừ search */
  onChange: PropTypes.func,
  /** Gọi khi bấm Search hoặc Enter – chỉ dùng cho type:"search" */
  onSearch: PropTypes.func,
  /** Gọi khi bấm Reset */
  onReset: PropTypes.func,
  /** Số kết quả hiển thị ở badge góc phải */
  resultCount: PropTypes.number,
  loading: PropTypes.bool,
  /** "blue" | "purple" */
  theme: PropTypes.oneOf(["blue", "purple"]),
  className: PropTypes.string,
  style: PropTypes.object,
  /** Hiển thị đường kẻ dọc giữa các filter */
  showDividers: PropTypes.bool,
  /** Hiển thị badge số kết quả */
  showCount: PropTypes.bool,
  /** Hiển thị nút Reset khi có filter active */
  showReset: PropTypes.bool,
  /** Props truyền vào Ant Design Card wrapping FilterBar */
  cardProps: PropTypes.object,
};

// ... Giữ nguyên PropTypes ...
export default FilterBar;
