// Shared header — dùng chung toàn bộ trang Admin
import { Space, Typography } from "antd";
import { COLOR } from "../../styles/adminTheme";

const { Title, Text } = Typography;

const PageHeader = ({ title, subtitle, extra, style }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
      ...style,
    }}
  >
    <Space direction="vertical" size={2}>
      <Title
        level={2}
        style={{
          margin: 0,
          color: COLOR.ocean,
          fontWeight: 900,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </Title>
      {subtitle && (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {subtitle}
        </Text>
      )}
    </Space>
    {extra && <div>{extra}</div>}
  </div>
);

export default PageHeader;
