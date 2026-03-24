import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Tag } from "antd";

/**
 * QuestionEditor
 * Quản lý 1 câu hỏi trong quiz: nội dung câu hỏi, danh sách đáp án, đáp án đúng.
 */
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
        status={!question.text?.trim() ? "error" : ""}
      />
      {!question.text?.trim() && (
        <div className="mb-2 -mt-3 text-xs text-red-500">
          Question content is required.
        </div>
      )}
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
              status={!opt?.trim() ? "error" : ""}
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

export default QuestionEditor;
