import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import { COLOR } from "../../../styles/adminTheme";

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const fmtDuration = (s) => {
  if (!s) return null;
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── CourseCard ───────────────────────────────────────────────────────────────
const CourseCard = ({ course, onApprove, onReject, processing }) => {
  const navigate = useNavigate();
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const duration = fmtDuration(course.totalDuration);
  const totalLessons = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );
  const isProcessing = processing === course._id;

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      hoverable
    >
      {/* Thumbnail — fixed aspect ratio, object-fit: cover */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%" /* 16:9 */,
          background: COLOR.gray100,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=338&fit=crop"
          }
          alt={course.title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=338&fit=crop";
          }}
        />
        {/* Overlay badges */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Tag
            color="blue"
            style={{
              borderRadius: 6,
              fontWeight: 600,
              margin: 0,
              backdropFilter: "blur(4px)",
            }}
          >
            {course.category?.name ?? "—"}
          </Tag>
          <Text
            strong
            style={{
              color: "white",
              fontSize: 17,
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            }}
          >
            {course.price === 0 ? "Free" : `$${course.price}`}
          </Text>
        </div>
      </div>

      <div
        style={{
          padding: 20,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Level */}
        <Space size={6} style={{ marginBottom: 6 }}>
          <Tag style={{ borderRadius: 6, fontWeight: 600 }}>{course.level}</Tag>
        </Space>

        {/* Title */}
        <Title
          level={5}
          style={{ margin: "0 0 4px", color: COLOR.ocean, lineHeight: 1.4 }}
          ellipsis={{ rows: 2, tooltip: course.title }}
        >
          {course.title}
        </Title>

        {/* Instructor */}
        <Space size={6} style={{ marginBottom: 8 }}>
          <UserOutlined style={{ color: COLOR.gray500, fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {instructor}
          </Text>
        </Space>

        {/* Description */}
        {course.description && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={{ fontSize: 12, marginBottom: 12 }}
          >
            {course.description}
          </Paragraph>
        )}

        {/* Meta */}
        <Space
          split={<Text type="secondary">·</Text>}
          style={{ marginBottom: 12, flexWrap: "wrap" }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            {totalLessons} lessons
          </Text>
          {duration && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {duration}
            </Text>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            {course.sections?.length ?? 0} sections
          </Text>
        </Space>

        {/* Curriculum preview */}
        {(course.sections?.length ?? 0) > 0 && (
          <div
            style={{
              background: COLOR.gray50,
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 14,
              flex: 1,
            }}
          >
            <Text
              type="secondary"
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 4,
              }}
            >
              Curriculum
            </Text>
            {course.sections.slice(0, 3).map((sec, i) => (
              <div
                key={sec._id ?? i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 12 }} ellipsis>
                  {sec.title}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}
                >
                  {sec.items?.length ?? 0} items
                </Text>
              </div>
            ))}
            {course.sections.length > 3 && (
              <Text
                type="secondary"
                style={{ fontSize: 11, marginTop: 4, display: "block" }}
              >
                +{course.sections.length - 3} more sections
              </Text>
            )}
          </div>
        )}

        {/* Actions */}
        <Space style={{ width: "100%", marginTop: "auto" }}>
          <Tooltip title="Preview course detail">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/courses/${course._id}`)}
              style={{ borderRadius: 8 }}
            />
          </Tooltip>
          <Button
            danger
            icon={<CloseOutlined />}
            disabled={isProcessing}
            loading={isProcessing}
            onClick={() => onReject(course._id)}
            style={{ flex: 1, borderRadius: 8, fontWeight: 600 }}
          >
            Reject
          </Button>
          <Button
            type="default"
            icon={<CheckOutlined />}
            disabled={isProcessing}
            loading={isProcessing}
            onClick={() => onApprove(course._id)}
            style={{ flex: 1, borderRadius: 8, fontWeight: 600 }}
          >
            Approve
          </Button>
        </Space>
      </div>
    </Card>
  );
};

// ─── RejectModal ──────────────────────────────────────────────────────────────
const RejectModal = ({ open, onConfirm, onCancel }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      form.resetFields();
      onConfirm(values.reason);
    } catch {
      // validation failed — keep modal open
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title="Reject Course"
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Reject"
      okButtonProps={{ danger: true }}
      width={480}
      destroyOnClose
    >
      <Alert
        type="warning"
        showIcon
        message="A rejection reason is required so the instructor can improve their course."
        style={{ marginBottom: 16, borderRadius: 8 }}
      />
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="Rejection Reason"
          rules={[
            {
              required: true,
              message: "Please provide a reason for rejection.",
            },
            { min: 10, message: "Reason must be at least 10 characters." },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="e.g. The course content is incomplete — sections 3 and 4 are missing video content. Please add lesson videos before resubmitting."
            style={{ borderRadius: 8 }}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── AdminApprovalPage ────────────────────────────────────────────────────────
const AdminApprovalPage = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    CourseService.getPendingCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load pending courses"))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (courseId) => {
    setProcessing(courseId);
    try {
      await CourseService.approveCourse(courseId);
      toast.success("Course approved and published!");
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Approve failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    const courseId = rejectTarget;
    setRejectTarget(null);
    setProcessing(courseId);
    try {
      await CourseService.rejectCourse(courseId, reason);
      toast.success("Course rejected. The instructor has been notified.");
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Reject failed");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AdminPageLayout>
      <PageHeader
        title="Course Approval"
        subtitle={
          courses.length > 0
            ? `${courses.length} course${courses.length > 1 ? "s" : ""} pending review`
            : "All caught up — no pending reviews"
        }
        extra={
          courses.length > 0 && (
            <Badge
              count={courses.length}
              style={{ backgroundColor: COLOR.warning }}
            >
              <ClockCircleOutlined
                style={{ fontSize: 22, color: COLOR.warning }}
              />
            </Badge>
          )
        }
      />

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
        >
          <Spin size="large" />
        </div>
      ) : courses.length === 0 ? (
        <Card
          bordered={false}
          style={{ borderRadius: 16, textAlign: "center", padding: "48px 0" }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong style={{ fontSize: 18 }}>
                  All clear!
                </Text>
                <Text type="secondary">
                  No courses pending review at the moment.
                </Text>
              </Space>
            }
          />
        </Card>
      ) : (
        <Row gutter={[20, 20]} align="stretch">
          {courses.map((course) => (
            <Col
              key={course._id}
              xs={24}
              md={12}
              lg={8}
              style={{ display: "flex" }}
            >
              <div style={{ width: "100%" }}>
                <CourseCard
                  course={course}
                  onApprove={handleApprove}
                  onReject={(id) => setRejectTarget(id)}
                  processing={processing}
                />
              </div>
            </Col>
          ))}
        </Row>
      )}

      <RejectModal
        open={!!rejectTarget}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />
    </AdminPageLayout>
  );
};

export default AdminApprovalPage;
