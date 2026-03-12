import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  InboxOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  SendOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  message,
  Progress,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseService from "../../../services/api/CourseService";
import { ROUTES } from "../../../utils/constants";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGES = ["Tiếng Việt", "English", "Japanese", "Chinese", "Korean"];
const STATUS_COLORS = {
  published: "success",
  pending: "warning",
  rejected: "error",
  draft: "default",
};

// ─── Video Upload Cell ────────────────────────────────────────────────────────
const VideoUploadCell = ({ lesson, onUploaded }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await CourseService.uploadVideo(file, setProgress);
      if (res) onUploaded(res);
    } catch {
      message.error("Upload video thất bại");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (lesson.videoUrl)
    return (
      <Space>
        <CheckCircleOutlined style={{ color: "#10b981" }} />
        <Text style={{ color: "#10b981", fontSize: 12 }}>Đã tải video</Text>
        <Button
          size="small"
          type="text"
          danger
          icon={<CloseOutlined />}
          onClick={() => onUploaded(null)}
        />
      </Space>
    );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      {uploading ? (
        <div style={{ width: 120 }}>
          <Progress percent={progress} size="small" />
        </div>
      ) : (
        <Button
          size="small"
          icon={<VideoCameraOutlined />}
          onClick={() => inputRef.current?.click()}
        >
          Tải video
        </Button>
      )}
    </div>
  );
};

// ─── Question Editor ──────────────────────────────────────────────────────────
const QuestionEditor = ({ question, onChange, onRemove }) => {
  const updateOption = (idx, val) => {
    const opts = [...(question.options || [])];
    opts[idx] = val;
    onChange({ ...question, options: opts });
  };

  const addOption = () =>
    onChange({ ...question, options: [...(question.options || []), ""] });

  return (
    <Card
      size="small"
      style={{ marginBottom: 8, background: "#fafafa" }}
      extra={
        <Button
          size="small"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={onRemove}
        />
      }
    >
      <Input
        placeholder="Câu hỏi"
        value={question.text} // SỬA Ở ĐÂY: đổi từ question.question thành question.text
        onChange={(e) => onChange({ ...question, text: e.target.value })} // SỬA Ở ĐÂY: đổi question thành text
        style={{ marginBottom: 8 }}
      />
      <div style={{ marginLeft: 12 }}>
        {(question.options || []).map((opt, oi) => (
          <div
            key={oi}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <Button
              size="small"
              // SỬA Ở ĐÂY: đổi correctAnswerIndex thành correctAnswer
              type={question.correctAnswer === oi ? "primary" : "default"}
              onClick={() => onChange({ ...question, correctAnswer: oi })}
              style={{ minWidth: 30, padding: "0 6px" }}
            >
              {oi + 1}
            </Button>
            <Input
              size="small"
              placeholder={`Đáp án ${oi + 1}`}
              value={opt}
              onChange={(e) => updateOption(oi, e.target.value)}
            />
            {/* SỬA Ở ĐÂY: đổi correctAnswerIndex thành correctAnswer */}
            {question.correctAnswer === oi && (
              <Tag color="success" style={{ margin: 0 }}>
                ✓ Đúng
              </Tag>
            )}
          </div>
        ))}
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addOption}
          style={{ marginTop: 4 }}
        >
          Thêm đáp án
        </Button>
      </div>
    </Card>
  );
};

// ─── Section Editor ───────────────────────────────────────────────────────────
const SectionEditor = ({ section, idx, onChange, onRemove, isLocked }) => {
  const addLesson = () =>
    onChange({
      ...section,
      items: [
        ...section.items,
        {
          _uid: Date.now(),
          itemType: "lesson",
          title: "",
          videoUrl: "",
          videoPublicId: "",
          duration: 0,
          itemId: null,
        },
      ],
    });

  const addQuiz = () =>
    onChange({
      ...section,
      items: [
        ...section.items,
        {
          _uid: Date.now() + 1,
          itemType: "quiz",
          title: "Quiz",
          questions: [],
          itemId: null,
        },
      ],
    });

  const updateItem = (li, patch) =>
    onChange({
      ...section,
      items: section.items.map((it, i) =>
        i === li ? { ...it, ...patch } : it,
      ),
    });

  const removeItem = (li) =>
    onChange({ ...section, items: section.items.filter((_, i) => i !== li) });

  const addQuestion = (li) => {
    const item = section.items[li];
    updateItem(li, {
      questions: [
        ...(item.questions || []),
        { question: "", options: ["", ""], correctAnswerIndex: 0 },
      ],
    });
  };

  const updateQuestion = (li, qi, patch) => {
    const item = section.items[li];
    const questions = (item.questions || []).map((q, i) =>
      i === qi ? patch : q,
    );
    updateItem(li, { questions });
  };

  const removeQuestion = (li, qi) => {
    const item = section.items[li];
    updateItem(li, {
      questions: (item.questions || []).filter((_, i) => i !== qi),
    });
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag color="blue">{idx + 1}</Tag>
          <Input
            value={section.title}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            placeholder="Tên section"
            bordered={false}
            style={{ fontWeight: 600, padding: 0, flex: 1 }}
            disabled={isLocked}
          />
        </div>
      }
      extra={
        !isLocked && (
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
          />
        )
      }
      style={{ marginBottom: 16, borderRadius: 12 }}
    >
      <div style={{ paddingLeft: 16 }}>
        {section.items.map((item, li) => (
          <div key={item._uid ?? item.itemId ?? li}>
            {item.itemType === "lesson" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "#f8fafc",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <VideoCameraOutlined style={{ color: "#667eea" }} />
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(li, { title: e.target.value })}
                  placeholder="Tên bài học"
                  bordered={false}
                  style={{ flex: 1 }}
                  disabled={isLocked}
                />
                {!isLocked && (
                  <VideoUploadCell
                    lesson={item}
                    onUploaded={(data) => {
                      if (!data)
                        updateItem(li, {
                          videoUrl: "",
                          videoPublicId: "",
                          duration: 0,
                        });
                      else
                        updateItem(li, {
                          videoUrl: data.videoUrl,
                          videoPublicId: data.publicId,
                          duration: data.duration,
                        });
                    }}
                  />
                )}
                {!isLocked && (
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(li)}
                  />
                )}
              </div>
            ) : (
              <Collapse
                style={{ marginBottom: 8, borderRadius: 8 }}
                items={[
                  {
                    key: "1",
                    label: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <QuestionCircleOutlined style={{ color: "#8B5CF6" }} />
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            updateItem(li, { title: e.target.value })
                          }
                          placeholder="Tên quiz"
                          bordered={false}
                          style={{ flex: 1 }}
                          disabled={isLocked}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Tag color="purple">Quiz</Tag>
                        {!isLocked && (
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(li);
                            }}
                          />
                        )}
                      </div>
                    ),
                    children: (
                      <div>
                        {(item.questions || []).map((q, qi) => (
                          <QuestionEditor
                            key={qi}
                            question={q}
                            onChange={(patch) => updateQuestion(li, qi, patch)}
                            onRemove={() => removeQuestion(li, qi)}
                          />
                        ))}
                        {!isLocked && (
                          <Button
                            size="small"
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => addQuestion(li)}
                          >
                            Thêm câu hỏi
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ))}

        {!isLocked && (
          <Space style={{ marginTop: 8 }}>
            <Button
              size="small"
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addLesson}
            >
              Thêm bài học
            </Button>
            <Button
              size="small"
              type="dashed"
              icon={<QuestionCircleOutlined />}
              onClick={addQuiz}
            >
              Thêm quiz
            </Button>
          </Space>
        )}
      </div>
    </Card>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const CreateCoursePage = () => {
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(editId);

  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState("draft");
  const [courseId, setCourseId] = useState(editId ?? null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const isLocked = ["pending", "published"].includes(status);

  useEffect(() => {
    CourseService.getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    CourseService.getCourseDetail(editId)
      .then(({ course: c }) => {
        if (!c) return;
        form.setFieldsValue({
          title: c.title ?? "",
          description: c.description ?? "",
          categoryId: c.category?._id ?? c.category ?? "",
          level: c.level ?? "Beginner",
          price: c.price ?? 0,
          language: c.language ?? "Tiếng Việt",
          thumbnail: c.thumbnail ?? "",
        });
        setThumbnailUrl(c.thumbnail ?? "");
        setStatus(c.status ?? "draft");
        const rebuilt = (c.sections ?? []).map((sec, si) => ({
          title: sec.title,
          items: (sec.items ?? []).map((it, ii) => ({
            _uid: `${si}-${ii}`,
            itemType: it.itemType,
            itemId: it.itemId?._id ?? it.itemId ?? null,
            title: it.title,
            videoUrl: it.itemId?.videoUrl ?? "",
            videoPublicId: it.itemId?.videoPublicId ?? "",
            duration: it.itemId?.duration ?? 0,
            questions: it.itemId?.questions ?? [],
          })),
        }));
        setSections(rebuilt);
      })
      .catch(() => message.error("Không thể tải khóa học"));
  }, [editId]);

  const addSection = () =>
    setSections((prev) => [...prev, { title: "", items: [] }]);
  const updateSection = (idx, sec) =>
    setSections((prev) => prev.map((s, i) => (i === idx ? sec : s)));
  const removeSection = (idx) =>
    setSections((prev) => prev.filter((_, i) => i !== idx));

  const buildSections = () =>
    sections.map((sec, si) => ({
      title: sec.title || `Section ${si + 1}`,
      items: sec.items.map((it, ii) => ({
        itemType: it.itemType ?? "lesson",
        itemRef: it.itemType === "quiz" ? "Quiz" : "Lesson",
        title:
          it.title ||
          (it.itemType === "quiz" ? `Quiz ${ii + 1}` : `Bài ${ii + 1}`),
        orderIndex: ii + 1,
        ...(it.itemId && { itemId: it.itemId }),
        ...(it.itemType === "lesson" && {
          ...(it.videoUrl && { videoUrl: it.videoUrl }),
          ...(it.videoPublicId && { videoPublicId: it.videoPublicId }),
          ...(it.duration && { duration: it.duration }),
        }),
        ...(it.itemType === "quiz" && { questions: it.questions ?? [] }),
      })),
    }));

  const saveAndGetId = async (values) => {
    let id = courseId;
    if (!id) {
      const created = await CourseService.createCourse({
        title: values.title.trim(),
        description: values.description,
        categoryId: values.categoryId,
        level: values.level,
        language: values.language || "Tiếng Việt",
      });
      if (!created) throw new Error("Tạo khóa học thất bại");
      id = created._id;
      setCourseId(id);
    }
    await CourseService.updateCourse(id, {
      title: values.title.trim(),
      description: values.description,
      categoryId: values.categoryId,
      level: values.level,
      price: Number(values.price || 0),
      language: values.language,
      thumbnail: values.thumbnail,
      sections: buildSections(),
    });
    return id;
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await saveAndGetId(values);
      message.success("Lưu nháp thành công!");
    } catch (err) {
      if (err?.errorFields) return; // validation
      message.error(err?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const id = await saveAndGetId(values);
      await CourseService.submitCourse(id);
      message.success("Đã gửi khóa học để xét duyệt!");
      setStatus("pending");
      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || "Gửi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
        />
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </Title>
        </div>
        {status && (
          <Tag
            color={STATUS_COLORS[status] || "default"}
            style={{ textTransform: "capitalize", fontSize: 13 }}
          >
            {status}
          </Tag>
        )}
      </div>

      {isLocked && (
        <Alert
          message={`Khóa học đang ở trạng thái "${status}" — không thể chỉnh sửa.`}
          type="warning"
          showIcon
          style={{ marginBottom: 24, borderRadius: 10 }}
        />
      )}

      <Form form={form} layout="vertical" disabled={isLocked}>
        {/* ── Course Info ─── */}
        <Card
          title="Thông tin khóa học"
          style={{ borderRadius: 16, marginBottom: 20 }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề" },
                  { max: 60, message: "Tối đa 60 ký tự" },
                ]}
              >
                <Input
                  placeholder="Tiêu đề khóa học (tối đa 60 ký tự)"
                  showCount
                  maxLength={60}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="description" label="Mô tả">
                <TextArea
                  rows={4}
                  placeholder="Học viên sẽ học được gì trong khóa này?"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="level"
                label="Cấp độ"
                rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
                initialValue="Beginner"
              >
                <Select>
                  {LEVELS.map((l) => (
                    <Option key={l} value={l}>
                      {l}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="language"
                label="Ngôn ngữ"
                initialValue="Tiếng Việt"
              >
                <Select>
                  {LANGUAGES.map((l) => (
                    <Option key={l} value={l}>
                      {l}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="price" label="Giá (USD)" initialValue={0}>
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  placeholder="0 = Miễn phí"
                  addonBefore="$"
                />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12 }}>
                0 = Miễn phí
              </Text>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="thumbnail" label="Ảnh bìa (thumbnail)">
                <Input
                  placeholder="https://... hoặc tải ảnh lên"
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </Form.Item>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="thumbnail-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("image", file);
                    try {
                      const { api } = await import("../../../services/index");
                      const res = await api.post("/images/upload", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      const url =
                        res.data?.data?.secure_url || res.data?.data?.url;
                      if (url) {
                        form.setFieldsValue({ thumbnail: url });
                        setThumbnailUrl(url);
                        message.success("Tải ảnh thành công");
                      }
                    } catch {
                      message.error("Tải ảnh thất bại");
                    }
                    e.target.value = "";
                  }}
                />
                <Button
                  size="small"
                  icon={<InboxOutlined />}
                  onClick={() =>
                    document.getElementById("thumbnail-upload").click()
                  }
                  disabled={isLocked}
                >
                  Tải ảnh lên
                </Button>
              </div>
              {thumbnailUrl && (
                <div style={{ marginTop: 4, marginBottom: 8 }}>
                  <img
                    src={thumbnailUrl}
                    alt="thumbnail preview"
                    style={{
                      width: "100%",
                      maxHeight: 150,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    onError={() => setThumbnailUrl("")}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* ── Curriculum ─── */}
        <Card
          title="Chương trình học"
          style={{ borderRadius: 16, marginBottom: 20 }}
          extra={
            !isLocked && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addSection}
              >
                Thêm section
              </Button>
            )
          }
        >
          {sections.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#9ca3af",
              }}
            >
              <BookOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div>
                Chưa có section. Nhấn "Thêm section" để bắt đầu xây dựng chương
                trình học.
              </div>
            </div>
          ) : (
            sections.map((sec, idx) => (
              <SectionEditor
                key={idx}
                section={sec}
                idx={idx}
                onChange={(updated) => updateSection(idx, updated)}
                onRemove={() => removeSection(idx)}
                isLocked={isLocked}
              />
            ))
          )}
        </Card>
      </Form>

      {/* ── Actions ─── */}
      {!isLocked && (
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button
            size="large"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSaveDraft}
            style={{ borderRadius: 12, minWidth: 140 }}
          >
            Lưu nháp
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleSubmitForReview}
            style={{
              borderRadius: 12,
              minWidth: 180,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              border: "none",
            }}
          >
            Gửi xét duyệt
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateCoursePage;
