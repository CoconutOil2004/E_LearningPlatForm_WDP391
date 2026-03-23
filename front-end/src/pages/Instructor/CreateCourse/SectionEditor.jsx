import {
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Input, Space, Tag } from "antd";
import QuestionEditor from "./QuestionEditor";
import VideoUploadCell from "./VideoUploadCell";

/**
 * SectionEditor
 * Quản lý 1 section trong curriculum:
 * - Tiêu đề section
 * - Danh sách items (Lesson / Quiz)
 * - Thêm/xóa lesson, quiz
 * - Hiển thị lỗi inline khi showErrors=true
 */
const SectionEditor = ({
  section,
  idx,
  onChange,
  onRemove,
  isLocked,
  isUploading = false,
  showErrors = false,
}) => {
  const blocked = isLocked || isUploading;

  // ── Item mutations ──────────────────────────────────────────────────────────
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

  // ── Question mutations (quiz items) ─────────────────────────────────────────
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

  const sectionTitleError = showErrors && !section.title?.trim();
  const noItemsError =
    showErrors && (!section.items || section.items.length === 0);

  return (
    <div
      className={`relative p-5 mb-6 transition-colors bg-white border shadow-sm rounded-2xl group/section hover:border-purple-200 ${
        sectionTitleError || noItemsError ? "border-red-300" : "border-gray-100"
      }`}
    >
      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 font-bold text-purple-700 bg-purple-100 rounded-lg shrink-0">
          {idx + 1}
        </div>
        <div className="flex-1">
          <Input
            value={section.title}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            placeholder="Enter section title..."
            className="px-0 text-lg font-bold border-none shadow-none focus:ring-0"
            disabled={blocked}
            status={sectionTitleError ? "error" : ""}
          />
        </div>
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

      {/* ── Items list ─────────────────────────────────────────────────────── */}
      <div className="pl-4 ml-4 space-y-3 border-l-2 border-gray-100">
        {section.items.map((item, li) => (
          <div
            key={item._uid ?? item.itemId ?? li}
            className="relative group/item"
          >
            {item.itemType === "lesson" ? (
              /* ── Lesson row ── */
              <div
                className={`relative flex items-center gap-3 p-3 transition-all bg-white border shadow-sm group/item rounded-xl hover:border-purple-200 hover:shadow-md ${
                  showErrors && (!item.title?.trim() || !item.videoUrl)
                    ? "border-red-300"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 text-purple-500 rounded-lg bg-purple-50 shrink-0">
                  <VideoCameraOutlined />
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(li, { title: e.target.value })}
                    placeholder="Lesson title..."
                    variant="borderless"
                    className="flex-1 px-0 font-medium bg-transparent focus:ring-0"
                    disabled={blocked}
                    status={showErrors && !item.title?.trim() ? "error" : ""}
                  />
                </div>

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
              /* ── Quiz row ── */
              <Collapse
                className={`overflow-hidden border-gray-100 bg-gray-50 rounded-xl ${
                  showErrors && (!item.title?.trim() || !item.questions?.length)
                    ? "border border-red-300"
                    : ""
                }`}
                expandIconPosition="end"
                items={[
                  {
                    key: "1",
                    label: (
                      <div className="flex items-center gap-3">
                        <div className="p-2 text-pink-500 bg-white rounded-lg shadow-sm">
                          <QuestionCircleOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
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
                            status={
                              showErrors && !item.title?.trim() ? "error" : ""
                            }
                          />
                          {showErrors && !item.title?.trim() && (
                            <div className="-mt-1 text-xs text-red-500">
                              Quiz title is required.
                            </div>
                          )}
                        </div>
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
                        {showErrors &&
                          (!item.questions || item.questions.length === 0) && (
                            <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-500">
                              Quiz must have at least 1 question.
                            </div>
                          )}
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

        {/* ── Add lesson / quiz buttons ── */}
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

export default SectionEditor;
