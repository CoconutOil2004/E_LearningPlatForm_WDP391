import {
  ArrowLeftOutlined,
  BoldOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CloseOutlined,
  CodeOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  ItalicOutlined,
  LinkOutlined,
  LoadingOutlined,
  OrderedListOutlined,
  PictureOutlined,
  SaveOutlined,
  SendOutlined,
  TagOutlined,
  UnorderedListOutlined,
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
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogService from "../../../services/api/BlogService";
import CourseService from "../../../services/api/CourseService";
import { pageVariants } from "../../../utils/helpers";

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Design tokens — đồng nhất với InstructorDashboard ────────────────────────
const C = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryBg: "rgba(99,102,241,0.08)",
  primaryBgHover: "rgba(99,102,241,0.14)",
  mint: "#10b981",
  mintBg: "rgba(16,185,129,0.08)",
  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.08)",
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

// ─── Toolbar button ───────────────────────────────────────────────────────────
const TBtn = ({ icon, title, onClick, active }) => (
  <Tooltip title={title}>
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 8, border: "none",
        background: active ? C.primaryBg : "transparent",
        color: active ? C.primary : C.textSub,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryBg; e.currentTarget.style.color = C.primary; }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSub; } }}
    >
      {icon}
    </button>
  </Tooltip>
);

const TSep = () => <div style={{ width: 1, height: 22, background: "#e5e7eb", margin: "0 4px" }} />;

// ─── Tag input ────────────────────────────────────────────────────────────────
const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState("");

  const add = (raw) => {
    const val = raw.trim().replace(/,+$/, "");
    if (val && !tags.includes(val) && tags.length < 10) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  const remove = (t) => onChange(tags.filter((x) => x !== t));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 11px", border: "1px solid #d9d9d9", borderRadius: 8, minHeight: 40, cursor: "text", background: "white" }}
      onClick={() => document.getElementById("tagInput")?.focus()}>
      {tags.map((t) => (
        <Tag key={t} closable onClose={() => remove(t)}
          style={{ borderRadius: 20, fontWeight: 600, fontSize: 12, border: "none", background: C.primaryBg, color: C.primary, display: "flex", alignItems: "center", gap: 4 }}>
          {t}
        </Tag>
      ))}
      <input
        id="tagInput"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); } }}
        onBlur={() => input.trim() && add(input)}
        placeholder={tags.length === 0 ? "Add tags, press Enter..." : ""}
        style={{ border: "none", outline: "none", fontSize: 13, color: C.text, flex: 1, minWidth: 120, background: "transparent", fontFamily: "inherit" }}
      />
    </div>
  );
};

// ─── SEO Preview ──────────────────────────────────────────────────────────────
const SeoPreview = ({ title, desc }) => (
  <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "white" }}>
    <Text style={{ fontSize: 12, color: "#15803d", fontWeight: 500, display: "block", marginBottom: 3 }}>
      nexusacademy.com/blog/...
    </Text>
    <Text style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 700, display: "block", marginBottom: 4, lineHeight: 1.4 }}>
      {title || "Your blog title will appear here"}
    </Text>
    <Text style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>
      {desc || "Your blog summary will appear as description in search results."}
    </Text>
  </div>
);

// ─── Word count hook ──────────────────────────────────────────────────────────
const useWordCount = (content) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.ceil(words / 200));
  return { words, readMins };
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const editorRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [error, setError] = useState("");
  const autoSaveTimer = useRef(null);

  const { words, readMins } = useWordCount(content);

  // Fetch categories from BE
  useEffect(() => {
    CourseService.getCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  // Autosave draft (debounce 3s)
  const triggerAutoSave = useCallback(() => {
    clearTimeout(autoSaveTimer.current);
    setAutoSaved(false);
    autoSaveTimer.current = setTimeout(async () => {
      const vals = form.getFieldsValue();
      if (!vals.title?.trim()) return;
      try {
        await BlogService.createBlog({
          title: vals.title,
          summary: vals.summary || " ",
          category: vals.category,
          content: content || " ",
          status: "draft",
          thumbnail,
        });
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 3000);
      } catch (_) {}
    }, 3000);
  }, [form, content, thumbnail]);

  // Editor exec command
  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setContent(editorRef.current?.innerHTML ?? "");
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const insertCode = () => {
    exec("insertHTML",
      '<pre style="background:#f1f0fe;border:1px solid #c7d2fe;border-radius:8px;padding:14px;font-family:monospace;font-size:13px;margin:12px 0;"><code>// Your code here</code></pre><p><br></p>'
    );
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setError("");
    try {
      const vals = await form.validateFields(["title", "summary", "category"]);
      setSaving(true);
      await BlogService.createBlog({
        title: vals.title.trim(),
        summary: vals.summary.trim(),
        category: vals.category,
        content: content || " ",
        status: "draft",
        thumbnail,
        images: [],
      });
      message.success("Draft saved successfully!");
      navigate(-1);
    } catch (err) {
      if (err?.errorFields) return; // form validation error, shown inline
      setError(err?.response?.data?.message ?? "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  // Submit for review
  const handleSubmit = async () => {
    setError("");
    try {
      const vals = await form.validateFields();
      if (!content.trim() || content === "<br>" || content === "<p><br></p>") {
        setError("Please write the blog content before submitting.");
        return;
      }
      setSubmitting(true);
      const res = await BlogService.createBlog({
        title: vals.title.trim(),
        summary: vals.summary.trim(),
        category: vals.category,
        content: content.trim(),
        status: "draft",
        thumbnail,
        images: [],
      });
      // Then submit for review
      if (res?.data?._id) {
        await BlogService.submitForReview(res.data._id);
      }
      message.success("Blog submitted for review!");
      navigate(-1);
    } catch (err) {
      if (err?.errorFields) return;
      setError(err?.response?.data?.message ?? "Failed to submit blog.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 0 40px", background: "#f9fafb", minHeight: "100vh" }}>

        {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(249,250,251,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f1f0fe", padding: "12px 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            {/* Left: back + breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ color: C.textSub, fontWeight: 600 }} />
              <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textSub }}>
                <span style={{ cursor: "pointer" }} onClick={() => navigate("/instructor/dashboard")}>Dashboard</span>
                <span>›</span>
                <span style={{ color: C.text, fontWeight: 600 }}>New Blog Post</span>
              </div>
            </div>

            {/* Right: autosave indicator + actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {autoSaved && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.mint, fontWeight: 700 }}>
                  <CheckCircleFilled style={{ fontSize: 13 }} /> Saved
                </div>
              )}
              {words > 0 && (
                <Tag style={{ borderRadius: 20, fontWeight: 700, fontSize: 11, border: "none", background: C.primaryBg, color: C.primary }}>
                  {readMins} min read · {words} words
                </Tag>
              )}
              <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={saving} disabled={submitting}
                style={{ borderRadius: 10, fontWeight: 700, borderColor: C.border }}>
                Save Draft
              </Button>
              <Button icon={<EyeOutlined />} style={{ borderRadius: 10, fontWeight: 700, borderColor: C.border }}>
                Preview
              </Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting} disabled={saving}
                style={{ borderRadius: 10, fontWeight: 700, background: C.gradient, border: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                Submit for Review
              </Button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <div style={{ padding: "24px 24px 0" }}>
          {error && (
            <motion.div {...up(0)} style={{ marginBottom: 16 }}>
              <Alert type="error" message={error} closable onClose={() => setError("")} showIcon style={{ borderRadius: 10 }} />
            </motion.div>
          )}

          <Form form={form} layout="vertical" onValuesChange={triggerAutoSave}>
            <Row gutter={[18, 18]}>
              {/* EDITOR column */}
              <Col xs={24} lg={16}>
                <Space direction="vertical" size={14} style={{ width: "100%" }}>

                  {/* Title & Summary */}
                  <motion.div {...up(0.05)}>
                    <Card bordered={false} style={card} bodyStyle={{ padding: 24 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.primaryBg, border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 14px", marginBottom: 16 }}>
                        <EditOutlined style={{ color: C.primary, fontSize: 13 }} />
                        <Text style={{ color: C.primary, fontWeight: 700, fontSize: 12 }}>New Blog Post</Text>
                      </div>

                      <Form.Item name="title" rules={[{ required: true, message: "Title is required" }, { max: 255, message: "Max 255 characters" }]} style={{ marginBottom: 14 }}>
                        <Input
                          placeholder="Write your compelling title here..."
                          bordered={false}
                          style={{ fontSize: 28, fontWeight: 800, color: C.text, padding: "4px 0", letterSpacing: "-0.02em", lineHeight: 1.2 }}
                          onInput={triggerAutoSave}
                        />
                      </Form.Item>

                      <Form.Item name="summary" rules={[{ required: true, message: "Summary is required" }, { max: 1000, message: "Max 1000 characters" }]} style={{ marginBottom: 0 }}>
                        <TextArea
                          placeholder="Write a compelling summary (shown in search results and previews)..."
                          autoSize={{ minRows: 2, maxRows: 4 }}
                          bordered={false}
                          style={{ fontSize: 15, color: C.textSub, padding: "4px 0", resize: "none", fontFamily: "inherit" }}
                          onInput={triggerAutoSave}
                        />
                      </Form.Item>
                    </Card>
                  </motion.div>

                  {/* Thumbnail URL */}
                  <motion.div {...up(0.1)}>
                    <Card bordered={false} style={card} bodyStyle={{ padding: 20 }}>
                      <Text strong style={{ fontSize: 13, color: C.text, display: "block", marginBottom: 10 }}>
                        <PictureOutlined style={{ marginRight: 6, color: C.primary }} /> Cover Image URL
                      </Text>
                      <Input
                        value={thumbnail}
                        onChange={(e) => { setThumbnail(e.target.value); triggerAutoSave(); }}
                        placeholder="https://example.com/image.jpg"
                        prefix={<LinkOutlined style={{ color: C.textMuted }} />}
                        style={{ borderRadius: 8 }}
                      />
                      {thumbnail && (
                        <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", height: 200 }}>
                          <img src={thumbnail} alt="Cover preview" onError={(e) => e.target.style.display = "none"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                      {!thumbnail && (
                        <div style={{ marginTop: 10, height: 120, borderRadius: 12, border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: C.textMuted }}>
                          <PictureOutlined style={{ fontSize: 28 }} />
                          <Text style={{ color: C.textMuted, fontSize: 13 }}>Cover image preview will appear here</Text>
                        </div>
                      )}
                    </Card>
                  </motion.div>

                  {/* Rich Text Editor */}
                  <motion.div {...up(0.15)}>
                    <Card bordered={false} style={card} bodyStyle={{ padding: 0 }}>
                      {/* Toolbar */}
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, padding: "10px 14px", borderBottom: "1px solid #f1f0fe", background: "#fafafe" }}>
                        <TBtn icon={<BoldOutlined />} title="Bold" onClick={() => exec("bold")} />
                        <TBtn icon={<ItalicOutlined />} title="Italic" onClick={() => exec("italic")} />
                        <TBtn icon={<span style={{ fontSize: 12, fontWeight: 800, textDecoration: "underline" }}>U</span>} title="Underline" onClick={() => exec("underline")} />
                        <TBtn icon={<span style={{ fontSize: 11, fontWeight: 800, textDecoration: "line-through" }}>S</span>} title="Strikethrough" onClick={() => exec("strikeThrough")} />
                        <TSep />
                        <TBtn icon={<span style={{ fontSize: 12, fontWeight: 900 }}>H2</span>} title="Heading 2" onClick={() => exec("formatBlock", "H2")} />
                        <TBtn icon={<span style={{ fontSize: 11, fontWeight: 900 }}>H3</span>} title="Heading 3" onClick={() => exec("formatBlock", "H3")} />
                        <TBtn icon={<span style={{ fontSize: 11, fontWeight: 700 }}>H4</span>} title="Heading 4" onClick={() => exec("formatBlock", "H4")} />
                        <TSep />
                        <TBtn icon={<UnorderedListOutlined />} title="Bullet list" onClick={() => exec("insertUnorderedList")} />
                        <TBtn icon={<OrderedListOutlined />} title="Numbered list" onClick={() => exec("insertOrderedList")} />
                        <TSep />
                        <TBtn icon={<LinkOutlined />} title="Insert link" onClick={insertLink} />
                        <TBtn icon={<PictureOutlined />} title="Insert image" onClick={() => { const u = prompt("Image URL:"); if (u) exec("insertImage", u); }} />
                        <TBtn icon={<span style={{ fontSize: 13 }}>"</span>} title="Blockquote" onClick={() => exec("formatBlock", "blockquote")} />
                        <TBtn icon={<CodeOutlined />} title="Code block" onClick={insertCode} />
                        <TSep />
                        <div style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted, fontWeight: 700 }}>{words} words</div>
                      </div>

                      {/* Editable area */}
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder="Start writing your blog post... Share your knowledge, insights, and expertise with your students."
                        onInput={(e) => {
                          setContent(e.currentTarget.innerHTML);
                          triggerAutoSave();
                        }}
                        style={{
                          minHeight: 380, padding: "20px 24px", outline: "none",
                          fontSize: 15, lineHeight: 1.8, color: C.text, fontFamily: "inherit",
                        }}
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                      <style>{`
                        [contenteditable]:empty::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
                        [contenteditable] h2 { font-size: 22px; font-weight: 800; margin: 20px 0 10px; color: #111827; }
                        [contenteditable] h3 { font-size: 18px; font-weight: 700; margin: 16px 0 8px; color: #111827; }
                        [contenteditable] h4 { font-size: 15px; font-weight: 700; margin: 14px 0 6px; color: #111827; }
                        [contenteditable] blockquote { border-left: 3px solid #6366f1; padding-left: 16px; margin: 16px 0; color: #6b7280; font-style: italic; }
                        [contenteditable] a { color: #6366f1; text-decoration: underline; }
                        [contenteditable] img { max-width: 100%; border-radius: 10px; margin: 8px 0; }
                        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 8px 0; }
                        [contenteditable] li { margin: 4px 0; }
                      `}</style>
                    </Card>
                  </motion.div>
                </Space>
              </Col>

              {/* SIDEBAR */}
              <Col xs={24} lg={8}>
                <Space direction="vertical" size={14} style={{ width: "100%" }}>

                  {/* Publish Settings */}
                  <motion.div {...up(0.08)}>
                    <Card bordered={false} style={card}
                      title={
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Title level={5} style={{ margin: 0, color: C.text }}>Publish Settings</Title>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber }} />
                        </div>
                      }
                      headStyle={{ padding: "14px 18px", borderBottom: "1px solid #f1f0fe" }}
                      bodyStyle={{ padding: 18 }}
                    >
                      <Space direction="vertical" size={14} style={{ width: "100%" }}>
                        {/* Category — required by BE */}
                        <Form.Item name="category" label={<Text style={{ fontSize: 12, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category *</Text>}
                          rules={[{ required: true, message: "Please select a category" }]} style={{ marginBottom: 0 }}>
                          <Select
                            placeholder="Select category..."
                            style={{ borderRadius: 8 }}
                            options={categories.map((c) => ({ value: c._id, label: c.name }))}
                            loading={categories.length === 0}
                          />
                        </Form.Item>

                        {/* Status info */}
                        <div style={{ background: C.primaryBg, borderRadius: 10, padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <FileTextOutlined style={{ color: C.primary, fontSize: 13 }} />
                            <Text style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>Workflow</Text>
                          </div>
                          <Text style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>
                            <strong>Save Draft</strong> → edit anytime<br />
                            <strong>Submit for Review</strong> → admin approves before publishing
                          </Text>
                        </div>

                        {/* Actions */}
                        <Space direction="vertical" size={8} style={{ width: "100%" }}>
                          <Button block size="large" icon={submitting ? <LoadingOutlined /> : <SendOutlined />} onClick={handleSubmit} loading={submitting} disabled={saving}
                            style={{ borderRadius: 10, fontWeight: 700, background: C.gradient, border: "none", color: "white", height: 44, boxShadow: "0 4px 16px rgba(99,102,241,0.28)" }}>
                            Submit for Review
                          </Button>
                          <Button block size="large" icon={<SaveOutlined />} onClick={handleSaveDraft} loading={saving} disabled={submitting}
                            style={{ borderRadius: 10, fontWeight: 700, borderColor: C.border, height: 44 }}>
                            Save as Draft
                          </Button>
                        </Space>
                      </Space>
                    </Card>
                  </motion.div>

                  {/* Tags */}
                  <motion.div {...up(0.12)}>
                    <Card bordered={false} style={card}
                      title={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Title level={5} style={{ margin: 0, color: C.text }}>
                            <TagOutlined style={{ marginRight: 6, color: C.primary }} />Tags
                          </Title>
                          <Text style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{tags.length} / 10</Text>
                        </div>
                      }
                      headStyle={{ padding: "14px 18px", borderBottom: "1px solid #f1f0fe" }}
                      bodyStyle={{ padding: 18 }}
                    >
                      <TagInput tags={tags} onChange={setTags} />
                      <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 8, display: "block" }}>
                        Press Enter or comma to add a tag
                      </Text>
                    </Card>
                  </motion.div>

                  {/* SEO Preview */}
                  <motion.div {...up(0.16)}>
                    <Card bordered={false} style={card}
                      title={<Title level={5} style={{ margin: 0, color: C.text }}>SEO Preview</Title>}
                      headStyle={{ padding: "14px 18px", borderBottom: "1px solid #f1f0fe" }}
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
                    <Card bordered={false}
                      style={{ ...card, background: C.gradient, border: "none" }}
                      bodyStyle={{ padding: 18 }}
                    >
                      <Title level={5} style={{ color: "white", margin: "0 0 12px" }}>✍️ Writing Tips</Title>
                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                        {[
                          ["Use H2/H3 headings to structure content", C.mint],
                          ["Add code snippets with the code block tool", "#fbbf24"],
                          ["Aim for 800–2000 words for best engagement", C.mint],
                          ["Include a cover image for 3× more views", "#fbbf24"],
                          ["Write a clear summary for SEO visibility", C.mint],
                        ].map(([tip, clr]) => (
                          <div key={tip} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <CheckOutlined style={{ color: clr, fontSize: 12, marginTop: 2, flexShrink: 0 }} />
                            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 1.5 }}>{tip}</Text>
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