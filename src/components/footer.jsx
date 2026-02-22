import { Layout, Row, Col, Space, Typography } from 'antd';
import { GithubOutlined, InstagramOutlined, LinkedinOutlined, TwitterOutlined, HeartFilled, RocketOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '40px 20px 24px',
        marginTop: 'auto',
      }}
    >
      <Row gutter={[16, 24]} justify="center">
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RocketOutlined /> Loyiha Haqida
          </Text>
          <Space direction="vertical" style={{ marginTop: '12px', display: 'flex' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Biz haqimizda</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Xususiyatlar</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Blog</Link>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '18px' }}>
            📞 Aloqa
          </Text>
          <Space direction="vertical" style={{ marginTop: '12px', display: 'flex' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Yordam markazi</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Bog'lanish</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>FAQ</Link>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '18px' }}>
            📄 Qoidalar
          </Text>
          <Space direction="vertical" style={{ marginTop: '12px', display: 'flex' }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Maxfiylik siyosati</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Foydalanish shartlari</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Cookie siyosati</Link>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Text strong style={{ color: '#fff', fontSize: '18px' }}>
            🌐 Ijtimoiy tarmoqlar
          </Text>
          <Space size="large" style={{ marginTop: '12px' }}>
            <Link href="#" style={{ color: '#fff', fontSize: '24px' }}>
              <TwitterOutlined />
            </Link>
            <Link href="#" style={{ color: '#fff', fontSize: '24px' }}>
              <InstagramOutlined />
            </Link>
            <Link href="#" style={{ color: '#fff', fontSize: '24px' }}>
              <LinkedinOutlined />
            </Link>
            <Link href="#" style={{ color: '#fff', fontSize: '24px' }}>
              <GithubOutlined />
            </Link>
          </Space>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          © 2026 Kundalik Vazifalar. Barcha huquqlar himoyalangan. <HeartFilled style={{ color: '#ff4d4f' }} /> bilan yaratildi
        </Text>
      </div>
    </AntFooter>
  );
};

export default Footer;