import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Drawer, Button, Dropdown, Avatar, Card, Row, Col, Statistic, Space, Divider } from 'antd';
import { HomeOutlined, UserOutlined, ControlOutlined, MenuOutlined, DashboardOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined, CalendarOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCurrentKey = () => {
    const path = location.pathname;
    if (path === '/admin') return 'admin';
    return '';
  };

  const handleMenuClick = (e) => {
    const routes = {
      'admin': '/admin',
    };
    navigate(routes[e.key]);
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    navigate('/login');
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
                  style={{ backgroundColor: '#667eea' }}
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

  const items = [];

  // Agar admin bo'lsa, admin panelni ko'rsatish
  if (currentUser.role === 'admin' && currentUser.isLoggedIn) {
    items.push({
      key: 'admin',
      icon: <ControlOutlined />,
      label: 'Admin Panel',
    });
  }

  if (isMobile) {
    return (
      <>
        <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            style={{ fontSize: '18px' }}
          />
          
          {isLoggedIn ? (
            <Dropdown menu={profileDropdownMenu} trigger={['click']} placement="bottomRight">
              <Avatar 
                src={userProfile.avatar}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer', backgroundColor: '#667eea' }}
              />
            </Dropdown>
          ) : (
            <Space>
              <Button 
                type="text" 
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                size="small"
              >
                Kirish
              </Button>
            </Space>
          )}
        </div>
        <Drawer
          title="📱 Menu"
          placement="left"
          onClose={() => setOpen(false)}
          open={open}
        >
          <Menu
            mode="vertical"
            selectedKeys={[getCurrentKey()]}
            items={items}
            onClick={handleMenuClick}
          />
          
          {!isLoggedIn && (
            <>
              <Divider />
              <Space direction="vertical" style={{ width: '100%', padding: '0 16px' }}>
                <Button 
                  type="primary" 
                  icon={<LoginOutlined />}
                  onClick={() => {
                    setOpen(false);
                    navigate('/login');
                  }}
                  block
                  style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)', border: 'none' }}
                >
                  Kirish
                </Button>
                <Button 
                  icon={<UserAddOutlined />}
                  onClick={() => {
                    setOpen(false);
                    navigate('/register');
                  }}
                  block
                >
                  Ro'yxatdan o'tish
                </Button>
              </Space>
            </>
          )}
        </Drawer>
      </>
    );
  }

  return (
    <div style={{ 
      background: '#fff', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Menu
        mode="horizontal"
        selectedKeys={[getCurrentKey()]}
        items={items}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          flex: 1,
          justifyContent: 'center',
        }}
      />
      
      {isLoggedIn ? (
        <Space>
          <span style={{ fontWeight: '600', fontSize: '16px', color: '#0d7377' }}>
            {currentUser.name || currentUser.email?.split('@')[0] || 'Foydalanuvchi'}
          </span>
          <Dropdown menu={profileDropdownMenu} trigger={['click']} placement="bottomRight">
            <Avatar 
              src={userProfile.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#0d7377', cursor: 'pointer' }}
              size="large"
            />
          </Dropdown>
        </Space>
      ) : (
        <Space>
          <Button 
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            Kirish
          </Button>
          <Button 
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)', border: 'none' }}
          >
            Ro'yxatdan o'tish
          </Button>
        </Space>
      )}
    </div>
  );
};

export default Navbar;