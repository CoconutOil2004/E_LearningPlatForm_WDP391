import {
  AlertOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { useState } from "react";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import StatsRow from "../../../components/admin/StatsRow";
import { COLOR } from "../../../styles/adminTheme";

const { Text } = Typography;
const { Option } = Select;

// ─── Mock data (replace with actual API) ────────────────────────────────────────
const MOCK_LOGS = [
  {
    id: "1",
    time: "2025-03-13 09:41",
    level: "info",
    actor: "admin@edu.io",
    action: "Approved course",
    resource: "React Fundamentals",
    ip: "192.168.1.10",
  },
  {
    id: "2",
    time: "2025-03-13 09:38",
    level: "warn",
    actor: "system",
    action: "Login failed x5",
    resource: "user:nguyen@edu.vn",
    ip: "10.0.0.5",
  },
  {
    id: "3",
    time: "2025-03-13 09:30",
    level: "info",
    actor: "admin@edu.io",
    action: "Created instructor",
    resource: "john.doe@edu.io",
    ip: "192.168.1.10",
  },
  {
    id: "4",
    time: "2025-03-13 09:15",
    level: "error",
    actor: "system",
    action: "Payment failed",
    resource: "order#8821",
    ip: "—",
  },
  {
    id: "5",
    time: "2025-03-13 08:59",
    level: "info",
    actor: "instructor@edu.io",
    action: "Submitted course",
    resource: "Vue 3 Advanced",
    ip: "192.168.2.31",
  },
  {
    id: "6",
    time: "2025-03-13 08:44",
    level: "warn",
    actor: "system",
    action: "High memory usage",
    resource: "server-01",
    ip: "—",
  },
  {
    id: "7",
    time: "2025-03-13 08:30",
    level: "info",
    actor: "admin@edu.io",
    action: "Locked user",
    resource: "spammer@bad.com",
    ip: "192.168.1.10",
  },
  {
    id: "8",
    time: "2025-03-13 08:10",
    level: "error",
    actor: "system",
    action: "DB timeout",
    resource: "courses collection",
    ip: "—",
  },
];

const MOCK_ACTIVITIES = [
  {
    key: "1",
    time: "09:41",
    color: "green",
    icon: <CheckCircleOutlined />,
    text: "Course React Fundamentals approved",
  },
  {
    key: "2",
    time: "09:38",
    color: "orange",
    icon: <WarningOutlined />,
    text: "5 failed login attempts detected",
  },
  {
    key: "3",
    time: "09:30",
    color: "blue",
    icon: <CheckCircleOutlined />,
    text: "New instructor account created",
  },
  {
    key: "4",
    time: "09:15",
    color: "red",
    icon: <AlertOutlined />,
    text: "Payment gateway timeout — order#8821",
  },
  {
    key: "5",
    time: "08:59",
    color: "blue",
    icon: <ClockCircleOutlined />,
    text: "Course Vue 3 Advanced submitted for review",
  },
];

const LEVEL_CONFIG = {
  info: { color: "blue", label: "Info" },
  warn: { color: "warning", label: "Warn" },
  error: { color: "error", label: "Error" },
};

// ─── AdminLogsPage ────────────────────────────────────────────────────────────
const AdminLogsPage = () => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = MOCK_LOGS.filter(
    (l) => levelFilter === "all" || l.level === levelFilter,
  ).filter(
    (l) =>
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = [
    {
      title: "Total Events (today)",
      value: MOCK_LOGS.length,
      prefix: <DatabaseOutlined />,
    },
    {
      title: "Errors",
      value: MOCK_LOGS.filter((l) => l.level === "error").length,
      valueColor: COLOR.error,
    },
    {
      title: "Warnings",
      value: MOCK_LOGS.filter((l) => l.level === "warn").length,
      valueColor: COLOR.warning,
    },
    {
      title: "Info",
      value: MOCK_LOGS.filter((l) => l.level === "info").length,
      valueColor: COLOR.teal,
    },
  ];

  const columns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 160,
      render: (v) => (
        <Text
          type="secondary"
          style={{ fontSize: 12, fontFamily: "monospace" }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 90,
      render: (level) => {
        const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.info;
        return (
          <Tag color={cfg.color} style={{ fontWeight: 700, borderRadius: 8 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Actor",
      dataIndex: "actor",
      key: "actor",
      width: 180,
      render: (v) => (
        <Text style={{ fontSize: 12, color: COLOR.ocean }}>{v}</Text>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 200,
      render: (v) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
      render: (v) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
      width: 140,
      render: (v) => (
        <Text style={{ fontSize: 12, fontFamily: "monospace" }}>{v}</Text>
      ),
    },
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Operations Hub"
        subtitle="System activity logs and real-time event monitoring"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {}}
            style={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
        }
      />

      <StatsRow items={stats} />

      <Row gutter={[20, 20]}>
        {/* Logs Table */}
        <Col xs={24} lg={17}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            title={
              <Space>
                <DatabaseOutlined style={{ color: COLOR.ocean }} />
                <Text strong style={{ color: COLOR.ocean }}>
                  Event Log
                </Text>
                <Badge
                  count={filtered.length}
                  style={{ backgroundColor: COLOR.teal }}
                />
              </Space>
            }
            extra={
              <Space>
                <Input
                  placeholder="Search logs..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 200, borderRadius: 8 }}
                  allowClear
                />
                <Select
                  value={levelFilter}
                  onChange={setLevelFilter}
                  style={{ width: 120, borderRadius: 8 }}
                >
                  <Option value="all">All Levels</Option>
                  <Option value="info">Info</Option>
                  <Option value="warn">Warn</Option>
                  <Option value="error">Error</Option>
                </Select>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              size="small"
              scroll={{ x: 900 }}
              pagination={{ pageSize: 8, showTotal: (t) => `${t} events` }}
              rowClassName={(record) =>
                record.level === "error" ? "ant-table-row-error" : ""
              }
            />
          </Card>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={7}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              height: "100%",
            }}
            title={
              <Space>
                <BarChartOutlined style={{ color: COLOR.ocean }} />
                <Text strong style={{ color: COLOR.ocean }}>
                  Recent Activity
                </Text>
              </Space>
            }
          >
            <Timeline
              items={MOCK_ACTIVITIES.map((a) => ({
                key: a.key,
                color: a.color,
                dot: a.icon,
                children: (
                  <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 13 }}>{a.text}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {a.time}
                    </Text>
                  </Space>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </AdminPageLayout>
  );
};

export default AdminLogsPage;
