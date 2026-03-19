import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  // FileTextOutlined,
  LoadingOutlined,
  PictureOutlined,
  SaveOutlined,
  SendOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogService from "../../../services/api/BlogService";
import CourseService from "../../../services/api/CourseService";
import UserService from "../../../services/api/UserService";
import { pageVariants } from "../../../utils/helpers";
import BlogTinyEditor from "../../../components/blog/BlogTinyEditor";

const { Title, Text } = Typography;
const { TextArea } = Input;

const C = {
  primary: "#6366f1",
  primaryBg: "rgba(99,102,241,0.08)",
  mint: "#10b981",
  amber: "#f59e0b",
  border: "#f1f0fe",
  text: "#111827",
  textSub: "#6b7280",
  textMuted: "#9ca3af",
  gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
};

const card = {
  borderRadius: 16,
  border: "1px solid #f1f0fe",
  boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
};

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut", delay },
});

const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState("");
  const add = (raw) => {
    const val = raw.trim().replace(/,+$/, "");
    if (val && !tags.includes(val) && tags.length < 10)
      onChange([...tags, val]);
    setInput("");
  };
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "8px 11px",
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        minHeight: 40,
        cursor: "text",
        background: "white",
      }}
      onClick={() => document.getElementById("blogTagInput")?.focus()}
    >
      {tags.map((t) => (
        <Tag
          key={t}
          closable
          onClose={() => onChange(tags.filter((x) => x !== t))}
          style={{
            borderRadius: 20,
            fontWeight: 600,
            fontSize: 12,
            border: "none",
            background: C.primaryBg,
            color: C.primary,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {t}
        </Tag>
      ))}
      <input
        id="blogTagInput"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(input);
          }
        }}
        onBlur={() => input.trim() && add(input)}
        placeholder={tags.length === 0 ? "Add tag, press Enter..." : ""}
        style={{
          border: "none",
          outline: "none",
          fontSize: 13,
          color: C.text,
          flex: 1,
          minWidth: 120,
          background: "transparent",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
};

const SeoPreview = ({ title, desc }) => (
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 14,
      background: "white",
    }}
  >
    <Text
      style={{
        fontSize: 12,
        color: "#15803d",
        fontWeight: 500,
        display: "block",
        marginBottom: 3,
      }}
    >
      nexusacademy.com/blog/...
    </Text>
    <Text
      style={{
        fontSize: 14,
        color: "#1d4ed8",
        fontWeight: 700,
        display: "block",
        marginBottom: 4,
        lineHeight: 1.4,
      }}
    >
      {title || "Your blog title will appear here"}
    </Text>
    <Text style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>
      {desc || "Your blog summary will appear in search results."}
    </Text>
  </div>
);

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const thumbnailRef = useRef("");

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [thumbnail, setThumbnail] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    thumbnailRef.current = thumbnail;
  }, [thumbnail]);
  const readMins = Math.max(1, Math.ceil((wordCount || 0) / 200));

  useEffect(() => {
    CourseService.getCategories()
      .then(setCategories)
      .catch(() => { });
  }, []);

  // Save draft — keeps it as "draft" so instructor can keep editing
  const handleSaveDraft = async () => {
    setError("");
    try {
      const vals = await form.validateFields(["title", "summary", "category"]);
      setSaving(true);
      await BlogService.createBlog({
        title: vals.title.trim(),
        summary: vals.summary.trim(),
        category: vals.category,
        content: form.getFieldValue("content") || " ",
        status: "draft",
        thumbnail: thumbnailRef.current,
        images: [],
      });
      message.success("Draft saved successfully!");
      navigate(-1);
    } catch (err) {
      if (err?.errorFields) return;
      // Do not duplicate set Error if it is already handled globally
      // setError(err?.response?.data?.message ?? "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  // Submit for review — creates as draft then submits
  const handleSubmit = async () => {
    setError("");
    try {
      const vals = await form.validateFields();
      setSubmitting(true);
      const res = await BlogService.createBlog({
        title: vals.title.trim(),
        summary: vals.summary.trim(),
        category: vals.category,
        content: vals.content?.trim(),
        status: "draft",
        thumbnail: thumbnailRef.current,
        images: [],
      });
      if (res?.data?._id) await BlogService.submitForReview(res.data._id);
      message.success("Blog submitted for review!");
      navigate(-1);
    } catch (err) {
      if (err?.errorFields) return;
      // Do not duplicate set Error if it is already handled globally
      // setError(err?.response?.data?.message ?? "Failed to submit blog.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "0 0 40px",
          background: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #f1f0fe",
            padding: "20px 24px",
            marginBottom: 24,
            borderRadius: "0 0 20px 20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              maxWidth: 1300,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ color: C.textSub, fontWeight: 600 }}
              />
              <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: C.textSub,
                }}
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/instructor/dashboard")}
                >
                  Dashboard
                </span>
                <span>›</span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/instructor/blog")}
                >
                  Blog
                </span>
                <span>›</span>
                <span style={{ color: C.text, fontWeight: 600 }}>New Post</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {wordCount > 0 && (
                <Tag
                  style={{
                    borderRadius: 20,
                    fontWeight: 700,
                    fontSize: 11,
                    border: "none",
                    background: C.primaryBg,
                    color: C.primary,
                  }}
                >
                  {readMins} min read · {wordCount} words
                </Tag>
              )}
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
                loading={saving}
                disabled={submitting}
                style={{
                  height: 40,
                  borderRadius: 8,
                  fontWeight: 700,
                  borderColor: "#d9d9d9",
                  color: "#4b5563",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                className="hover:!border-indigo-400 hover:!text-indigo-600"
              >
                Save Draft
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                disabled={saving}
                style={{
                  height: 40,
                  borderRadius: 8,
                  fontWeight: 700,
                  background: C.gradient,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
                  padding: "0 24px",
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 24px 0" }}>
          {error && (
            <motion.div {...up(0)} style={{ marginBottom: 16 }}>
              <Alert
                type="error"
                message={error}
                closable
                onClose={() => setError("")}
                showIcon
                style={{ borderRadius: 10 }}
              />
            </motion.div>
          )}

          <Form
            form={form}
            layout="vertical"
            scrollToFirstError={{ behavior: "smooth", block: "center" }}
          >
            <Row gutter={[20, 20]}>
              {/* LEFT: Editor */}
              <Col xs={24} xl={17}>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {/* Title & Summary */}
                  <motion.div {...up(0.05)}>
                    <Card
                      bordered={false}
                      style={card}
                      bodyStyle={{ padding: 28 }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: C.primaryBg,
                          border: `1px solid ${C.border}`,
                          borderRadius: 999,
                          padding: "4px 14px",
                          marginBottom: 18,
                        }}
                      >
                        <EditOutlined
                          style={{ color: C.primary, fontSize: 12 }}
                        />
                        <Text
                          style={{
                            color: C.primary,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          New Blog Post
                        </Text>
                      </div>
                      <Form.Item
                        name="title"
                        rules={[
                          { required: true, message: "Title is required" },
                          { max: 255, message: "Max 255 characters" },
                        ]}
                        style={{ marginBottom: 16 }}
                      >
                        <Input
                          placeholder="Write your compelling title here..."
                          bordered={false}
                          style={{
                            fontSize: 26,
                            fontWeight: 800,
                            color: C.text,
                            padding: "4px 0",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="summary"
                        rules={[
                          { required: true, message: "Summary is required" },
                          { max: 1000, message: "Max 1000 characters" },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <TextArea
                          placeholder="Write a short summary (shown in search results and previews)..."
                          autoSize={{ minRows: 2, maxRows: 5 }}
                          bordered={false}
                          style={{
                            fontSize: 15,
                            color: C.textSub,
                            padding: "4px 0",
                            resize: "none",
                            fontFamily: "inherit",
                          }}
                        />
                      </Form.Item>
                    </Card>
                  </motion.div>

                  {/* Cover Image */}
                  <motion.div {...up(0.1)}>
                    <Card
                      bordered={false}
                      style={card}
                      bodyStyle={{ padding: 20 }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 13,
                          color: C.text,
                          display: "block",
                          marginBottom: 12,
                        }}
                      >
                        <PictureOutlined
                          style={{ marginRight: 6, color: C.primary }}
                        />
                        Cover Image
                      </Text>
                      {thumbnail ? (
                        <div
                          style={{
                            position: "relative",
                            borderRadius: 14,
                            overflow: "hidden",
                            height: 220,
                          }}
                        >
                          <img
                            src={thumbnail}
                            alt="Cover"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,0.42)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 10,
                              opacity: 0,
                              transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = 1)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = 0)
                            }
                          >
                            <Upload
                              accept="image/*"
                              showUploadList={false}
                              beforeUpload={async (file) => {
                                setUploadingThumb(true);
                                try {
                                  const res =
                                    await UserService.uploadImage(file);
                                  if (res?.url) setThumbnail(res.url);
                                  else message.error("Upload failed.");
                                } catch {
                                  message.error("Upload failed.");
                                } finally {
                                  setUploadingThumb(false);
                                }
                                return false;
                              }}
                            >
                              <Button
                                icon={<UploadOutlined />}
                                size="small"
                                style={{ borderRadius: 8, fontWeight: 600 }}
                              >
                                Change
                              </Button>
                            </Upload>
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              style={{ borderRadius: 8, fontWeight: 600 }}
                              onClick={() => setThumbnail("")}
                            >
                              Remove
                            </Button>
                          </div>
                          {uploadingThumb && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(255,255,255,0.7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Spin
                                indicator={
                                  <LoadingOutlined
                                    style={{ fontSize: 28, color: C.primary }}
                                  />
                                }
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <Upload.Dragger
                          accept="image/*"
                          showUploadList={false}
                          disabled={uploadingThumb}
                          beforeUpload={async (file) => {
                            if (!file.type.startsWith("image/")) {
                              message.error("Only image files allowed!");
                              return false;
                            }
                            if (file.size / 1024 / 1024 > 5) {
                              message.error("Max 5MB!");
                              return false;
                            }
                            setUploadingThumb(true);
                            try {
                              const res = await UserService.uploadImage(file);
                              if (res?.url) {
                                setThumbnail(res.url);
                                message.success("Cover uploaded!");
                              } else message.error("Upload failed.");
                            } catch {
                              message.error("Upload failed.");
                            } finally {
                              setUploadingThumb(false);
                            }
                            return false;
                          }}
                          style={{
                            borderRadius: 12,
                            border: `2px dashed ${C.border}`,
                            background: "#fafafe",
                          }}
                        >
                          <div style={{ padding: "24px 0" }}>
                            {uploadingThumb ? (
                              <Spin
                                indicator={
                                  <LoadingOutlined
                                    style={{ fontSize: 28, color: C.primary }}
                                  />
                                }
                              />
                            ) : (
                              <>
                                <PictureOutlined
                                  style={{
                                    fontSize: 36,
                                    color: C.primary,
                                    marginBottom: 10,
                                  }}
                                />
                                <div
                                  style={{
                                    color: C.text,
                                    fontWeight: 700,
                                    fontSize: 14,
                                  }}
                                >
                                  Click or drag image here
                                </div>
                                <div
                                  style={{
                                    color: C.textMuted,
                                    fontSize: 12,
                                    marginTop: 4,
                                  }}
                                >
                                  PNG, JPG, WEBP · Max 5MB
                                </div>
                              </>
                            )}
                          </div>
                        </Upload.Dragger>
                      )}
                    </Card>
                  </motion.div>

                  {/* TinyMCE — Ant Design Form pattern */}
                  <motion.div {...up(0.15)}>
                    <Card
                      bordered={false}
                      style={card}
                      bodyStyle={{
                        padding: 0,
                        overflow: "hidden",
                        borderRadius: 16,
                      }}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "4px 0",
                          }}
                        >
                          <Text strong style={{ fontSize: 13, color: C.text }}>
                            <EditOutlined
                              style={{ marginRight: 6, color: C.primary }}
                            />
                            Blog Content
                          </Text>
                          {wordCount > 0 && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: C.textMuted,
                                fontWeight: 600,
                              }}
                            >
                              {wordCount} words · {readMins} min read
                            </Text>
                          )}
                        </div>
                      }
                      headStyle={{
                        padding: "12px 20px",
                        borderBottom: "1px solid #f1f0fe",
                      }}
                    >
                      <Form.Item
                        name="content"
                        trigger="onEditorChange"
                        validateTrigger={["onEditorChange"]}
                        rules={[
                          {
                            required: true,
                            message: "Please write the blog content",
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <BlogTinyEditor
                          height="65vh"
                          placeholder="Start writing your blog post..."
                          onWordCount={(wc) => setWordCount(wc?.words ?? 0)}
                        />
                      </Form.Item>
                    </Card>
                  </motion.div>
                </Space>
              </Col>

              {/* RIGHT: Sidebar */}
              <Col xs={24} xl={7}>
                <Space
                  direction="vertical"
                  size={16}
                  style={{ width: "100%" }}
                >
                  {/* Publish Settings */}
                  <motion.div {...up(0.08)}>
                    <Card
                      bordered={false}
                      style={card}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Title level={5} style={{ margin: 0, color: C.text }}>
                            Publish Settings
                          </Title>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: C.amber,
                            }}
                          />
                        </div>
                      }
                      headStyle={{
                        padding: "14px 18px",
                        borderBottom: "1px solid #f1f0fe",
                      }}
                      bodyStyle={{ padding: 18 }}
                    >
                      <Space
                        direction="vertical"
                        size={14}
                        style={{ width: "100%" }}
                      >
                        <Form.Item
                          name="category"
                          label={
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.textSub,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Category *
                            </Text>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please select a category",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Select category..."
                            style={{ borderRadius: 8 }}
                            options={categories.map((c) => ({
                              value: c._id,
                              label: c.name,
                            }))}
                            loading={categories.length === 0}
                          />
                        </Form.Item>

                        <Space
                          direction="vertical"
                          size={8}
                          style={{ width: "100%" }}
                        >

                        </Space>
                      </Space>
                    </Card>
                  </motion.div>

                  {/* Tags */}
                  <motion.div {...up(0.12)}>
                    <Card
                      bordered={false}
                      style={card}
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Title level={5} style={{ margin: 0, color: C.text }}>
                            <TagOutlined
                              style={{ marginRight: 6, color: C.primary }}
                            />
                            Tags
                          </Title>
                          <Text
                            style={{
                              fontSize: 12,
                              color: C.textMuted,
                              fontWeight: 600,
                            }}
                          >
                            {tags.length} / 10
                          </Text>
                        </div>
                      }
                      headStyle={{
                        padding: "14px 18px",
                        borderBottom: "1px solid #f1f0fe",
                      }}
                      bodyStyle={{ padding: 18 }}
                    >
                      <TagInput tags={tags} onChange={setTags} />
                      <Text
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          marginTop: 8,
                          display: "block",
                        }}
                      >
                        Press Enter or comma to add a tag
                      </Text>
                    </Card>
                  </motion.div>

                  {/* SEO Preview */}
                  <motion.div {...up(0.16)}>
                    <Card
                      bordered={false}
                      style={card}
                      title={
                        <Title level={5} style={{ margin: 0, color: C.text }}>
                          SEO Preview
                        </Title>
                      }
                      headStyle={{
                        padding: "14px 18px",
                        borderBottom: "1px solid #f1f0fe",
                      }}
                      bodyStyle={{ padding: 18 }}
                    >
                      <Form.Item shouldUpdate noStyle>
                        {() => (
                          <SeoPreview
                            title={form.getFieldValue("title")}
                            desc={form.getFieldValue("summary")}
                          />
                        )}
                      </Form.Item>
                    </Card>
                  </motion.div>

                  {/* Writing Tips */}
                  <motion.div {...up(0.2)}>
                    <Card
                      bordered={false}
                      style={{
                        ...card,
                        background: C.gradient,
                        border: "none",
                      }}
                      bodyStyle={{ padding: 18 }}
                    >
                      <Title
                        level={5}
                        style={{ color: "white", margin: "0 0 12px" }}
                      >
                        ✍️ Writing Tips
                      </Title>
                      <Space
                        direction="vertical"
                        size={8}
                        style={{ width: "100%" }}
                      >
                        {[
                          ["Use H2/H3 headings to structure content", C.mint],
                          [
                            "Add code snippets with the codesample tool",
                            "#fbbf24",
                          ],
                          [
                            "Aim for 800–2000 words for best engagement",
                            C.mint,
                          ],
                          [
                            "Include a cover image for 3× more views",
                            "#fbbf24",
                          ],
                          ["Write a clear summary for SEO visibility", C.mint],
                        ].map(([tip, clr]) => (
                          <div
                            key={tip}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <CheckOutlined
                              style={{
                                color: clr,
                                fontSize: 12,
                                marginTop: 2,
                                flexShrink: 0,
                              }}
                            />
                            <Text
                              style={{
                                color: "rgba(255,255,255,0.88)",
                                fontSize: 12,
                                lineHeight: 1.5,
                              }}
                            >
                              {tip}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    </Card>
                  </motion.div>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBlogPage;
