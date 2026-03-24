import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
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
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminPageLayout from "../../../components/admin/AdminPageLayout";
import PageHeader from "../../../components/admin/PageHeader";
import CourseDetailModal from "../../../components/shared/CourseDetailModal";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import { COLOR } from "../../../styles/adminTheme";
import { formatDurationClock, formatThousands } from "../../../utils/helpers";

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// ─── FilterBar ────────────────────────────────────────────────────────────────
const FilterBar = ({
  total,
  filtered,
  onSearch,
  onDateChange,
  onReset,
  hasFilter,
}) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 14,
      marginBottom: 20,
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    }}
    bodyStyle={{ padding: "14px 20px" }}
  >
    <Row gutter={[12, 12]} align="middle">
      <Col xs={24} sm={12} md={8}>
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: COLOR.gray500 }} />}
          placeholder="Search by course title..."
          onChange={(e) => onSearch(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </Col>
      <Col xs={24} sm={12} md={10}>
        <RangePicker
          style={{ width: "100%", borderRadius: 8 }}
          placeholder={["Submitted from", "Submitted to"]}
          onChange={onDateChange}
          format="DD/MM/YYYY"
          disabledDate={(d) => d && d.isAfter(dayjs(), "day")}
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Row justify="space-between" align="middle" gutter={8}>
          <Col>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Showing{" "}
              <Text strong style={{ color: COLOR.ocean }}>
                {filtered}
              </Text>{" "}
              / {total} pending
            </Text>
          </Col>
          {hasFilter && (
            <Col>
              <Button
                size="small"
                onClick={onReset}
                style={{ borderRadius: 6 }}
              >
                Reset
              </Button>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  </Card>
);

// ─── CourseCard ───────────────────────────────────────────────────────────────
const CourseCard = ({
  course,
  onApprove,
  onReject,
  onViewDetail,
  processing,
}) => {
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const duration = formatDurationClock(course.totalDuration);
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
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      bodyStyle={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      hoverable
    >
      {/* Thumbnail — 16:9 fixed */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
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
            {course.price === 0 ? "Free" : formatThousands(course.price)}
          </Text>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: 20,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Space size={6} style={{ marginBottom: 6 }}>
          <Tag style={{ borderRadius: 6, fontWeight: 600 }}>{course.level}</Tag>
        </Space>

        <Title
          level={5}
          style={{
            margin: "0 0 4px",
            color: COLOR.ocean,
            lineHeight: 1.4,
            minHeight: 44,
          }}
          ellipsis={{ rows: 2, tooltip: course.title }}
        >
          {course.title}
        </Title>

        <Space size={6} style={{ marginBottom: 8 }}>
          <UserOutlined style={{ color: COLOR.gray500, fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {instructor}
          </Text>
        </Space>

        <div style={{ minHeight: 36, marginBottom: 12 }}>
          {course.description ? (
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{ fontSize: 12, margin: 0 }}
            >
              {course.description}
            </Paragraph>
          ) : (
            <Text
              type="secondary"
              style={{ fontSize: 12, fontStyle: "italic" }}
            >
              No description
            </Text>
          )}
        </div>

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

        {/* Submitted date */}
        {course.updatedAt && (
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 10 }}>
            Submitted: {dayjs(course.updatedAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        )}

        {/* Curriculum preview */}
        <div
          style={{
            background: COLOR.gray50,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 14,
            minHeight: 80,
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
          {(course.sections?.length ?? 0) === 0 ? (
            <Text
              type="secondary"
              style={{ fontSize: 12, fontStyle: "italic" }}
            >
              No sections yet
            </Text>
          ) : (
            course.sections.slice(0, 3).map((sec, i) => (
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
            ))
          )}
          {(course.sections?.length ?? 0) > 3 && (
            <Text
              type="secondary"
              style={{ fontSize: 11, marginTop: 4, display: "block" }}
            >
              +{course.sections.length - 3} more sections
            </Text>
          )}
        </div>

        {/* Actions */}
        <Space style={{ width: "100%", marginTop: "auto" }}>
          <Tooltip title="View full details & preview content">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(course)}
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
      /* validation failed */
    }
  };

  return (
    <Modal
      open={open}
      title="Reject Course"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
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
            placeholder="e.g. The course content is incomplete — sections 3 and 4 are missing video content."
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

  // raw data from API
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  // filter state
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const debounceRef = useRef(null);

  // detail modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch with current filters ────────────────────────────────────────────
  const fetchCourses = useCallback(
    (kw = keyword, range = dateRange) => {
      setLoading(true);
      CourseService.getPendingCourses({
        keyword: kw,
        dateFrom: range?.[0]
          ? range[0].startOf("day").toISOString()
          : undefined,
        dateTo: range?.[1] ? range[1].endOf("day").toISOString() : undefined,
      })
        .then(setCourses)
        .catch(() => toast.error("Failed to load pending courses"))
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    fetchCourses("", [null, null]);
  }, []);

  // ── Debounced keyword search ──────────────────────────────────────────────
  const handleSearch = (value) => {
    setKeyword(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCourses(value, dateRange);
    }, 400);
  };

  // ── Date range change ─────────────────────────────────────────────────────
  const handleDateChange = (dates) => {
    setDateRange(dates ?? [null, null]);
    fetchCourses(keyword, dates ?? [null, null]);
  };

  // ── Reset filters ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setKeyword("");
    setDateRange([null, null]);
    fetchCourses("", [null, null]);
  };

  const hasFilter = keyword.trim() !== "" || dateRange?.[0] != null;

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (courseId) => {
    setProcessing(courseId);
    try {
      await CourseService.approveCourse(courseId);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      if (selectedCourse?._id === courseId) setModalOpen(false);
    } catch {
      toast.error("Failed to approve course");
    } finally {
      setProcessing(null);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleRejectConfirm = async (reason) => {
    const courseId = rejectTarget;
    setRejectTarget(null);
    setProcessing(courseId);
    try {
      await CourseService.rejectCourse(courseId, reason);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      if (selectedCourse?._id === courseId) setModalOpen(false);
    } catch {
      toast.error("Failed to reject course");
    } finally {
      setProcessing(null);
    }
  };

  // ── View detail ───────────────────────────────────────────────────────────
  const handleViewDetail = async (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const { course: full } = await CourseService.getCourseDetail(course._id);
      if (full) setSelectedCourse(full);
    } catch {
      /* keep basic */
    } finally {
      setDetailLoading(false);
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

      {/* Filter bar — always visible */}
      <FilterBar
        total={courses.length}
        filtered={courses.length}
        onSearch={handleSearch}
        onDateChange={handleDateChange}
        onReset={handleReset}
        hasFilter={hasFilter}
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
                  {hasFilter ? "No results found" : "All clear!"}
                </Text>
                <Text type="secondary">
                  {hasFilter
                    ? "Try adjusting your search or date range."
                    : "No courses pending review at the moment."}
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
              <div style={{ width: "100%", display: "flex" }}>
                <CourseCard
                  course={course}
                  onApprove={handleApprove}
                  onReject={(id) => setRejectTarget(id)}
                  onViewDetail={handleViewDetail}
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

      <CourseDetailModal
        course={selectedCourse}
        open={modalOpen}
        loading={detailLoading}
        onClose={() => {
          setModalOpen(false);
          setSelectedCourse(null);
        }}
      />
    </AdminPageLayout>
  );
};

export default AdminApprovalPage;
