/**
 * AlertCard Component - System alert/notification card
 * Uses Ant Design Card and Alert styling
 */

import React from 'react';
import { Card, Space, Typography } from 'antd';
import { 
  CheckCircleOutlined, 
  InfoCircleOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { COLOR } from '../../styles/adminTheme';

const { Title, Text } = Typography;

const TYPE_CONFIG = {
  success: {
    icon: CheckCircleOutlined,
    color: COLOR.teal,
    bg: 'rgba(0,191,165,0.12)',
  },
  info: {
    icon: InfoCircleOutlined,
    color: COLOR.info,
    bg: 'rgba(41,182,246,0.12)',
  },
  warning: {
    icon: ExclamationCircleOutlined,
    color: COLOR.warning,
    bg: 'rgba(255,167,38,0.12)',
  },
  error: {
    icon: CloseCircleOutlined,
    color: COLOR.error,
    bg: 'rgba(239,83,80,0.12)',
  },
};

const AlertCard = ({ 
  type = 'success',
  title,
  message,
  timestamp,
  animDelay = 0,
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.success;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          borderLeft: `4px solid ${config.color}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Space size={12} align="start">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: config.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconComponent style={{ fontSize: 18, color: config.color }} />
          </div>

          <Space direction="vertical" size={4} style={{ flex: 1 }}>
            <Title level={5} style={{ margin: 0, color: COLOR.ocean, fontSize: 14 }}>
              {title}
            </Title>
            <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
              {message}
            </Text>
            {timestamp && (
              <Text 
                style={{ 
                  fontSize: 10, 
                  fontFamily: 'monospace', 
                  color: config.color,
                  marginTop: 4,
                }}
              >
                {timestamp}
              </Text>
            )}
          </Space>
        </Space>
      </Card>
    </motion.div>
  );
};

export default AlertCard;
