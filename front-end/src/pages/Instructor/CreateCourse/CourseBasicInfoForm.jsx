import { BookOutlined, PictureOutlined } from "@ant-design/icons";
import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import { INSTRUCTOR_COLORS } from "../../../../src/styles/instructorTheme";
import CourseService from "../../../services/api/CourseService";
import {
  inputNumberFormatter,
  inputNumberParser,
} from "../../../utils/helpers";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const CourseBasicInfoForm = ({
  form,
  categories,
  thumbnailUrl,
  setThumbnailUrl,
  isLocked,
}) => {
  return (
    <div className="p-8 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900">
        <BookOutlined style={{ color: INSTRUCTOR_COLORS.primary }} /> Basic
        Information
      </h2>

      <Row gutter={[24, 16]}>
        {/* Course Title */}
        <Col xs={24}>
          <Form.Item
            name="title"
            label={
              <span className="font-semibold text-gray-700">
                Course Title <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please enter a course title" },
              { min: 10, message: "Title must be at least 10 characters" },
              { max: 60, message: "Maximum 60 characters" },
              { whitespace: true, message: "Title cannot be empty spaces" },
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

        {/* Description */}
        <Col xs={24}>
          <Form.Item
            name="description"
            label={
              <span className="font-semibold text-gray-700">
                Course Description <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please describe your course" },
              {
                min: 20,
                message: "Description must be at least 20 characters",
              },
            ]}
          >
            <TextArea
              rows={4}
              className="rounded-lg"
              placeholder="What will students learn? (min 20 characters)"
              showCount
              maxLength={2000}
            />
          </Form.Item>
        </Col>

        {/* Category */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="categoryId"
            label={
              <span className="font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select a category" }]}
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

        {/* Level */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="level"
            label={
              <span className="font-semibold text-gray-700">
                Level <span className="text-red-500">*</span>
              </span>
            }
            initialValue="Beginner"
            rules={[{ required: true, message: "Please select a level" }]}
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

        {/* Price */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="price"
            label={
              <span className="font-semibold text-gray-700">Price (VND)</span>
            }
            validateTrigger={["onChange", "onBlur"]}
            rules={[
              {
                validator: (_, val) => {
                  if (val < 0)
                    return Promise.reject("Price cannot be negative");
                  if (val > 100000000)
                    return Promise.reject("Max is 100,000,000đ");
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100000000}
              step={1000}
              size="large"
              className="w-full rounded-lg"
              addonBefore="đ"
              placeholder="0"
              formatter={inputNumberFormatter}
              parser={inputNumberParser}
              onChange={() => form.validateFields(["price"])}
            />
          </Form.Item>
          <Text type="secondary" className="text-xs italic">
            Enter 0 for free.
          </Text>
        </Col>

        {/* Thumbnail */}
        <Col xs={24} sm={12}>
          {/* Hidden form field để Ant Design validate */}
          <Form.Item
            name="thumbnail"
            className="hidden"
            rules={[
              {
                required: true,
                message: "Please upload a course thumbnail",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <div className="mb-2 font-semibold text-gray-700">
            Course Thumbnail <span className="text-red-500">*</span>
          </div>

          <Upload
            accept="image/*"
            listType="picture-card"
            maxCount={1}
            disabled={isLocked}
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
              } catch (error) {
                onError(error);
              }
            }}
            onRemove={() => {
              form.setFieldsValue({ thumbnail: "" });
              setThumbnailUrl("");
            }}
            onPreview={(file) => {
              window.open(file.url || file.thumbUrl, "_blank");
            }}
          >
            {!thumbnailUrl && (
              <div className="flex flex-col items-center justify-center p-2 text-purple-500 transition-colors hover:text-purple-600">
                <PictureOutlined className="mb-2 text-3xl text-purple-400" />
                <div className="text-sm font-semibold">Upload Image</div>
                <div className="mt-1 text-xs font-normal text-gray-400">
                  JPG / PNG
                </div>
              </div>
            )}
          </Upload>

          {/* Hiển thị lỗi thumbnail nếu chưa upload */}
          <Form.Item
            shouldUpdate={(prev, curr) => prev.thumbnail !== curr.thumbnail}
            noStyle
          >
            {({ getFieldError }) => {
              const errs = getFieldError("thumbnail");
              return errs.length ? (
                <div className="mt-1 text-xs text-red-500">{errs[0]}</div>
              ) : null;
            }}
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default CourseBasicInfoForm;
