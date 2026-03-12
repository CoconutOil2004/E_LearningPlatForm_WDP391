/**
 * InstructorsTable Component - Top performing instructors table
 * Uses Ant Design Table with custom styling
 */

import React from 'react';
import { Card, Table, Tag, Avatar, Space, Typography, Rate, Button } from 'antd';
import { UserOutlined, RiseOutlined, MenuOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { COLOR, STATUS_CONFIG } from '../../styles/adminTheme';

const { Title, Text } = Typography;

const InstructorsTable = ({ 
  instructors = [],
  title = 'Top Performing Instructors',
  subtitle = 'Academic efficiency rankings',
  onViewAll,
  loading = false,
  animDelay = 0,
}) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const columns = [
    {
      title: 'INSTRUCTOR',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space size={12}>
          <Avatar
            size={40}
            style={{
              background: `linear-gradient(135deg, ${COLOR.ocean}, ${COLOR.teal})`,
              fontWeight: 900,
              border: `2px solid ${COLOR.teal}20`,
            }}
          >
            {getInitials(name)}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: COLOR.ocean }}>
              {name}
            </Text>
            <Text type="secondary" style={{ fontSize: 10, fontFamily: 'monospace' }}>
              ID: {record.id}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'SPECIALIZATION',
      dataIndex: 'spec',
      key: 'spec',
      render: (spec) => (
        <Text style={{ fontSize: 13 }}>{spec}</Text>
      ),
    },
    {
      title: 'COURSE RATING',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space size={4}>
          <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
          <Text strong style={{ color: COLOR.ocean, fontFamily: 'monospace' }}>
            {rating.toFixed(1)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'ACTIVE STUDENTS',
      dataIndex: 'students',
      key: 'students',
      render: (students) => (
        <Text strong style={{ fontSize: 18, color: COLOR.ocean, fontFamily: 'monospace' }}>
          {students.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'isActive',
      key: 'status',
      align: 'right',
      render: (isActive) => (
        <Tag
          icon={isActive ? <RiseOutlined /> : null}
          color={isActive ? 'success' : 'default'}
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 12px',
            borderRadius: 12,
          }}
        >
          {isActive ? 'ACTIVE' : 'ON BREAK'}
        </Tag>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '24px 32px',
            borderBottom: `1px solid ${COLOR.gray100}`,
          }}
        >
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0, color: COLOR.ocean }}>
              {title}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle}
            </Text>
          </Space>

          {onViewAll && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={onViewAll}
              style={{ color: COLOR.gray400 }}
            />
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={instructors}
          loading={loading}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: onViewAll,
            style: { cursor: 'pointer' },
          })}
          style={{
            cursor: 'pointer',
          }}
        />

        {/* Footer */}
        {onViewAll && instructors.length > 0 && (
          <div 
            style={{ 
              padding: '16px 32px',
              background: COLOR.gray50,
              borderTop: `1px solid ${COLOR.gray100}`,
              textAlign: 'center',
            }}
          >
            <Button
              type="link"
              onClick={onViewAll}
              style={{
                color: COLOR.teal,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              View Full Personnel Registry →
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default InstructorsTable;
