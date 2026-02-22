import { useState, useEffect } from 'react';
import { Layout, Space, Button, Typography, Avatar, Dropdown, Card, Row, Col, Divider, Drawer, Menu } from 'antd';
import { BellOutlined, UserOutlined, MenuOutlined, ControlOutlined, LogoutOutlined, CalendarOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Foydalanuvchi ma'lumotlarini olish
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isLoggedIn = currentUser.isLoggedIn || false;
  
  // Har bir foydalanuvchi uchun alohida profil
  const userEmail = currentUser.email || 'default';
  const profileKey = `userProfile_${userEmail}`;
  const savedProfile = localStorage.getItem(profileKey);
  const userProfile = savedProfile ? JSON.parse(savedProfile) : { 
    avatar: null, 
    name: currentUser.name,
    email: currentUser.email 
  };

  // Vazifalar statistikasini olish
  const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const activeDays = new Set(tasks.map(task => task.date)).size;

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    navigate('/login');
  };

  const handleMenuClick = (e) => {
    if (e.key === 'home') {
      navigate('/');
    } else if (e.key === 'profile') {
      navigate('/profile');
    } else if (e.key === 'admin') {
      navigate('/admin');
    }
    setDrawerOpen(false);
  };

  // Profil dropdown menyusi
  const profileDropdownMenu = {
    items: [
      {
        key: 'stats',
        label: (
          <Card 
            bordered={false} 
            style={{ width: 280, boxShadow: 'none' }}
            bodyStyle={{ padding: '12px' }}
          >
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar 
                  size={50} 
                  src={userProfile.avatar}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#0d7377' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    {userProfile.name || currentUser.name || 'Foydalanuvchi'}
                  </div>
                  <div style={{ color: '#888', fontSize: '13px' }}>
                    {currentUser.email}
                  </div>
                </div>
              </div>
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              📊 Statistika
            </div>
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <CalendarOutlined style={{ color: '#3f8600' }} />
                    Jami vazifalar
                  </span>
                  <span style={{ fontWeight: '600', color: '#3f8600' }}>{totalTasks}</span>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <TrophyOutlined style={{ color: '#cf1322' }} />
                    Bajarilgan
                  </span>
                  <span style={{ fontWeight: '600', color: '#cf1322' }}>{completedTasks}</span>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <FireOutlined style={{ color: '#1890ff' }} />
                    Faol kunlar
                  </span>
                  <span style={{ fontWeight: '600', color: '#1890ff' }}>{activeDays}</span>
                </div>
              </Col>
            </Row>
          </Card>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profilim',
        onClick: () => navigate('/profile'),
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Chiqish',
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  // Menu items
  const menuItems = [];
  
  if (isLoggedIn) {
    menuItems.push({
      key: 'home',
      icon: <CalendarOutlined />,
      label: 'Asosiy sahifa',
    });
    
    menuItems.push({
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profilim',
    });
    
    if (currentUser.role === 'admin') {
      menuItems.push({
        key: 'admin',
        icon: <ControlOutlined />,
        label: 'Admin Panel',
      });
    }
  }
  
  return (
    <>
      <AntHeader
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
          padding: '0 24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {/* Left Side - Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLoggedIn && menuItems.length > 0 && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '20px', color: '#fff' }} />}
              onClick={() => setDrawerOpen(true)}
              style={{ padding: '4px 8px' }}
            />
          )}
          <span style={{ fontSize: '32px' }}>🕌</span>
          <Title 
            level={3} 
            style={{ 
              margin: 0, 
              color: '#fff',
              fontSize: 'clamp(18px, 4vw, 26px)',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Islomiy Kundalik
          </Title>
        </div>
        
        {/* Right Side - Notification + Username + Profile */}
        {isLoggedIn && (
          <Space size="middle">
            <Button 
              type="text" 
              icon={<BellOutlined style={{ fontSize: '20px' }} />} 
              size="large"
              style={{ color: '#fff' }}
            />
            <span 
              className="user-name-header"
              style={{ 
                color: '#fff', 
                fontWeight: '600', 
                fontSize: '16px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              {currentUser.name || currentUser.email?.split('@')[0] || 'Foydalanuvchi'}
            </span>
            <Dropdown menu={profileDropdownMenu} trigger={['click']} placement="bottomRight">
              <Avatar 
                src={userProfile.avatar}
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: '#fff', 
                  color: '#0d7377', 
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
                size="large"
              />
            </Dropdown>
          </Space>
        )}
      </AntHeader>

      {/* Drawer for Menu */}
      <Drawer
        title="📱 Menu"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Menu
          mode="vertical"
          selectedKeys={[
            location.pathname === '/' ? 'home' : 
            location.pathname === '/profile' ? 'profile' : 
            location.pathname === '/admin' ? 'admin' : ''
          ]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>
    </>
  );
};

export default Header;