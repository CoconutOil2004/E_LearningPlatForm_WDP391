/**
 * StatCard Component - Reusable stat card with Ant Design
 * Used in Admin and Instructor dashboards
 */

import React from 'react';
import { Card, Space, Typography, Progress } from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  TrophyOutlined,
  RiseOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { COLOR } from '../../styles/adminTheme';

const { Text, Title } = Typography;

const ICON_MAP = {
  users: UserOutlined,
  dollar: DollarOutlined,
  award: TrophyOutlined,
  trending: RiseOutlined,
  check: CheckCircleOutlined,
};

const StatCard = ({ 
  icon = 'users',
  label,
  value,
  badge,
  barWidth = 0,
  barColor = COLOR.teal,
  accentBg = 'rgba(0,191,165,0.1)',
  accentColor = COLOR.teal,
  animDelay = 0,
  className = '',
}) => {
  const IconComponent = ICON_MAP[icon] || UserOutlined;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={className}
    >
      <Card 
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          position: 'relative',
        }}
        bodyStyle={{ padding: 24 }}
      >
        {/* Decorative background blob */}
        <div
          style={{
            position: 'absolute',
            right: -16,
            top: -16,
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: accentBg,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <Space direction="vertical" size={12} style={{ width: '100%', position: 'relative' }}>
          {/* Icon and Badge Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: accentBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComponent style={{ fontSize: 28, color: accentColor }} />
            </div>

            {badge && (
              <div
                style={{
                  background: badge.type === 'target' ? accentBg : 'rgba(0,191,165,0.1)',
                  color: accentColor,
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {badge.type === 'target' ? (
                  <>
                    <CheckCircleOutlined style={{ fontSize: 12 }} />
                    Target
                  </>
                ) : (
                  <>
                    <RiseOutlined style={{ fontSize: 12 }} />
                    {badge.text}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Label */}
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
            {label}
          </Text>

          {/* Value */}
          <Title 
            level={2} 
            style={{ 
              margin: 0, 
              color: COLOR.ocean,
              fontFamily: 'monospace',
              letterSpacing: '-0.03em',
            }}
          >
            {value}
          </Title>

          {/* Progress bar */}
          {barWidth > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: animDelay + 0.3, duration: 0.8 }}
            >
              <Progress 
                percent={barWidth}
                strokeColor={barColor}
                showInfo={false}
                strokeWidth={6}
                trailColor={COLOR.gray100}
              />
            </motion.div>
          )}
        </Space>
      </Card>
    </motion.div>
  );
};

export default StatCard;
