import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Statistic, Row, Col, Badge, Tag, message, Popconfirm, Result } from 'antd';
import { UserOutlined, DeleteOutlined, EyeOutlined, LineChartOutlined, TrophyOutlined, ClockCircleOutlined, BarChartOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const navigate = useNavigate();
  
  // Admin huquqini tekshirish
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'admin' && currentUser.isLoggedIn;

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [users, setUsers] = useState(() => {
    const registeredUsers = localStorage.getItem('registeredUsers');
    if (!registeredUsers) return [];
    
    const usersList = JSON.parse(registeredUsers);
    
    // Har bir foydalanuvchining profil ma'lumotlarini qo'shish
    return usersList.map(user => {
      const profileKey = `userProfile_${user.email}`;
      const userProfile = localStorage.getItem(profileKey);
      
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return {
          ...user,
          username: profile.username || '',
          location: profile.location || '',
          locationCoords: profile.locationCoords || null,
          profileName: profile.name || user.name
        };
      }
      
      return user;
    });
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }, [users]);

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    message.success('Vazifa o\'chirildi');
  };

  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    message.success('Foydalanuvchi o\'chirildi');
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  // Statistika
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const totalUsers = users.length;

  const taskColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Vazifa nomi',
      dataIndex: 'taskName',
      key: 'taskName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Maqsad',
      key: 'goal',
      render: (_, record) => (
        <span>{record.goalValue} {record.unit}</span>
      ),
    },
    {
      title: 'Bajarilgan',
      key: 'actual',
      render: (_, record) => {
        const percentage = record.goalValue > 0 ? Math.round((record.actualValue / record.goalValue) * 100) : 0;
        return <span>{record.actualValue} {record.unit} ({percentage}%)</span>;
      },
    },
    {
      title: 'Holati',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed) => (
        <Tag color={completed ? 'success' : 'warning'}>
          {completed ? 'Bajarildi' : 'Jarayonda'}
        </Tag>
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Amallar',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="O'chirishni tasdiqlaysizmi?"
          onConfirm={() => handleDeleteTask(record.id)}
          okText="Ha"
          cancelText="Yo'q"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          >
            O'chirish
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Ism va Username',
      key: 'userInfo',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <strong>{record.profileName || record.name}</strong>
          </Space>
          {record.username && (
            <span style={{ fontSize: '12px', color: '#888' }}>@{record.username}</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Lokatsiya',
      key: 'location',
      render: (_, record) => (
        record.location ? (
          <Space direction="vertical" size={0}>
            <span style={{ fontSize: '12px' }}>
              <EnvironmentOutlined style={{ color: '#0d7377' }} /> {record.location}
            </span>
            {record.locationCoords && (
              <a 
                href={`https://yandex.uz/maps/?pt=${record.locationCoords.lng},${record.locationCoords.lat}&z=16&l=map`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: '#0d7377' }}
              >
                🗺️ Xaritada
              </a>
            )}
          </Space>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        )
      ),
    },
    {
      title: 'Ro\'yxatdan o\'tgan sana',
      dataIndex: 'registeredDate',
      key: 'registeredDate',
    },
    {
      title: 'Vazifalar',
      dataIndex: 'tasksCount',
      key: 'tasksCount',
      render: (count) => <Badge count={count} showZero color="#1890ff" />,
    },
    {
      title: 'Bajarilgan',
      dataIndex: 'completedCount',
      key: 'completedCount',
      render: (count) => <Badge count={count} showZero color="#52c41a" />,
    },
    {
      title: 'Holati',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Faol' : 'Nofaol'}
        </Tag>
      ),
    },
    {
      title: 'Amallar',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showUserDetails(record)}
            size="small"
          >
            Ko'rish
          </Button>
          <Popconfirm
            title="O'chirishni tasdiqlaysizmi?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Agar foydalanuvchi admin bo'lmasa, kirish taqiqlanadi
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <Result
          status="403"
          title="Kirish rad etildi"
          subTitle="Kechirasiz, bu sahifaga kirish uchun admin huquqlari kerak."
          extra={
            <Space direction="vertical" size="large">
              <div>
                <p className="text-gray-600 mb-4">
                  Admin paneliga kirish faqat admin foydalanuvchilar uchun ruxsat etilgan.
                </p>
                <p className="text-gray-600">
                  Agar siz admin bo'lsangiz, iltimos tizimga kiring.
                </p>
              </div>
              <Space>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/login')}
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  Tizimga kirish
                </Button>
                <Button onClick={() => navigate('/')}>
                  Bosh sahifaga qaytish
                </Button>
              </Space>
            </Space>
          }
          icon={<LockOutlined style={{ color: '#667eea' }} />}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🔐 Admin Panel</h1>

      {/* Statistika kartochkalari */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow" bordered={false}>
            <Statistic
              title="Jami Foydalanuvchilar"
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow" bordered={false}>
            <Statistic
              title="Faol Foydalanuvchilar"
              value={activeUsers}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow" bordered={false}>
            <Statistic
              title="Jami Vazifalar"
              value={totalTasks}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow" bordered={false}>
            <Statistic
              title="Bajarilgan Vazifalar"
              value={completedTasks}
              prefix={<TrophyOutlined style={{ color: '#fa541c' }} />}
              valueStyle={{ color: '#fa541c', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Foydalanuvchilar jadvali */}
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>👥 Foydalanuvchilar</span>}
        className="mb-6 shadow-lg rounded-lg"
        bordered={false}
      >
        <Table 
          columns={userColumns} 
          dataSource={users} 
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Vazifalar jadvali */}
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>📊 Barcha Vazifalar</span>}
        className="shadow-lg rounded-lg"
        bordered={false}
      >
        <Table 
          columns={taskColumns} 
          dataSource={tasks} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Hozircha vazifa yo\'q' }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Foydalanuvchi tafsilotlari modali */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>👤 Foydalanuvchi Ma'lumotlari</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold mb-2">{selectedUser.profileName || selectedUser.name}</p>
              {selectedUser.username && (
                <p className="text-gray-600">@{selectedUser.username}</p>
              )}
              <p className="text-gray-600">📧 Email: {selectedUser.email}</p>
              <p className="text-gray-600">🆔 ID: {selectedUser.id}</p>
              {selectedUser.location && (
                <div className="mt-2">
                  <p className="text-gray-600">
                    <EnvironmentOutlined style={{ color: '#0d7377' }} /> {selectedUser.location}
                  </p>
                  {selectedUser.locationCoords && (
                    <a 
                      href={`https://yandex.uz/maps/?pt=${selectedUser.locationCoords.lng},${selectedUser.locationCoords.lat}&z=16&l=map`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#0d7377' }}
                    >
                      🗺️ Yandex Mapsda ko'rish
                    </a>
                  )}
                </div>
              )}
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card className="text-center">
                  <Statistic
                    title="Jami Vazifalar"
                    value={selectedUser.tasksCount}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="text-center">
                  <Statistic
                    title="Bajarilgan"
                    value={selectedUser.completedCount}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">📊 Natija:</p>
              <div className="flex items-center justify-between">
                <span>Bajarilish foizi:</span>
                <Tag color="green" style={{ fontSize: '16px', padding: '4px 12px' }}>
                  {selectedUser.tasksCount > 0 
                    ? Math.round((selectedUser.completedCount / selectedUser.tasksCount) * 100) 
                    : 0}%
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
