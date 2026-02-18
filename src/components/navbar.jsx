import { useState, useEffect } from 'react';
import { Menu, Drawer, Button } from 'antd';
import { HomeOutlined, AppstoreOutlined, UserOutlined, InfoCircleOutlined, MailOutlined, MenuOutlined } from '@ant-design/icons';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const items = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'products',
      icon: <AppstoreOutlined />,
      label: 'Products',
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'About',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'contact',
      icon: <MailOutlined />,
      label: 'Contact',
    },
  ];

  if (isMobile) {
    return (
      <>
        <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            style={{ fontSize: '18px' }}
          />
        </div>
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setOpen(false)}
          open={open}
        >
          <Menu
            mode="vertical"
            defaultSelectedKeys={['home']}
            items={items}
            onClick={() => setOpen(false)}
          />
        </Drawer>
      </>
    );
  }

  return (
    <Menu
      mode="horizontal"
      defaultSelectedKeys={['home']}
      items={items}
      style={{
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
      }}
    />
  );
};

export default Navbar;