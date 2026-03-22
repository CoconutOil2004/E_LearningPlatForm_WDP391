import { Button, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/constants";

const { Text } = Typography;

const CourseBreadcrumb = ({ categoryName, courseTitle }) => {
  const navigate = useNavigate();
  return (
    <Space style={{ marginBottom: 20, fontSize: 13 }}>
      <Button
        type="link"
        style={{ padding: 0 }}
        onClick={() => navigate(ROUTES.COURSES)}
      >
        Courses
      </Button>
      <Text type="secondary">/</Text>
      {categoryName && (
        <>
          <Text type="secondary">{categoryName}</Text>
          <Text type="secondary">/</Text>
        </>
      )}
      <Text style={{ maxWidth: 300 }} ellipsis>
        {courseTitle}
      </Text>
    </Space>
  );
};

export default CourseBreadcrumb;
