import {
  MessageOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CommentService from "../../../services/api/CommentService";
import { COLOR } from "../../../styles/adminTheme";
import { formatTimeAgo, pageVariants } from "../../../utils/helpers";

const { Text, Title, Paragraph } = Typography;

const AdminCommentPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchText, setSearchText] = useState("");

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await CommentService.getAllComments(page, pagination.pageSize);
      if (res.success) {
        setData(res.data);
        setPagination({
          ...pagination,
          current: page,
          total: res.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Comment",
      content: "Are you sure you want to delete this comment? This will also delete all its replies.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await CommentService.deleteComment(id);
          message.success("Comment deleted");
          fetchComments(pagination.current);
        } catch (error) {
          message.error("Failed to delete comment");
        }
      },
    });
  };

  const columns = [
    {
      title: "User",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.userId?.avatarURL} size="small" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong fontSize={13}>{record.userId?.fullname || "Unknown"}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{record.userId?._id}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{ margin: 0, maxWidth: 400 }}>
          {content}
        </Paragraph>
      ),
    },
    {
      title: "Course",
      key: "course",
      render: (_, record) => (
        <Tag color="blue">{record.courseId?.title || "Unknown Course"}</Tag>
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
    item.content?.toLowerCase().includes(searchText.toLowerCase()) ||
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
          <Title level={3} style={{ margin: 0 }}>Comment Management</Title>
          <Text type="secondary">Review and moderate user discussions across all courses</Text>
        </div>
        <Input
          placeholder="Search comments, users or courses..."
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
            onChange: (page) => fetchComments(page),
          }}
          size="middle"
        />
      </Card>
    </motion.div>
  );
};

export default AdminCommentPage;
