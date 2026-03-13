/**
 * RevenueChart Component - Bar chart for revenue data
 * Uses Ant Design Card and custom CSS bars
 */

import React, { useState } from 'react';
import { Card, Space, Button, Typography } from 'antd';
import { motion } from 'framer-motion';
import { COLOR } from '../../styles/adminTheme';

const { Title, Text } = Typography;

const RevenueChart = ({ 
  monthlyData = [], 
  weeklyData = [],
  title = 'Revenue Growth',
  subtitle = 'Holographic Projection',
  animDelay = 0,
}) => {
  const [chartMode, setChartMode] = useState('month');
  const data = chartMode === 'month' ? monthlyData : weeklyData;
  const max = Math.max(...data.map((d) => d.revenue));

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
          height: '100%',
        }}
        bodyStyle={{ padding: 24 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0, color: COLOR.ocean }}>
              {title}
            </Title>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: 10, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
              }}
            >
              {subtitle}
            </Text>
          </Space>

          {/* Mode Toggle */}
          <Space size={8}>
            <Button
              type={chartMode === 'week' ? 'primary' : 'default'}
              size="small"
              onClick={() => setChartMode('week')}
              style={{
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Week
            </Button>
            <Button
              type={chartMode === 'month' ? 'primary' : 'default'}
              size="small"
              onClick={() => setChartMode('month')}
              style={{
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Month
            </Button>
          </Space>
        </div>

        {/* Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Bars */}
          <div style={{ height: 224, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 4px' }}>
            {data.map((d, i) => {
              const heightPct = Math.round((d.revenue / max) * 100);
              const gradient = i % 2 === 0
                ? `linear-gradient(to top, rgba(0,119,182,0.4), rgba(0,119,182,0.9))`
                : `linear-gradient(to top, rgba(0,191,165,0.4), rgba(0,191,165,0.9))`;
              
              return (
                <div
                  key={d.month}
                  style={{
                    flex: 1,
                    height: `${heightPct}%`,
                    background: gradient,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    opacity: 0.9,
                    transition: 'opacity 0.2s',
                    position: 'relative',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    const tooltip = e.currentTarget.querySelector('.tooltip');
                    if (tooltip) tooltip.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    const tooltip = e.currentTarget.querySelector('.tooltip');
                    if (tooltip) tooltip.style.opacity = '0';
                  }}
                >
                  {/* Tooltip */}
                  <div
                    className="tooltip"
                    style={{
                      position: 'absolute',
                      top: -32,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1F2937',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 6,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    ${(d.revenue / 1000).toFixed(1)}k
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            {data.map((d) => (
              <span
                key={d.month}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 10,
                  color: COLOR.gray400,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {d.month}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RevenueChart;
