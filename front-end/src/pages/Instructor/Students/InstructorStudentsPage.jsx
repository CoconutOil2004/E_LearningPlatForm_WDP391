import {
  TeamOutlined,
  MailOutlined,
  CalendarOutlined,
  LineChartOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Table,
  Avatar,
  Tag,
  Space,
  Typography,
  Card,
  Input,
  Progress,
  Tooltip,
  Empty,
  message,
  ConfigProvider
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import UserService from "../../../services/api/UserService";
import { pageVariants } from "../../../utils/helpers";
import { COLOR } from "../../../styles/adminTheme";

const { Text, Title } = Typography;

const InstructorStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState("");

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await UserService.getInstructorStudents({ page, limit: pagination.pageSize });
      setStudents(res.students ?? []);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: res.pagination?.total ?? 0
      }));
    } catch (err) {
      message.error(err?.response?.data?.message ?? "Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const columns = [
    {
      title: "Student",
      key: "student",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            src={record.student.avatarURL}
            size={42}
            className="shadow-sm border border-gray-100"
            style={{
              background: "linear-gradient(135deg, #4A90E2 0%, #0077B6 100%)",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!record.student.avatarURL && record.student.fullname?.charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-[14px] leading-tight">
              {record.student.fullname}
            </Text>
            <Text type="secondary" className="text-[12px] flex items-center gap-1 mt-0.5">
              <MailOutlined className="text-[10px]" /> {record.student.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Enrolled Course",
      key: "course",
      render: (_, record) => (
        <Space>
          <img
            src={record.course.thumbnail}
            alt=""
            className="w-10 h-6 object-cover rounded shadow-sm border border-gray-100"
          />
          <Text className="text-[13.5px] font-medium">
            {record.course.title}
          </Text>
        </Space>
      ),
    },
    {
      title: "Enrollment Date",
      dataIndex: "enrollmentDate",
      key: "date",
      width: 160,
      render: (date) => (
        <Text type="secondary" className="text-[13px] flex items-center gap-1.5">
          <CalendarOutlined /> {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: "Learning Progress",
      key: "progress",
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col gap-1 pr-4">
          <div className="flex justify-between items-center text-[12px]">
            <Text type="secondary">{record.completed ? "Completed" : "In Progress"}</Text>
            <Text strong style={{ color: record.completed ? COLOR.green : COLOR.ocean }}>
              {record.progress}%
            </Text>
          </div>
          <Progress
            percent={record.progress}
            size="small"
            showInfo={false}
            strokeColor={record.completed ? COLOR.green : COLOR.ocean}
            trailColor="#F0F5FF"
          />
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag
          color={record.completed ? "success" : "processing"}
          className="rounded-full px-3 border-none font-medium text-[12px]"
        >
          {record.completed ? "Hoàn thành" : "Đang học"}
        </Tag>
      ),
    },
  ];

  const filteredStudents = students.filter(s =>
    s.student.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
    s.student.email.toLowerCase().includes(searchText.toLowerCase()) ||
    s.course.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 900 }}>
              Student Management
            </Title>
            <Text type="secondary" className="text-lg">
              Track learners' progress and enrollment details
            </Text>
          </div>
          <Card
            bodyStyle={{ padding: "12px 24px" }}
            className="rounded-2xl border-none shadow-sm"
            style={{ background: "rgba(0, 119, 182, 0.05)" }}
          >
            <Space size="large">
              <div className="flex flex-col">
                <Text type="secondary" className="text-[12px] uppercase font-bold tracking-wider">Total Learners</Text>
                <Text strong className="text-2xl text-blue-600">{pagination.total}</Text>
              </div>
              <div className="w-px h-8 bg-blue-200" />
              <TeamOutlined className="text-3xl text-blue-500 opacity-50" />
            </Space>
          </Card>
        </div>

        {/* Filter & Search */}
        <div className="flex justify-between gap-4">
          <Input
            placeholder="Search students or courses..."
            prefix={<SearchOutlined className="text-gray-400" />}
            size="large"
            className="max-w-md rounded-xl border-gray-100 shadow-sm transition-all focus:shadow-md"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        {/* Main Content Table */}
        <Card
          bordered={false}
          className="rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          bodyStyle={{ padding: 0 }}
        >
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  rowHoverBg: "rgba(0, 119, 182, 0.04)",
                  headerBg: "#f8fafc",
                  headerColor: "#475569",
                  headerBorderRadius: 12,
                  colorBgContainer: "transparent",
                },
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredStudents}
              loading={loading}
              rowKey="_id"
              scroll={{ x: 800 }}
              pagination={{
                ...pagination,
                onChange: (page) => fetchStudents(page),
                showTotal: (total) => `Total ${total} entries`,
                className: "px-6 py-4",
                pageSize: 10
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text type="secondary">No students found</Text>}
                  />
                )
              }}
            />
          </ConfigProvider>
        </Card>
      </div>
    </motion.div>
  );
};

export default InstructorStudentsPage;
