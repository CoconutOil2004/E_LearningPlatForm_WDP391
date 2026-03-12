/**
 * AdminUsersPage - Refactored Version
 *
 * Features:
 *   - Sử dụng Ant Design components (Tabs, Table, Button, etc)
 *   - Tách components ra files riêng
 *   - Clean code structure
 *   - Easy to maintain and extend
 */

import { PlusOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Row,
  Space,
  Statistic,
  Tabs,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useState } from "react";

// Components
import CreateInstructorModal from "../../../components/admin/CreateInstructorModal";
import UsersTable from "../../../components/admin/UsersTable";

// Hooks & Utils
import useAdminUsers from "../../../hooks/useAdminUsers";
import { adminTheme, COLOR } from "../../../styles/adminTheme";
import { pageVariants } from "../../../utils/helpers";

const { Title, Text } = Typography;

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const {
    instructors,
    students,
    loadingInstructors,
    loadingStudents,
    actionLoading,
    handleCreateInstructor,
    handleLockUser,
    handleUnlockUser,
    creatingInstructor,
  } = useAdminUsers();

  const [activeTab, setActiveTab] = useState("instructors");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSubmit = async (values) => {
    await handleCreateInstructor(values);
    setIsModalOpen(false);
  };

  // Calculate stats
  const stats = {
    totalInstructors: instructors.length,
    activeInstructors: instructors.filter((i) => !i.isLocked).length,
    totalStudents: students.length,
    activeStudents: students.filter((s) => !s.isLocked).length,
  };

  const tabItems = [
    {
      key: "instructors",
      label: (
        <Space>
          <UserOutlined />
          <span>Instructors ({stats.totalInstructors})</span>
        </Space>
      ),
      children: (
        <UsersTable
          users={instructors}
          loading={loadingInstructors}
          onLock={handleLockUser}
          onUnlock={handleUnlockUser}
          actionLoading={actionLoading}
          type="instructor"
        />
      ),
    },
    {
      key: "students",
      label: (
        <Space>
          <TeamOutlined />
          <span>Students ({stats.totalStudents})</span>
        </Space>
      ),
      children: (
        <UsersTable
          users={students}
          loading={loadingStudents}
          onLock={handleLockUser}
          onUnlock={handleUnlockUser}
          actionLoading={actionLoading}
          type="student"
        />
      ),
    },
  ];

  return (
    <ConfigProvider theme={adminTheme}>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          padding: "24px",
          background: COLOR.bgPage,
          minHeight: "100vh",
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <div>
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: COLOR.ocean,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                User Management
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Manage instructors and students across the platform
              </Text>
            </div>

            {activeTab === "instructors" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsModalOpen(true)}
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Create Instructor
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Instructors"
                  value={stats.totalInstructors}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: COLOR.ocean, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Active Instructors"
                  value={stats.activeInstructors}
                  valueStyle={{ color: COLOR.green, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Students"
                  value={stats.totalStudents}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: COLOR.ocean, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic
                  title="Active Students"
                  value={stats.activeStudents}
                  valueStyle={{ color: COLOR.green, fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{ padding: "0 24px" }}
            tabBarStyle={{
              marginBottom: 0,
              borderBottom: `1px solid ${COLOR.gray100}`,
            }}
          />
        </Card>

        {/* Create Instructor Modal */}
        <CreateInstructorModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateSubmit}
          loading={creatingInstructor}
        />
      </motion.div>
    </ConfigProvider>
  );
};

export default AdminUsersPage;
