import {
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { 
  Card, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Table, 
  Avatar, 
  Empty, 
  message,
  Tooltip,
  ConfigProvider
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import UserService from "../../../services/api/UserService";
import { pageVariants } from "../../../utils/helpers";
import { COLOR } from "../../../styles/adminTheme";

const { Text, Title } = Typography;

const formatVND = (value) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const InstructorRevenuePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const res = await UserService.getInstructorRevenue();
        setData(res);
      } catch (err) {
        message.error("Không thể tải thông tin doanh thu");
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <Space>
          <img 
            src={record.courseId?.thumbnail} 
            alt="" 
            className="w-12 h-8 object-cover rounded shadow-sm"
          />
          <Text strong>{record.courseId?.title}</Text>
        </Space>
      ),
    },
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <Space>
          <Avatar src={record.userId?.avatarURL} size="small" />
          <Text>{record.userId?.fullname}</Text>
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text strong style={{ color: COLOR.green }}>
          {formatVND(amount)}
        </Text>
      ),
    },
    {
      title: "Purchase Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => (
        <Text type="secondary" className="text-[12px]">
          {new Date(date).toLocaleString()}
        </Text>
      ),
    },
  ];

  const statCards = [
    {
      title: "Total Revenue",
      value: formatVND(data?.stats?.totalRevenue || 0),
      icon: <DollarOutlined className="text-2xl" />,
      color: "#4A90E2",
      bg: "rgba(74, 144, 226, 0.1)"
    },
    {
      title: "This Month",
      value: formatVND(data?.stats?.monthRevenue || 0),
      icon: <RiseOutlined className="text-2xl" />,
      color: "#27AE60",
      bg: "rgba(39, 174, 96, 0.1)"
    },
    {
      title: "Today",
      value: formatVND(data?.stats?.todayRevenue || 0),
      icon: <ShoppingOutlined className="text-2xl" />,
      color: "#F2994A",
      bg: "rgba(242, 153, 74, 0.1)"
    },
    {
      title: "Total Sales",
      value: data?.stats?.totalSales || 0,
      icon: <TrophyOutlined className="text-2xl" />,
      color: "#9B51E0",
      bg: "rgba(155, 81, 224, 0.1)"
    }
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 900 }}>Financial Overview</Title>
            <Text type="secondary">Monitor your earnings and course performance</Text>
          </div>
          <Tooltip title="Doanh thu được cập nhật ngay khi học viên thanh toán thành công">
            <InfoCircleOutlined className="text-gray-400 cursor-help" />
          </Tooltip>
        </div>

        {/* Stats Grid */}
        <Row gutter={[24, 24]}>
          {statCards.map((stat, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <Card 
                bordered={false} 
                className="rounded-3xl shadow-sm hover:shadow-md transition-shadow h-full"
                bodyStyle={{ padding: "24px" }}
              >
                <div className="flex items-center gap-4 h-full">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: stat.bg, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <Text type="secondary" className="text-[11px] font-bold uppercase tracking-widest block mb-1">
                      {stat.title}
                    </Text>
                    <Text strong className="text-xl truncate block">
                      {stat.value}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Transaction History */}
        <Card 
          title={
            <div className="flex items-center gap-2 py-2">
              <HistoryOutlined className="text-blue-500" />
              <span className="text-[16px] font-bold">Recent Acquisitions</span>
            </div>
          }
          bordered={false}
          className="rounded-3xl shadow-xl overflow-hidden"
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
              dataSource={data?.recentOrders || []} 
              loading={loading}
              rowKey="_id"
              pagination={false}
              locale={{
                emptyText: (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="Bạn chưa có doanh thu nào"
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

export default InstructorRevenuePage;
