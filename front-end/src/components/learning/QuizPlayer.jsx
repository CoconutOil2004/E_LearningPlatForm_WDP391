import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag, Typography, message } from "antd";
import { useState } from "react";
import useCourseStore from "../../store/slices/courseStore";

const { Text, Title } = Typography;

/**
 * QuizPlayer
 * Props:
 *   quiz      – quiz object { title, questions: [{ text, options, correctAnswer }] }
 *   courseId  – string
 *   onComplete – () => void  → đánh dấu bài quiz này hoàn thành
 *   onNext     – () => void  → chuyển sang bài tiếp theo
 */
const QuizPlayer = ({ quiz, courseId, onComplete, onNext }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { saveQuizScore } = useCourseStore();

  const questions = quiz?.questions ?? [];

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, qi) => {
      if (answers[qi] === parseInt(q.correctAnswer, 10)) correct++;
    });

    const sc =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(sc);
    setSubmitted(true);
    saveQuizScore(courseId, sc);

    if (sc >= 70) {
      message.success(`🎉 Chúc mừng! Điểm của bạn: ${sc}/100`);
      onComplete();
    } else {
      message.warning(`Điểm: ${sc}/100. Hãy thử lại để đạt ít nhất 70!`);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  /* ── No questions placeholder ── */
  if (questions.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#fff",
          gap: 12,
        }}
      >
        <QuestionCircleOutlined style={{ fontSize: 48, opacity: 0.5 }} />
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>
          Quiz này chưa có câu hỏi
        </Text>
        <Button
          type="primary"
          onClick={() => {
            onComplete();
            onNext();
          }}
        >
          Tiếp tục
        </Button>
      </div>
    );
  }

  /* ── Main quiz UI ── */
  return (
    <div
      style={{ flex: 1, overflowY: "auto", padding: 32, background: "#111827" }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Quiz header */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            {quiz.title}
          </Title>
          {submitted && (
            <Tag
              color={score >= 70 ? "success" : "error"}
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              Score: {score}/100
            </Tag>
          )}
        </div>

        {/* Questions */}
        {questions.map((q, qi) => {
          const userAns = answers[qi];
          const correctIdx = parseInt(q.correctAnswer, 10);
          const isCorrect = submitted && userAns === correctIdx;
          const isWrong =
            submitted && userAns !== undefined && userAns !== correctIdx;

          return (
            <Card
              key={qi}
              style={{
                marginBottom: 16,
                borderRadius: 12,
                border: submitted
                  ? isCorrect
                    ? "1.5px solid #10b981"
                    : isWrong
                      ? "1.5px solid #ef4444"
                      : "1.5px solid #374151"
                  : "1.5px solid #374151",
                background: "#1f2937",
              }}
            >
              <Text
                strong
                style={{
                  color: "#fff",
                  display: "block",
                  marginBottom: 16,
                  fontSize: 15,
                }}
              >
                {qi + 1}. {q.text}
              </Text>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {(q.options ?? []).map((opt, oi) => {
                  const isSelected = userAns === oi;
                  const isCorrectOpt = submitted && oi === correctIdx;

                  return (
                    <div
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        cursor: submitted ? "default" : "pointer",
                        background: isCorrectOpt
                          ? "rgba(16,185,129,0.2)"
                          : isSelected && submitted
                            ? "rgba(239,68,68,0.2)"
                            : isSelected
                              ? "rgba(99,102,241,0.2)"
                              : "rgba(255,255,255,0.05)",
                        border: isCorrectOpt
                          ? "1px solid #10b981"
                          : isSelected
                            ? "1px solid #6366f1"
                            : "1px solid transparent",
                        color: "#e5e7eb",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {/* Actions */}
        {!submitted ? (
          <Button
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            style={{
              borderRadius: 12,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              border: "none",
              marginTop: 8,
            }}
          >
            Nộp bài
          </Button>
        ) : (
          <Space
            style={{ width: "100%", marginTop: 8 }}
            direction="vertical"
            size={12}
          >
            {score < 70 && (
              <Button
                size="large"
                block
                onClick={handleRetry}
                style={{
                  borderRadius: 12,
                  background: "transparent",
                  color: "#fff",
                  borderColor: "#4B5563",
                }}
              >
                Làm lại
              </Button>
            )}
            <Button
              type="primary"
              size="large"
              block
              onClick={onNext}
              style={{
                borderRadius: 12,
                background: "#10b981",
                border: "none",
              }}
            >
              Bài tiếp theo
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
