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
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import StatsRow from "../../../components/admin/StatsRow";
import useAdminUsers from "../../../hooks/useAdminUsers";
import { COLOR } from "../../../styles/adminTheme";

const { Text } = Typography;

// ─── helpers ──────────────────────────────────────────────────────────────────
const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── CreateInstructorModal ────────────────────────────────────────────────────
const CreateInstructorModal = ({ open, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 18, color: COLOR.ocean }}>
            Create New Instructor
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            System will generate a password and send it via email
          </Text>
        </Space>
      }
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Create Instructor"
      confirmLoading={loading}
      width={480}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="instructor@example.com"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="fullname"
          label="Full Name"
          rules={[
            { required: true, message: "Full name is required" },
            { min: 3, message: "At least 3 characters" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="John Doe"
            size="large"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── UsersTable ───────────────────────────────────────────────────────────────
const UsersTable = ({ users, loading, onToggleLock, actionLoading, type }) => {
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
          ${v?.toLocaleString() ?? 0}
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
      dataIndex: "isLocked",
      key: "status",
      width: 120,
      render: (locked) => (
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
      ),
    },
    ...(type === "instructor" ? instructorCols : studentCols),
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) =>
        record.isLocked ? (
          <Button
            type="primary"
            size="small"
            icon={<UnlockOutlined />}
            loading={actionLoading === record._id}
            onClick={() => onToggleLock(record)}
            style={{ borderRadius: 8 }}
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
        ),
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
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (t) => `Total ${t} ${type}s`,
      }}
    />
  );
};

// ─── AdminUsersPage ───────────────────────────────────────────────────────────
const AdminUsersPage = () => {
  const {
    tab,
    setTab,
    TABS,
    instructors,
    students,
    loading,
    pagination,
    showCreateModal,
    isCreating,
    openCreateModal,
    closeCreateModal,
    handleCreate,
    handleToggleLock,
  } = useAdminUsers();

  const stats = [
    {
      title: "Total Instructors",
      value: instructors.length,
      prefix: <UserOutlined />,
    },
    {
      title: "Active Instructors",
      value: instructors.filter((i) => !i.isLocked).length,
      valueColor: COLOR.green,
    },
    {
      title: "Total Students",
      value: students.length,
      prefix: <TeamOutlined />,
    },
    {
      title: "Active Students",
      value: students.filter((s) => !s.isLocked).length,
      valueColor: COLOR.green,
    },
  ];

  const tabItems = [
    {
      key: TABS.INSTRUCTOR,
      label: (
        <Space>
          <UserOutlined />
          <span>Instructors ({instructors.length})</span>
        </Space>
      ),
      children: (
        <UsersTable
          users={instructors}
          loading={loading}
          onToggleLock={handleToggleLock}
          actionLoading={null}
          type="instructor"
        />
      ),
    },
    {
      key: TABS.STUDENT,
      label: (
        <Space>
          <TeamOutlined />
          <span>Students ({students.length})</span>
        </Space>
      ),
      children: (
        <UsersTable
          users={students}
          loading={loading}
          onToggleLock={handleToggleLock}
          actionLoading={null}
          type="student"
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
              type="primary"
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
        style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
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
