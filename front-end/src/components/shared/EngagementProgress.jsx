/**
 * EngagementProgress Component - Circular progress indicator
 * Uses Ant Design Progress component
 */

import React from 'react';
import { Card, Progress, Space, Typography } from 'antd';
import { motion } from 'framer-motion';
import { COLOR } from '../../styles/adminTheme';

const { Title, Text } = Typography;

const EngagementProgress = ({ 
  title = 'Course Engagement',
  percent = 0,
  subtitle = 'Overall engagement rate',
  animDelay = 0,
}) => {
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
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Title level={5} style={{ margin: 0, color: COLOR.ocean }}>
            {title}
          </Title>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Progress
              type="circle"
              percent={percent}
              strokeColor={{
                '0%': COLOR.ocean,
                '100%': COLOR.teal,
              }}
              strokeWidth={8}
              width={144}
              format={(percent) => (
                <Space direction="vertical" size={4} style={{ textAlign: 'center' }}>
                  <Text 
                    style={{ 
                      fontSize: 36, 
                      fontWeight: 900, 
                      color: COLOR.ocean,
                      fontFamily: 'monospace',
                      lineHeight: 1,
                    }}
                  >
                    {percent}%
                  </Text>
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: 11, 
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {subtitle}
                  </Text>
                </Space>
              )}
            />
          </div>
        </Space>
      </Card>
    </motion.div>
  );
};

export default EngagementProgress;
