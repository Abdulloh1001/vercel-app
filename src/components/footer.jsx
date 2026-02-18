import { Layout, Row, Col, Space, Typography } from 'antd';
import { GithubOutlined, TwitterOutlined, LinkedinOutlined, FacebookOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter
      style={{
        background: '#001529',
        color: '#fff',
        padding: '32px 20px',
        marginTop: 'auto',
      }}
    >
      <Row gutter={[16, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '16px' }}>
            Company
          </Text>
          <Space direction="vertical" style={{ marginTop: '12px', display: 'flex' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>About Us</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Careers</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Blog</Link>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '16px' }}>
            Support
          </Text>
          <Space direction="vertical" style={{ marginTop: '12px', display: 'flex' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Help Center</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Contact Us</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>FAQ</Link>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '16px' }}>
            Legal
          </Text>
          <Space direction="vertical" style={{ marginTop: '12px', display: 'flex' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Privacy Policy</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Terms of Service</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.65)' }}>Cookie Policy</Link>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '16px' }}>
            Follow Us
          </Text>
          <Space size="large" style={{ marginTop: '12px' }}>
            <Link href="#" style={{ color: '#fff', fontSize: '20px' }}>
              <GithubOutlined />
            </Link>
            <Link href="#" style={{ color: '#fff', fontSize: '20px' }}>
              <TwitterOutlined />
            </Link>
            <Link href="#" style={{ color: '#fff', fontSize: '20px' }}>
              <LinkedinOutlined />
            </Link>
            <Link href="#" style={{ color: '#fff', fontSize: '20px' }}>
              <FacebookOutlined />
            </Link>
          </Space>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
          © 2026 My App. All rights reserved.
        </Text>
      </div>
    </AntFooter>
  );
};

export default Footer;