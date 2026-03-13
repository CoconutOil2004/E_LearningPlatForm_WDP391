/**
 * CoursesTable Component
 * Table for displaying instructor's courses with Ant Design
 */

import {
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Image, Space, Table, Tag, Tooltip, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { COLOR, STATUS_CONFIG } from "../../../src/styles/adminTheme";
const { Text } = Typography;

const CoursesTable = ({
  courses = [],
  loading = false,
  onSubmit,
  submitting = null,
}) => {
  const navigate = useNavigate();

  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const columns = [
    {
      title: "COURSE",
      dataIndex: "title",
      key: "title",
      fixed: "left",
      width: 350,
      render: (title, record) => (
        <Space size={12}>
          <Image
            src={
              record.thumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=80&fit=crop"
            }
            alt={title}
            width={64}
            height={44}
            style={{
              borderRadius: 8,
              objectFit: "cover",
              background:
                "linear-gradient(135deg, rgba(0,119,182,0.1), rgba(0,191,165,0.2))",
            }}
            preview={false}
          />
          <Space direction="vertical" size={0} style={{ maxWidth: 250 }}>
            <Text
              strong
              style={{ color: COLOR.ocean }}
              ellipsis={{ tooltip: title }}
            >
              {title}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.category?.name || "—"} · {record.level}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
          <Tag
            color={config.antdColor}
            style={{ borderRadius: 12, fontWeight: 600 }}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "PRICE",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price) => (
        <Text strong style={{ fontFamily: "monospace", color: COLOR.ocean }}>
          {price === 0 ? "Free" : `$${price}`}
        </Text>
      ),
    },
    {
      title: "ENROLLMENTS",
      dataIndex: "enrollmentCount",
      key: "enrollmentCount",
      width: 130,
      render: (count) => (
        <Text strong style={{ fontFamily: "monospace", color: COLOR.ocean }}>
          {(count || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "DURATION",
      dataIndex: "totalDuration",
      key: "duration",
      width: 110,
      render: (duration) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: COLOR.gray400, fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatDuration(duration)}
          </Text>
        </Space>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => {
        const canEdit = ["draft", "rejected"].includes(record.status);
        const canSubmit = ["draft", "rejected"].includes(record.status);
        const isPending = record.status === "pending";

        return (
          <Space size={8}>
            <Tooltip title="View">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => navigate(`/courses/${record._id}`)}
              />
            </Tooltip>

            {canEdit && (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() =>
                    navigate(`/instructor/courses/edit/${record._id}`)
                  }
                  style={{ color: COLOR.ocean }}
                />
              </Tooltip>
            )}

            {isPending && (
              <Button
                size="small"
                onClick={() =>
                  navigate(`/instructor/courses/edit/${record._id}`)
                }
                style={{ borderRadius: 6 }}
              >
                Update
              </Button>
            )}

            {canSubmit && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="small"
                onClick={() => onSubmit(record._id)}
                loading={submitting === record._id}
                style={{ borderRadius: 6 }}
              >
                Submit
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={courses}
      loading={loading}
      rowKey="_id"
      scroll={{ x: 1200 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} courses`,
      }}
      onRow={(record) => ({
        onClick: () => navigate(`/courses/${record._id}`),
        style: { cursor: "pointer" },
      })}
    />
  );
};

export default CoursesTable;
