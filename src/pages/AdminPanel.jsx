import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Statistic, Row, Col, Badge, Tag, message, Popconfirm, Result } from 'antd';
import { UserOutlined, DeleteOutlined, EyeOutlined, LineChartOutlined, TrophyOutlined, ClockCircleOutlined, BarChartOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getAllTasks, getAllDhikr, deleteUser as deleteUserApi, getAdminStats } from '../lib/adminService';

export default function AdminPanel() {
  const navigate = useNavigate();
  
  // Admin huquqini tekshirish
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'admin' && currentUser.isLoggedIn;

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [dhikrs, setDhikrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalDhikr: 0,
    totalDhikrCount: 0
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      
      // Load users
      const usersResult = await getAllUsers();
      if (usersResult.success) {
        setUsers(usersResult.users);
      }
      
      // Load tasks
      const tasksResult = await getAllTasks();
      if (tasksResult.success) {
        setTasks(tasksResult.tasks);
      }
      
      // Load dhikr
      const dhikrResult = await getAllDhikr();
      if (dhikrResult.success) {
        setDhikrs(dhikrResult.dhikrs);
      }
      
      // Load stats
      const statsResult = await getAdminStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [isAdmin]);

  const handleDeleteTask = async (id) => {
    // Task deletion handled by tasksService
    message.info('Bu funksiya hali ishlamaydi');
  };

  const handleDeleteUser = async (id) => {
    const result = await deleteUserApi(id);
    if (result.success) {
      setUsers(users.filter(user => user.id !== id));
      message.success('Foydalanuvchi o\'chirildi');
      // Reload stats
      const statsResult = await getAdminStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } else {
      message.error('O\'chirishda xatolik: ' + result.error);
    }
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  // Statistika - database dan olingan ma'lumotlar
  const totalTasks = stats.totalTasks;
  const completedTasks = stats.completedTasks;
  const totalUsers = stats.totalUsers;
  const activeUsers = users.filter(user => user.role !== 'admin').length;

  const taskColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Vazifa nomi',
      dataIndex: 'task_name',
      key: 'task_name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Foydalanuvchi',
      key: 'user',
      render: (_, record) => (
        <span>{record.profiles?.email || 'N/A'}</span>
      ),
    },
    {
      title: 'Maqsad',
      key: 'goal',
      render: (_, record) => (
        <span>{record.goal_value} {record.unit}</span>
      ),
    },
    {
      title: 'Bajarilgan',
      key: 'actual',
      render: (_, record) => {
        const percentage = record.goal_value > 0 ? Math.round((record.actual_value / record.goal_value) * 100) : 0;
        return <span>{record.actual_value} {record.unit} ({percentage}%)</span>;
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Ism',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
        </Tag>
      ),
    },
    {
      title: 'Shahar',
      dataIndex: 'selected_city',
      key: 'selected_city',
      render: (city) => city || <span style={{ color: '#ccc' }}>-</span>,
    },
    {
      title: 'Yaratilgan sana',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString('uz-UZ') : '-',
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
