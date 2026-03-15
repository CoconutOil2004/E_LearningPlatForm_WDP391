import {
  StarFilled,
  DeleteOutlined,
  SearchOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  message,
  Modal,
  Rate,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReviewService from "../../../services/api/ReviewService";
import { COLOR } from "../../../styles/adminTheme";
import { formatTimeAgo, pageVariants } from "../../../utils/helpers";

const { Text, Title, Paragraph } = Typography;

const AdminReviewPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchText, setSearchText] = useState("");

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await ReviewService.getAllReviews(page, pagination.pageSize);
      if (res.success) {
        setData(res.reviews);
        setPagination({
          ...pagination,
          current: page,
          total: res.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Review",
      content: "Are you sure you want to delete this rating and review? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await ReviewService.deleteReview(id);
          message.success("Review deleted successfully");
          fetchReviews(pagination.current);
        } catch (error) {
          message.error("Failed to delete review");
        }
      },
    });
  };

  const columns = [
    {
      title: "Student",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.userId?.avatarURL} size="small" />
          <Text strong fontSize={13}>{record.userId?.fullname || "Unknown"}</Text>
        </Space>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      sorter: (a, b) => a.rating - b.rating,
      render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: 12 }} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (content) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{ margin: 0, maxWidth: 350 }}>
          {content || <Text type="secondary" italic>No comment provided</Text>}
        </Paragraph>
      ),
    },
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <Tag color="cyan">{record.courseId?.title || "Unknown Course"}</Tag>
      ),
    },
    {
      title: "Replies",
      key: "replies",
      width: 100,
      render: (_, record) => (
        record.instructorReply ? <Tag color="green">Replied</Tag> : <Tag>No Reply</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 150,
      render: (date) => <Text type="secondary">{formatTimeAgo(date)}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleDelete(record._id)}
        />
      ),
    },
  ];

  const filteredData = data.filter(item => 
    item.comment?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.userId?.fullname?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.courseId?.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Review Management</Title>
          <Text type="secondary">Monitor platform quality and student feedback</Text>
        </div>
        <Input
          placeholder="Search reviews, users or courses..."
          prefix={<SearchOutlined />}
          style={{ width: 300, borderRadius: 8 }}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            onChange: (page) => fetchReviews(page),
          }}
          size="middle"
        />
      </Card>
    </motion.div>
  );
};

export default AdminReviewPage;
