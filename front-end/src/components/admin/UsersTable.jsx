/**
 * UsersTable Component
 * Reusable table for displaying instructors or students
 * Uses Ant Design Table
 */

import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Avatar, Button, Space, Table, Tag, Typography } from "antd";
import { COLOR } from "../../../src/styles/adminTheme";

const { Text } = Typography;

const UsersTable = ({
  users = [],
  loading = false,
  onLock,
  onUnlock,
  actionLoading = null,
  type = "instructor", // 'instructor' or 'student'
}) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const baseColumns = [
    {
      title: "NAME",
      dataIndex: "fullname",
      key: "fullname",
      fixed: "left",
      width: 250,
      render: (name, record) => (
        <Space size={12}>
          <Avatar
            size={40}
            style={{
              background: `linear-gradient(135deg, ${COLOR.ocean}, ${COLOR.teal})`,
              fontWeight: 900,
            }}
          >
            {getInitials(name)}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: COLOR.ocean }}>
              {name}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.email}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "isLocked",
      key: "status",
      width: 120,
      render: (isLocked) => (
        <Tag
          icon={isLocked ? <LockOutlined /> : null}
          color={isLocked ? "error" : "success"}
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: 12,
          }}
        >
          {isLocked ? "LOCKED" : "ACTIVE"}
        </Tag>
      ),
    },
  ];

  // Add type-specific columns
  const typeColumns =
    type === "instructor"
      ? [
          {
            title: "COURSES",
            dataIndex: "coursesCount",
            key: "coursesCount",
            width: 100,
            render: (count) => (
              <Text
                strong
                style={{ fontFamily: "monospace", color: COLOR.ocean }}
              >
                {count || 0}
              </Text>
            ),
          },
          {
            title: "STUDENTS",
            dataIndex: "studentsCount",
            key: "studentsCount",
            width: 120,
            render: (count) => (
              <Text
                strong
                style={{ fontFamily: "monospace", color: COLOR.ocean }}
              >
                {count ? count.toLocaleString() : 0}
              </Text>
            ),
          },
          {
            title: "REVENUE",
            dataIndex: "totalRevenue",
            key: "revenue",
            width: 140,
            render: (revenue) => (
              <Text
                strong
                style={{ fontFamily: "monospace", color: COLOR.green }}
              >
                ${revenue ? revenue.toLocaleString() : 0}
              </Text>
            ),
          },
        ]
      : [
          {
            title: "ENROLLED",
            dataIndex: "enrolledCourses",
            key: "enrolledCourses",
            width: 100,
            render: (count) => (
              <Text
                strong
                style={{ fontFamily: "monospace", color: COLOR.ocean }}
              >
                {count || 0}
              </Text>
            ),
          },
          {
            title: "COMPLETED",
            dataIndex: "completedCourses",
            key: "completedCourses",
            width: 120,
            render: (count) => (
              <Text
                strong
                style={{ fontFamily: "monospace", color: COLOR.green }}
              >
                {count || 0}
              </Text>
            ),
          },
        ];

  const actionColumn = {
    title: "ACTIONS",
    key: "actions",
    fixed: "right",
    width: 120,
    render: (_, record) => (
      <Space size={8}>
        {record.isLocked ? (
          <Button
            type="primary"
            size="small"
            icon={<UnlockOutlined />}
            onClick={() => onUnlock(record._id)}
            loading={actionLoading === record._id}
            style={{ borderRadius: 8 }}
          >
            Unlock
          </Button>
        ) : (
          <Button
            danger
            size="small"
            icon={<LockOutlined />}
            onClick={() => onLock(record._id)}
            loading={actionLoading === record._id}
            style={{ borderRadius: 8 }}
          >
            Lock
          </Button>
        )}
      </Space>
    ),
  };

  const columns = [...baseColumns, ...typeColumns, actionColumn];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="_id"
      scroll={{ x: 1000 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} ${type}s`,
        style: { marginTop: 24 },
      }}
      style={{
        background: COLOR.white,
        borderRadius: 16,
        overflow: "hidden",
      }}
    />
  );
};

export default UsersTable;
