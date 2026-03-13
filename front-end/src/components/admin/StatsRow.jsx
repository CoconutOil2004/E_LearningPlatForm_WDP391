import { Card, Col, Row, Statistic } from "antd";
import { COLOR } from "../../styles/adminTheme";

const StatsRow = ({ items = [] }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    {items.map((item, i) => (
      <Col key={i} xs={24} sm={12} md={6}>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Statistic
            title={item.title}
            value={item.value}
            prefix={item.prefix}
            valueStyle={{
              color: item.valueColor ?? COLOR.ocean,
              fontWeight: 700,
            }}
          />
        </Card>
      </Col>
    ))}
  </Row>
);

export default StatsRow;
