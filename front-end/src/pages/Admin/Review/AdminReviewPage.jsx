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
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import ReviewService from "../../../services/api/ReviewService";
import { COLOR } from "../../../styles/adminTheme";
import { formatTimeAgo } from "../../../utils/helpers";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";

const { Text, Paragraph } = Typography;

const AdminReviewPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [rating, setRating] = useState(undefined);

  const fetchReviews = async (page = 1, search = searchText, rat = rating) => {
    setLoading(true);
    try {
      const res = await ReviewService.getAllReviews({
        page,
        limit: pagination.pageSize,
        search: search.trim() || undefined,
        rating: rat,
      });
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
    fetchReviews(1);
  }, [rating]);

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
          <Text strong style={{ fontSize: 13 }}>{record.userId?.fullname || "Unknown"}</Text>
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

  return (
    <AdminPageLayout>
      <PageHeader
        title="Review Management"
        subtitle="Monitor platform quality and student feedback"
        extra={
          <Space wrap>
            <Select
              placeholder="Filter by Rating"
              style={{ width: 150 }}
              allowClear
              onChange={(val) => setRating(val)}
              options={[
                { value: 5, label: "5 Stars" },
                { value: 4, label: "4 Stars" },
                { value: 3, label: "3 Stars" },
                { value: 2, label: "2 Stars" },
                { value: 1, label: "1 Star" },
              ]}
            />
            <Input.Search
              placeholder="Search reviews, users or courses..."
              style={{ width: 300 }}
              enterButton
              onSearch={() => fetchReviews(1)}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Space>
        }
      />

      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,119,182,0.06)", overflow: "hidden" }}
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            onChange: (page) => fetchReviews(page),
          }}
          size="middle"
        />
      </Card>
    </AdminPageLayout>
  );
};

export default AdminReviewPage;
