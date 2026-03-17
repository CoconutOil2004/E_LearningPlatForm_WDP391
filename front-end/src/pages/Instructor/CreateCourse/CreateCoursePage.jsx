import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PictureOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  SendOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Progress,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import { motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  INSTRUCTOR_COLORS,
  INSTRUCTOR_STATUS_CONFIG,
} from "../../../../src/styles/instructorTheme";
import CourseService from "../../../services/api/CourseService";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UploadingContext = createContext({
  count: 0,
  inc: () => {},
  dec: () => {},
});

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// ─── Video Upload Cell ────────────────────────────────────────────────────────
const VideoUploadCell = ({ lesson, onUploaded }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const { inc, dec } = useContext(UploadingContext);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    inc(); // Báo có 1 upload mới bắt đầu
    try {
      const res = await CourseService.uploadVideo(file, setProgress);
      if (res) onUploaded(res);
    } catch {
      message.error("Failed to upload video");
    } finally {
      setUploading(false);
      setProgress(0);
      dec(); // Báo upload kết thúc
      e.target.value = ""; // Reset input để có thể chọn lại file cũ nếu cần
    }
  };

  // Trạng thái: Đã tải video thành công
  if (lesson.videoUrl)
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 shrink-0">
        <CheckCircleOutlined className="text-green-500" />
        <span className="text-xs font-semibold text-green-600">
          Video uploaded
        </span>
        <button
          type="button"
          className="flex items-center justify-center w-5 h-5 ml-1 text-red-400 transition-colors rounded hover:text-red-600 hover:bg-red-100"
          onClick={() => onUploaded(null)}
        >
          <CloseOutlined className="text-[10px]" />
        </button>
      </div>
    );

  // Trạng thái: Đang chờ tải hoặc đang tải
  return (
    <div className="flex items-center shrink-0">
      {/* Ẩn tuyệt đối thẻ input mặc định */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {uploading ? (
        <div className="flex items-center w-32 px-2">
          <Progress
            percent={progress}
            size="small"
            strokeColor={INSTRUCTOR_COLORS.primary}
            className="m-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-600 transition-colors border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 hover:border-purple-300"
        >
          <VideoCameraOutlined /> Upload video
        </button>
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
    <div className="relative p-4 mb-3 bg-white border border-gray-200 rounded-xl group">
      <Button
        size="small"
        type="text"
        danger
        className="absolute transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100"
        icon={<DeleteOutlined />}
        onClick={onRemove}
      />
      <Input
        placeholder="Enter question content..."
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        className="mb-4 font-medium"
        variant="filled"
      />
      <div className="pl-2 space-y-2 border-l-2 border-purple-100">
        {(question.options || []).map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...question, correctAnswer: oi })}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                question.correctAnswer === oi
                  ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {oi + 1}
            </button>
            <Input
              placeholder={`Option ${oi + 1}`}
              value={opt}
              onChange={(e) => updateOption(oi, e.target.value)}
              className="flex-1"
            />
            {question.correctAnswer === oi && (
              <Tag
                color="purple"
                className="m-0 font-semibold text-purple-600 border-none bg-purple-50"
              >
                ✓ Correct Answer
              </Tag>
            )}
          </div>
        ))}
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addOption}
          className="mt-2 text-purple-500 border-purple-200 hover:border-purple-400 hover:text-purple-600"
        >
          Add option
        </Button>
      </div>
    </div>
  );
};

// ─── Section Editor ───────────────────────────────────────────────────────────
const SectionEditor = ({
  section,
  idx,
  onChange,
  onRemove,
  isLocked,
  isUploading = false,
}) => {
  // Khi đang upload: block mọi thao tác thêm/xoá để tránh mất data
  const blocked = isLocked || isUploading;
  const addItem = (type) => {
    const newItem =
      type === "lesson"
        ? {
            _uid: Date.now(),
            itemType: "lesson",
            title: "",
            videoUrl: "",
            videoPublicId: "",
            duration: 0,
            itemId: null,
          }
        : {
            _uid: Date.now() + 1,
            itemType: "quiz",
            title: "Quiz",
            questions: [],
            itemId: null,
          };
    onChange({ ...section, items: [...section.items, newItem] });
  };

  const updateItem = (li, patch) =>
    onChange({
      ...section,
      items: section.items.map((it, i) =>
        i === li ? { ...it, ...patch } : it,
      ),
    });

  const removeItem = (li) =>
    onChange({ ...section, items: section.items.filter((_, i) => i !== li) });

  const questionActions = {
    add: (li) => {
      const item = section.items[li];
      updateItem(li, {
        questions: [
          ...(item.questions || []),
          { text: "", options: ["", ""], correctAnswer: 0 },
        ],
      });
    },
    update: (li, qi, patch) => {
      const item = section.items[li];
      updateItem(li, {
        questions: (item.questions || []).map((q, i) => (i === qi ? patch : q)),
      });
    },
    remove: (li, qi) => {
      const item = section.items[li];
      updateItem(li, {
        questions: (item.questions || []).filter((_, i) => i !== qi),
      });
    },
  };

  return (
    <div className="relative p-5 mb-6 transition-colors bg-white border border-gray-100 shadow-sm rounded-2xl group/section hover:border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 font-bold text-purple-700 bg-purple-100 rounded-lg shrink-0">
          {idx + 1}
        </div>
        <Input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Enter section title..."
          className="px-0 text-lg font-bold border-none shadow-none focus:ring-0"
          disabled={blocked}
        />
        {!isLocked && (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
            disabled={isUploading}
            className="transition-opacity opacity-0 group-hover/section:opacity-100"
          />
        )}
      </div>

      <div className="pl-4 ml-4 space-y-3 border-l-2 border-gray-100">
        {section.items.map((item, li) => (
          <div
            key={item._uid ?? item.itemId ?? li}
            className="relative group/item"
          >
            {item.itemType === "lesson" ? (
              <div className="relative flex items-center gap-3 p-3 transition-all bg-white border border-gray-100 shadow-sm group/item rounded-xl hover:border-purple-200 hover:shadow-md">
                {/* Icon bên trái */}
                <div className="flex items-center justify-center w-8 h-8 text-purple-500 rounded-lg bg-purple-50 shrink-0">
                  <VideoCameraOutlined />
                </div>

                {/* Input nhập tên bài học */}
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(li, { title: e.target.value })}
                  placeholder="Lesson title..."
                  variant="borderless"
                  className="flex-1 px-0 font-medium bg-transparent focus:ring-0"
                  disabled={blocked}
                />

                {/* Nút Upload Video */}
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

                {/* Nút Xóa (Thùng rác) */}
                {!isLocked && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(li)}
                    disabled={isUploading}
                    className="flex items-center justify-center w-8 h-8 transition-opacity opacity-0 shrink-0 group-hover/item:opacity-100 hover:bg-red-50"
                  />
                )}
              </div>
            ) : (
              <Collapse
                className="overflow-hidden border-gray-100 bg-gray-50 rounded-xl"
                expandIconPosition="end"
                items={[
                  {
                    key: "1",
                    label: (
                      <div className="flex items-center gap-3">
                        <div className="p-2 text-pink-500 bg-white rounded-lg shadow-sm">
                          <QuestionCircleOutlined />
                        </div>
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            updateItem(li, { title: e.target.value })
                          }
                          placeholder="Quiz title..."
                          variant="borderless"
                          className="flex-1 font-medium"
                          disabled={blocked}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Tag
                          color="pink"
                          className="font-semibold text-pink-600 border-none rounded-md bg-pink-50"
                        >
                          Quiz
                        </Tag>
                        {!isLocked && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(li);
                            }}
                            disabled={isUploading}
                            className="opacity-0 group-hover/item:opacity-100"
                          />
                        )}
                      </div>
                    ),
                    children: (
                      <div className="p-2 bg-gray-50/50 rounded-b-xl">
                        {(item.questions || []).map((q, qi) => (
                          <QuestionEditor
                            key={qi}
                            question={q}
                            onChange={(patch) =>
                              questionActions.update(li, qi, patch)
                            }
                            onRemove={() => questionActions.remove(li, qi)}
                          />
                        ))}
                        {!isLocked && (
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => questionActions.add(li)}
                            disabled={isUploading}
                            className="w-full mt-2 text-purple-600 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
                          >
                            Add question
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
          <Space className="pt-3">
            <button
              type="button"
              onClick={() => !isUploading && addItem("lesson")}
              disabled={isUploading}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors bg-white border rounded-lg shadow-sm ${
                isUploading
                  ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                  : "text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              <VideoCameraOutlined /> Add Lesson
            </button>
            <button
              type="button"
              onClick={() => !isUploading && addItem("quiz")}
              disabled={isUploading}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors bg-white border rounded-lg shadow-sm ${
                isUploading
                  ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                  : "text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600"
              }`}
            >
              <QuestionCircleOutlined /> Add Quiz
            </button>
          </Space>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const [uploadingCount, setUploadingCount] = useState(0);
  const incUploading = useCallback(() => setUploadingCount((c) => c + 1), []);
  const decUploading = useCallback(
    () => setUploadingCount((c) => Math.max(0, c - 1)),
    [],
  );

  const isLocked = ["pending", "published"].includes(status);
  const currentStatus =
    INSTRUCTOR_STATUS_CONFIG[status] || INSTRUCTOR_STATUS_CONFIG.draft;

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
      .catch(() => message.error("Failed to load course"));
  }, [editId, form]);

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
          (it.itemType === "quiz" ? `Quiz ${ii + 1}` : `Lesson ${ii + 1}`),
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
        language: values.language || "English",
        thumbnail: values.thumbnail || thumbnailUrl || null,
      });
      if (!created) throw new Error("Failed to create course");
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
    if (uploadingCount > 0) {
      message.warning(
        `Vui lòng đợi ${uploadingCount} video upload xong trước khi lưu!`,
      );
      return;
    }
    try {
      const values = await form.validateFields();
      setSaving(true);
      await saveAndGetId(values);
      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      if (err?.errorFields) return;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (uploadingCount > 0) {
      message.warning(
        `Vui lòng đợi ${uploadingCount} video upload xong trước khi nộp!`,
      );
      return;
    }
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const id = await saveAndGetId(values);
      await CourseService.submitCourse(id);
      setStatus("pending");
      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      if (err?.errorFields) return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UploadingContext.Provider
      value={{ count: uploadingCount, inc: incUploading, dec: decUploading }}
    >
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="pb-20"
      >
        <div className="max-w-5xl px-6 py-10 mx-auto">
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
                className="flex items-center justify-center w-10 h-10 transition-all bg-white border border-gray-200 shadow-sm rounded-xl hover:border-purple-300 hover:text-purple-600"
              >
                <ArrowLeftOutlined />
              </button>
              <div>
                <Title level={2} className="m-0 font-black text-gray-900">
                  {isEdit ? "Edit Course" : "Create New Course"}
                </Title>
                <Text type="secondary">Build your course curriculum</Text>
              </div>
            </div>

            {status && (
              <div
                className="px-4 py-2 text-sm font-bold border shadow-sm rounded-xl"
                style={{
                  backgroundColor: currentStatus.bg,
                  color: currentStatus.text,
                  borderColor: currentStatus.border,
                }}
              >
                {currentStatus.label}
              </div>
            )}
          </div>

          {isLocked && (
            <Alert
              message={`Course is currently "${currentStatus.label}" — content cannot be edited at this time.`}
              type="warning"
              showIcon
              className="mb-6 rounded-xl border-amber-200 bg-amber-50"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            disabled={isLocked}
            requiredMark={false}
          >
            {/* ── Basic Information ── */}
            <div className="p-8 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900">
                <BookOutlined style={{ color: INSTRUCTOR_COLORS.primary }} />{" "}
                Basic Information
              </h2>
              <Row gutter={[24, 16]}>
                <Col xs={24}>
                  <Form.Item
                    name="title"
                    label={
                      <span className="font-semibold text-gray-700">
                        Course Title
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter a title" },
                      { max: 60, message: "Maximum 60 characters" },
                    ]}
                  >
                    <Input
                      placeholder="Enter title..."
                      size="large"
                      className="rounded-lg"
                      showCount
                      maxLength={60}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label={
                      <span className="font-semibold text-gray-700">
                        Course Description
                      </span>
                    }
                  >
                    <TextArea
                      rows={4}
                      className="rounded-lg"
                      placeholder="What will students learn?"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="categoryId"
                    label={
                      <span className="font-semibold text-gray-700">
                        Category
                      </span>
                    }
                    rules={[{ required: true, message: "Select category" }]}
                  >
                    <Select size="large" placeholder="Select category">
                      {categories.map((c) => (
                        <Option key={c._id} value={c._id}>
                          {c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="level"
                    label={
                      <span className="font-semibold text-gray-700">Level</span>
                    }
                    initialValue="Beginner"
                  >
                    <Select size="large">
                      {LEVELS.map((l) => (
                        <Option key={l} value={l}>
                          {l}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="price"
                    label={
                      <span className="font-semibold text-gray-700">
                        Price (USD)
                      </span>
                    }
                    initialValue={0}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      size="large"
                      className="w-full rounded-lg"
                      addonBefore="$"
                    />
                  </Form.Item>
                  <Text type="secondary" className="text-xs italic">
                    Enter 0 for free.
                  </Text>
                </Col>

                {/* Upload Thumbnail */}
                <Col xs={24} sm={12}>
                  <Form.Item name="thumbnail" className="hidden">
                    <Input />
                  </Form.Item>
                  <div className="mb-2 font-semibold text-gray-700">
                    Course Thumbnail
                  </div>

                  <Upload
                    accept="image/*"
                    listType="picture-card" // Hiển thị dạng thẻ ảnh vuông (chuẩn Ant Design)
                    maxCount={1}
                    disabled={isLocked}
                    // Đồng bộ danh sách ảnh với state thumbnailUrl
                    fileList={
                      thumbnailUrl
                        ? [
                            {
                              uid: "-1",
                              name: "thumbnail.png",
                              status: "done",
                              url: thumbnailUrl,
                            },
                          ]
                        : []
                    }
                    // Xử lý logic tải ảnh lên server
                    customRequest={async ({ file, onSuccess, onError }) => {
                      try {
                        const uploaded = await CourseService.uploadImages(file);
                        const url = uploaded[0]?.url || uploaded[0]?.secure_url;

                        if (url) {
                          form.setFieldsValue({ thumbnail: url });
                          setThumbnailUrl(url);
                          onSuccess("ok");
                        } else {
                          throw new Error("No URL returned from server");
                        }
                      } catch (error) {}
                    }}
                    // Khi người dùng bấm nút xóa (thùng rác)
                    onRemove={() => {
                      form.setFieldsValue({ thumbnail: "" });
                      setThumbnailUrl("");
                    }}
                    // Khi người dùng bấm nút xem trước (con mắt)
                    onPreview={(file) => {
                      window.open(file.url || file.thumbUrl, "_blank");
                    }}
                  >
                    {/* Nút upload hiển thị khi chưa có ảnh */}
                    {!thumbnailUrl && (
                      <div className="flex flex-col items-center justify-center p-2 text-purple-500 transition-colors hover:text-purple-600">
                        <PictureOutlined className="mb-2 text-3xl text-purple-400" />
                        <div className="text-sm font-semibold">
                          Upload Image
                        </div>
                        <div className="mt-1 text-xs font-normal text-gray-400">
                          JPG / PNG
                        </div>
                      </div>
                    )}
                  </Upload>
                </Col>
              </Row>
            </div>

            {/* ── Curriculum ── */}
            <div
              className="p-8 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl"
              style={{ position: "relative" }}
            >
              {/* Upload-in-progress overlay banner */}
              {uploadingCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    padding: "10px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#fff",
                  }}
                >
                  <LoadingOutlined spin style={{ fontSize: 16 }} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    Uploading {uploadingCount} video...
                  </span>
                </div>
              )}
              {/* Spacer khi banner hiện */}
              {uploadingCount > 0 && <div style={{ height: 40 }} />}
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 m-0 text-xl font-bold text-gray-900">
                  <VideoCameraOutlined
                    style={{ color: INSTRUCTOR_COLORS.accent }}
                  />{" "}
                  Curriculum
                </h2>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => uploadingCount === 0 && addSection()}
                    disabled={uploadingCount > 0}
                    className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-colors ${
                      uploadingCount > 0
                        ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
                        : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                    }`}
                  >
                    <PlusOutlined /> Add new section
                  </button>
                )}
              </div>

              {sections.length === 0 ? (
                <div className="py-16 text-center border-2 border-gray-200 border-dashed rounded-2xl bg-gray-50">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white rounded-full shadow-sm">
                    <BookOutlined className="text-2xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700">
                    No content yet
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Start by adding your first section.
                  </p>
                  {!isLocked && (
                    <Button
                      type="primary"
                      className="mt-4 border-none rounded-lg"
                      style={{ background: INSTRUCTOR_COLORS.primary }}
                      icon={<PlusOutlined />}
                      onClick={addSection}
                    >
                      Add Section
                    </Button>
                  )}
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
                    isUploading={uploadingCount > 0}
                  />
                ))
              )}
            </div>
          </Form>

          {/* ── Actions Footer ── */}
          {!isLocked && (
            <div className="sticky flex items-center justify-end gap-4 p-4 border border-gray-200 shadow-lg bottom-6 bg-white/80 backdrop-blur-md rounded-2xl">
              <Tooltip
                title={
                  uploadingCount > 0
                    ? `Đang upload ${uploadingCount} video, vui lòng chờ...`
                    : ""
                }
              >
                <Button
                  size="large"
                  icon={
                    uploadingCount > 0 ? (
                      <LoadingOutlined spin />
                    ) : (
                      <SaveOutlined />
                    )
                  }
                  loading={saving}
                  disabled={uploadingCount > 0}
                  onClick={handleSaveDraft}
                  className="px-6 font-semibold text-gray-700 border-gray-300 rounded-xl hover:text-purple-600 hover:border-purple-300"
                >
                  {uploadingCount > 0
                    ? `Uploading (${uploadingCount})...`
                    : "Save Draft"}
                </Button>
              </Tooltip>
              <Tooltip
                title={
                  uploadingCount > 0
                    ? `Chờ ${uploadingCount} video upload xong`
                    : ""
                }
              >
                <button
                  onClick={handleSubmitForReview}
                  disabled={submitting || uploadingCount > 0}
                  className="flex items-center gap-2 px-8 py-3 font-bold text-white transition-all transform shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${INSTRUCTOR_COLORS.primary}, ${INSTRUCTOR_COLORS.primaryDark})`,
                  }}
                >
                  {submitting ? (
                    <SaveOutlined className="animate-spin" />
                  ) : (
                    <SendOutlined />
                  )}
                  Submit for Review
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.div>
    </UploadingContext.Provider>
  );
};

export default CreateCoursePage;
