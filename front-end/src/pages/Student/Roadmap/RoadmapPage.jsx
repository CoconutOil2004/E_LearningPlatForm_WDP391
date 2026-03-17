import React from 'react';
import { motion } from 'framer-motion';
import { 
  CodeOutlined, 
  DatabaseOutlined, 
  RocketOutlined, 
  CheckCircleFilled, 
  ArrowRightOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { Button, Typography, Tag, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

const { Title, Text, Paragraph } = Typography;

const ROADMAPS = [
  {
    id: 'frontend',
    title: 'Front-end Development',
    description: 'Become a professional Front-end developer with ReactJS. Path from basic to advanced.',
    icon: <CodeOutlined style={{ fontSize: 32, color: '#6366f1' }} />,
    color: '#6366f1',
    steps: [
      { id: 1, title: 'HTML, CSS & Basic JavaScript', desc: 'The most important foundation of web development.', completed: true },
      { id: 2, title: 'Advanced JavaScript (ES6+)', desc: 'Master logic, asynchronous processing, closures...', completed: true },
      { id: 3, title: 'Responsive Web Design', desc: 'Create interfaces compatible with all mobile devices.', completed: false },
      { id: 4, title: 'ReactJS / Next.js', desc: 'The most popular library for building modern UIs.', current: true },
      { id: 5, title: 'State Management (Redux/Zustand)', desc: 'Manage large-scale application state.', completed: false },
      { id: 6, title: 'Deployment & CI/CD', desc: 'Deploy applications to Production professionally.', completed: false },
    ]
  },
  {
    id: 'backend',
    title: 'Back-end Development',
    description: 'Build powerful server-side systems with Node.js, Express, and MongoDB database.',
    icon: <DatabaseOutlined style={{ fontSize: 32, color: '#10b981' }} />,
    color: '#10b981',
    steps: [
      { id: 1, title: 'Node.js & Express Basics', desc: 'Basic Server-side programming with JavaScript.', completed: true },
      { id: 2, title: 'RESTful API Design', desc: 'Industry standard API design guidelines.', completed: false, current: true },
      { id: 3, title: 'Databases (SQL & NoSQL)', desc: 'Efficiently store and query data.', completed: false },
      { id: 4, title: 'Authentication & Security', desc: 'Secure applications, JWT, OAuth2.', completed: false },
      { id: 5, title: 'Advanced Backend Patterns', desc: 'Microservices, Caching, RabbitMQ...', completed: false },
      { id: 6, title: 'AWS / Cloud Deployment', desc: 'Operate systems on the cloud.', completed: false },
    ]
  }
];

const RoadmapPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <Tag color="blue" style={{ marginBottom: 16, borderRadius: 20, padding: '2px 12px' }}>
            LEARNING ROADMAP
          </Tag>
          <Title level={1} style={{ fontSize: 42, color: '#1e293b', marginBottom: 16 }}>
            Start Your Journey
          </Title>
          <Paragraph style={{ fontSize: 18, color: '#64748b', maxWidth: 700, margin: '0 auto' }}>
            A well-designed roadmap to help you go from zero to landing your dream job at top tech companies.
          </Paragraph>
        </motion.div>

        {/* Roadmap List */}
        <Row gutter={[32, 32]}>
          {ROADMAPS.map((roadmap, idx) => (
            <Col xs={24} lg={12} key={roadmap.id}>
              <motion.div
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card 
                  hoverable
                  style={{ 
                    borderRadius: 24, 
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                  }}
                  bodyStyle={{ padding: '32px' }}
                >
                  <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                    <div style={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 16, 
                      background: `${roadmap.color}15`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {roadmap.icon}
                    </div>
                    <div>
                      <Title level={3} style={{ margin: 0, color: '#1e293b' }}>{roadmap.title}</Title>
                      <Paragraph style={{ color: '#64748b', margin: '4px 0 0' }}>{roadmap.description}</Paragraph>
                    </div>
                  </div>

                  <div style={{ position: 'relative', paddingLeft: 30 }}>
                    {/* Vertical Line */}
                    <div style={{ 
                      position: 'absolute', 
                      left: 11, 
                      top: 10, 
                      bottom: 10, 
                      width: 2, 
                      background: '#e2e8f0' 
                    }} />

                    {roadmap.steps.map((step, sIdx) => (
                      <div key={step.id} style={{ marginBottom: 24, position: 'relative' }}>
                        {/* Status Dot */}
                        <div style={{ 
                          position: 'absolute', 
                          left: -26, 
                          top: 4, 
                          zIndex: 2,
                          background: '#fff' 
                        }}>
                          {step.completed ? (
                            <CheckCircleFilled style={{ color: roadmap.color, fontSize: 16 }} />
                          ) : step.current ? (
                            <div style={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              border: `4px solid ${roadmap.color}`,
                              background: '#fff'
                            }} />
                          ) : (
                            <div style={{ 
                              width: 14, 
                              height: 14, 
                              borderRadius: '50%', 
                              background: '#e2e8f0' 
                            }} />
                          )}
                        </div>

                        <div style={{ opacity: step.completed || step.current ? 1 : 0.6 }}>
                          <Text strong style={{ fontSize: 16, color: '#334155', display: 'block' }}>
                            {step.title}
                            {step.current && <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>LEARNING</Tag>}
                          </Text>
                          <Text style={{ fontSize: 13, color: '#64748b' }}>{step.desc}</Text>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    icon={<RocketOutlined />}
                    style={{ 
                      marginTop: 16, 
                      height: 50, 
                      borderRadius: 12, 
                      background: roadmap.color,
                      border: 'none',
                      fontWeight: 700
                    }}
                    onClick={() => navigate(ROUTES.COURSES)}
                  >
                    View Detailed Roadmap
                  </Button>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ 
            marginTop: 80, 
            padding: '60px 40px', 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: 32,
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 20px 50px -12px rgba(15, 23, 42, 0.3)'
          }}
        >
          <UnlockOutlined style={{ fontSize: 48, color: '#38bdf8', marginBottom: 24 }} />
          <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>Are you ready to start?</Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: 18, maxWidth: 600, margin: '0 auto 32px' }}>
            Thousands of students have changed their careers through EduFlow. Be the next one!
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            icon={<ArrowRightOutlined />}
            style={{ 
              height: 56, 
              padding: '0 40px', 
              borderRadius: 28, 
              background: '#38bdf8', 
              border: 'none',
              color: '#0f172a',
              fontWeight: 900,
              fontSize: 16
            }}
            onClick={() => navigate(ROUTES.COURSES)}
          >
            Explore Courses Now
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default RoadmapPage;
