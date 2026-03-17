import {
  LockOutlined,
  MailOutlined,
  PlusOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import CreateInstructorModal from "../../../components/admin/CreateInstructorModal";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import StatsRow from "../../../components/admin/StatsRow";
import useAdminUsers from "../../../hooks/useAdminUsers";
import { COLOR } from "../../../styles/adminTheme";
import { formatThousands } from "../../../utils/helpers";

const { Text } = Typography;

const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);


// ─── UsersTable ───────────────────────────────────────────────────────────────
const UsersTable = ({ users, loading, onToggleLock, actionLoading, type, pagination, onPageChange }) => {
  const instructorCols = [
    {
      title: "Courses",
      dataIndex: "coursesCount",
      key: "courses",
      width: 100,
      render: (v) => (
        <Text strong style={{ color: COLOR.ocean }}>
          {v ?? 0}
        </Text>
      ),
    },
    {
      title: "Students",
      dataIndex: "studentsCount",
      key: "students",
      width: 120,
      render: (v) => (
        <Text strong style={{ color: COLOR.ocean }}>
          {v?.toLocaleString() ?? 0}
        </Text>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "totalRevenue",
      key: "revenue",
      width: 140,
      render: (v) => (
        <Text strong style={{ color: COLOR.green }}>
          {formatThousands(v ?? 0)}
        </Text>
      ),
    },
  ];

  const studentCols = [
    {
      title: "Enrolled",
      dataIndex: "enrolledCourses",
      key: "enrolled",
      width: 100,
      render: (v) => (
        <Text strong style={{ color: COLOR.ocean }}>
          {v ?? 0}
        </Text>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completedCourses",
      key: "completed",
      width: 120,
      render: (v) => (
        <Text strong style={{ color: COLOR.green }}>
          {v ?? 0}
        </Text>
      ),
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "fullname",
      key: "name",
      fixed: "left",
      width: 260,
      render: (name, record) => (
        <Space size={12}>
          <Avatar
            size={40}
            src={record.avatarURL}
            style={{
              background: `linear-gradient(135deg, ${COLOR.ocean}, ${COLOR.teal})`,
              fontWeight: 900,
            }}
          >
            {initials(name)}
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
      title: "Status",
      // BUG FIX 1: change dataIndex from "isLocked" to "action" — matches BE field
      dataIndex: "action",
      key: "status",
      width: 120,
      render: (action) => {
        // BUG FIX 1: action === "lock" means it is currently locked
        const locked = action === "lock";
        return (
          <Tag
            icon={locked ? <LockOutlined /> : null}
            color={locked ? "error" : "success"}
            style={{
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 12,
            }}
          >
            {locked ? "Locked" : "Active"}
          </Tag>
        );
      },
    },
    ...(type === "instructor" ? instructorCols : studentCols),
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => {
        const locked = record.action === "lock";
        return locked ? (
          <Button
            type="primary"
            size="small"
            icon={<UnlockOutlined />}
            loading={actionLoading === record._id}
            onClick={() => onToggleLock(record)}
            style={{
              borderRadius: 8,
              backgroundColor: COLOR.green,
              borderColor: COLOR.green,
              color: "#fff",
            }}
          >
            Unlock
          </Button>
        ) : (
          <Button
            danger
            size="small"
            icon={<LockOutlined />}
            loading={actionLoading === record._id}
            onClick={() => onToggleLock(record)}
            style={{ borderRadius: 8 }}
          >
            Lock
          </Button>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="_id"
      scroll={{ x: 1000 }}
      pagination={{
        current: pagination.current,
        pageSize: 20,
        total: pagination.total,
        showSizeChanger: false,
        showTotal: (t) => `Total ${t} ${type}s`,
        onChange: onPageChange
      }}
    />
  );
};

// ─── AdminUsersPage ───────────────────────────────────────────────────────────
const AdminUsersPage = () => {
  /* eslint-disable no-unused-vars */
  const {
    tab,
    setTab,
    TABS,
    instructors,
    students,
    instructorPagination,
    studentPagination,
    page,
    setPage,
    loading,
    showCreateModal,
    isCreating,
    openCreateModal,
    closeCreateModal,
    handleCreate,
    handleToggleLock,
    actionLoading,
  } = useAdminUsers();

  const stats = [
    {
      title: "Total Instructors",
      value: instructorPagination.total,
      prefix: <UserOutlined />,
    },
    {
      title: "Active Instructors",
      value: instructors.filter((i) => i.action !== "lock").length,
      valueColor: COLOR.green,
    },
    {
      title: "Total Students",
      value: studentPagination.total,
      prefix: <TeamOutlined />,
    },
    {
      title: "Active Students",
      value: students.filter((s) => s.action !== "lock").length,
      valueColor: COLOR.green,
    },
  ];

  const tabItems = [
    {
      key: TABS.INSTRUCTOR,
      label: (
        <Space>
          <UserOutlined />
          <span>Instructors ({instructorPagination.total})</span>
        </Space>
      ),
      children: (
        <UsersTable
          users={instructors}
          loading={loading}
          onToggleLock={handleToggleLock}
          actionLoading={actionLoading}
          type="instructor"
          pagination={{ ...instructorPagination, current: page }}
          onPageChange={setPage}
        />
      ),
    },
    {
      key: TABS.STUDENT,
      label: (
        <Space>
          <TeamOutlined />
          <span>Students ({studentPagination.total})</span>
        </Space>
      ),
      children: (
        <UsersTable
          users={students}
          loading={loading}
          onToggleLock={handleToggleLock}
          actionLoading={actionLoading}
          type="student"
          pagination={{ ...studentPagination, current: page }}
          onPageChange={setPage}
        />
      ),
    },
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title="User Management"
        subtitle="Manage instructors and students across the platform"
        extra={
          tab === TABS.INSTRUCTOR && (
            <Button
              type="default"
              icon={<PlusOutlined />}
              size="large"
              onClick={openCreateModal}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Create Instructor
            </Button>
          )
        }
      />

      <StatsRow items={stats} />

      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,119,182,0.06)" }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={tabItems}
          size="large"
          style={{ padding: "0 24px" }}
          tabBarStyle={{
            marginBottom: 0,
            borderBottom: `1px solid ${COLOR.gray100}`,
          }}
        />
      </Card>

      <CreateInstructorModal
        open={showCreateModal}
        onClose={closeCreateModal}
        onSubmit={handleCreate}
        loading={isCreating}
      />
    </AdminPageLayout>
  );
};

export default AdminUsersPage;
