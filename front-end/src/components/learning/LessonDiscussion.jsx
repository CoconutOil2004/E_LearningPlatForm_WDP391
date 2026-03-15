import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  message,
  Space,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import CommentService from "../../services/api/CommentService";
import useAuthStore from "../../store/slices/authStore";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const LessonDiscussion = ({ courseId, lessonId, dark = false }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");

  const fetchComments = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const res = await CommentService.getLessonComments(lessonId);
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await CommentService.createComment({
        courseId,
        lessonId,
        content,
      });
      message.success("Comment posted!");
      setContent("");
      fetchComments();
    } catch (err) {
      message.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const textColor = dark ? "#D1D5DB" : "#475569";
  const titleColor = dark ? "#fff" : "#1e293b";

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ color: titleColor, display: "block", marginBottom: 16 }}>
          Start a Discussion
        </Text>
        <Space direction="vertical" style={{ width: "100%" }}>
          <TextArea
            rows={3}
            placeholder="Ask a question or share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              background: dark ? "rgba(255,255,255,0.05)" : "#fff",
              border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
              color: textColor,
              borderRadius: 12,
            }}
          />
          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleSubmit}
              style={{ borderRadius: 8 }}
            >
              Post Comment
            </Button>
          </div>
        </Space>
      </div>

      <List
        loading={loading}
        dataSource={comments}
        locale={{ emptyText: <Text type="secondary">No discussions yet. Be the first to ask!</Text> }}
        renderItem={(item) => (
          <div
            style={{
              padding: "16px 0",
              borderBottom: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <Avatar src={item.userId?.avatarURL} size="small">
                {item.userId?.fullname?.charAt(0)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ color: titleColor, fontSize: 13 }}>
                    {item.userId?.fullname}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#64748b" }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <Paragraph style={{ color: textColor, marginTop: 4, fontSize: 13, margin: 0 }}>
                  {item.content}
                </Paragraph>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default LessonDiscussion;
