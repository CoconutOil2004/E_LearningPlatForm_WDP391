/**
 * CreateInstructorModal Component
 * Modal for creating new instructor with Ant Design
 */

import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Space, Typography } from "antd";
import { COLOR } from "../../../src/styles/adminTheme";

const { Text } = Typography;

const CreateInstructorModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 18, color: COLOR.ocean }}>
            Create New Instructor
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            The system will generate a random password and send it via email
          </Text>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Create Instructor
        </Button>,
      ]}
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label={
            <Text
              strong
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Email <span style={{ color: COLOR.error }}>*</span>
            </Text>
          }
          name="email"
          rules={[
            { required: true, message: "Please input email!" },
            { type: "email", message: "Please input valid email!" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: COLOR.gray400 }} />}
            placeholder="instructor@example.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={
            <Text
              strong
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Full Name <span style={{ color: COLOR.error }}>*</span>
            </Text>
          }
          name="fullname"
          rules={[
            { required: true, message: "Please input full name!" },
            { min: 3, message: "Name must be at least 3 characters!" },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: COLOR.gray400 }} />}
            placeholder="John Doe"
            size="large"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateInstructorModal;
