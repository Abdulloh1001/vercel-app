import { Layout, Space, Button, Typography, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Title 
        level={3} 
        style={{ 
          margin: 0, 
          color: '#1890ff',
          fontSize: 'clamp(18px, 4vw, 24px)'
        }}
      >
        My App
      </Title>
      
      <Space size="small">
        <Button 
          type="text" 
          icon={<SearchOutlined />} 
          size="middle"
          style={{ display: window.innerWidth < 576 ? 'none' : 'inline-flex' }}
        />
        <Button type="text" icon={<BellOutlined />} size="middle" />
        <Avatar 
          icon={<UserOutlined />} 
          style={{ backgroundColor: '#1890ff' }}
          size={window.innerWidth < 576 ? 'small' : 'default'}
        />
      </Space>
    </AntHeader>
  );
};

export default Header;