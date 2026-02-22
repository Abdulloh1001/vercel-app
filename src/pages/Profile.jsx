import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Divider, Row, Col, Statistic, Tag, Progress, Spin } from 'antd';
import { UserOutlined, EditOutlined, CameraOutlined, TrophyOutlined, FireOutlined, CalendarOutlined, SaveOutlined, EnvironmentOutlined, AimOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function Profile() {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Joriy foydalanuvchini olish
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userEmail = currentUser.email || 'default';
  
  const [userProfile, setUserProfile] = useState(() => {
    // Har bir foydalanuvchi uchun alohida profil
    const profileKey = `userProfile_${userEmail}`;
    const savedProfile = localStorage.getItem(profileKey);
    
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    
    // Agar profil bo'lmasa, currentUser ma'lumotlaridan yaratish
    return {
      name: currentUser.name || 'Foydalanuvchi',
      email: currentUser.email || 'user@example.com',
      bio: '',
      avatar: null,
      location: '',
      locationCoords: null,
      username: ''
    };
  });

  const [tasks] = useState(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // Namoz va zikr statistikasi
  const [prayers] = useState(() => {
    const savedPrayers = localStorage.getItem('dailyPrayers');
    if (savedPrayers) {
      const data = JSON.parse(savedPrayers);
      return data.prayers || [];
    }
    return [];
  });

  const [dhikrList] = useState(() => {
    const saved = localStorage.getItem('dhikrList');
    if (saved) {
      const data = JSON.parse(saved);
      return data.dhikrs || [];
    }
    return [];
  });

  useEffect(() => {
    form.setFieldsValue(userProfile);
  }, [userProfile, form]);

  // GPS lokatsiyasini olish
  const getLocation = () => {
    if (!navigator.geolocation) {
      message.error('Brauzeringiz GPS lokatsiyani qo\'llab-quvvatlamaydi!');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Yandex Geocoder API orqali manzilni olish
          const response = await fetch(
            `https://geocode-maps.yandex.ru/1.x/?apikey=YOUR_YANDEX_API_KEY&geocode=${longitude},${latitude}&format=json&lang=uz_UZ`
          );
          const data = await response.json();
          
          const geoObject = data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
          const address = geoObject?.metaDataProperty?.GeocoderMetaData?.text || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          const updatedProfile = {
            ...userProfile,
            location: address,
            locationCoords: { lat: latitude, lng: longitude }
          };
          
          setUserProfile(updatedProfile);
          form.setFieldValue('location', address);
          
          const profileKey = `userProfile_${userEmail}`;
          localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
          
          message.success('📍 Lokatsiya muvaffaqiyatli olindi!');
        } catch (error) {
          // Agar Yandex API ishlamasa, koordinatalarni saqlash
          const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const updatedProfile = {
            ...userProfile,
            location: locationText,
            locationCoords: { lat: latitude, lng: longitude }
          };
          
          setUserProfile(updatedProfile);
          form.setFieldValue('location', locationText);
          
          const profileKey = `userProfile_${userEmail}`;
          localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
          
          message.success('📍 Koordinatalar saqlandi!');
        }
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          message.error('GPS ruxsati berilmadi! Brauzer sozlamalaridan ruxsat bering.');
        } else {
          message.error('Lokatsiyani olishda xatolik yuz berdi!');
        }
      }
    );
  };

  const handleSave = (values) => {
    const updatedProfile = { ...userProfile, ...values };
    setUserProfile(updatedProfile);
    const profileKey = `userProfile_${userEmail}`;
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
    message.success('Profil yangilandi!');
    setEditMode(false);
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedProfile = { ...userProfile, avatar: e.target.result };
        setUserProfile(updatedProfile);
        const profileKey = `userProfile_${userEmail}`;
        localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
        message.success('Rasm yuklandi!');
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // Statistika
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const activeDays = new Set(tasks.map(task => task.date)).size;
  
  // Namoz statistikasi
  const completedPrayers = prayers.filter(p => p.completed).length;
  const totalPrayers = prayers.length;
  
  // Zikr statistikasi
  const totalDhikrCount = dhikrList.reduce((sum, dhikr) => sum + (dhikr.count || 0), 0);
  const totalDhikrGoal = dhikrList.reduce((sum, dhikr) => sum + (dhikr.goal || 0), 0);
  const dhikrProgress = totalDhikrGoal > 0 ? Math.round((totalDhikrCount / totalDhikrGoal) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <Row gutter={[24, 24]}>
        {/* Chap tomon - Profil kartochkasi */}
        <Col xs={24} lg={8}>
          <Card 
            className="shadow-2xl rounded-2xl text-center" 
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}
          >
            <Upload
              showUploadList={false}
              accept="image/*"
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => onSuccess("ok"), 0);
              }}
              onChange={handleAvatarChange}
            >
              <div className="relative inline-block cursor-pointer group">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  src={userProfile.avatar}
                  style={{ border: '4px solid #0d7377' }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
              </div>
            </Upload>
            
            <h2 className="text-2xl font-bold mt-4 mb-2">{userProfile.name}</h2>
            <p className="text-gray-500 mb-4">{userProfile.email}</p>
            
            <Tag style={{ 
              fontSize: '14px', 
              padding: '6px 16px', 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
              color: 'white',
              border: 'none',
              maxWidth: '280px',
              whiteSpace: 'normal',
              textAlign: 'center'
            }}>
              📍 {userProfile.location || 'Lokatsiya kiritilmagan'}
            </Tag>

            <Divider />

            {userProfile.bio && (
              <p className="text-gray-600 italic text-sm">
                "{userProfile.bio}"
              </p>
            )}
            {!userProfile.bio && (
              <p className="text-gray-400 italic text-sm">
                Biror narsa yozing...
              </p>
            )}
            
            {userProfile.username && (
              <>
                <Divider />
                <p className="text-gray-600 text-sm">
                  <strong>@{userProfile.username}</strong>
                </p>
              </>
            )}
          </Card>

          {/* Statistika kartochkasi */}
          <Card 
            className="shadow-2xl rounded-2xl mt-4" 
            title={
              <span style={{ 
                fontSize: '18px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                📊 Faoliyat Statistikasi
              </span>
            }
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 50%)',
                  color: 'white',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                    🕌
                  </div>
                  <div style={{ fontSize: '14px', textAlign: 'center', marginTop: '4px' }}>
                    Namozlar: {completedPrayers}/{totalPrayers}
                  </div>
                </div>
              </Col>
              
              <Col span={24}>
                <Statistic
                  title="📿 Zikr Tasbeh"
                  value={totalDhikrCount}
                  suffix={`/ ${totalDhikrGoal}`}
                  valueStyle={{ color: '#0d7377', fontSize: '20px', fontWeight: 'bold' }}
                />
                <Progress 
                  percent={dhikrProgress} 
                  strokeColor={{
                    from: '#0d7377',
                    to: '#14FFEC',
                  }}
                  style={{ marginTop: '8px' }}
                />
              </Col>
              
              <Col span={12}>
                <Statistic
                  title="✅ Vazifalar"
                  value={completedTasks}
                  suffix={`/ ${totalTasks}`}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#3f8600', fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="🔥 Faol kun"
                  value={activeDays}
                  prefix={<FireOutlined />}
                  valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* O'ng tomon - Profil tahrirlash */}
        <Col xs={24} lg={16}>
          <Card 
            className="shadow-2xl rounded-2xl"
            title={
              <span style={{ 
                fontSize: '18px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                👤 Profil Ma'lumotlari
              </span>
            }
            extra={
              !editMode ? (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  Tahrirlash
                </Button>
              ) : null
            }
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!editMode}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<span style={{ fontWeight: '500' }}>Ism va familiya</span>}
                    name="name"
                    rules={[{ required: true, message: 'Iltimos, ismingizni kiriting!' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />}
                      placeholder="Ism va familiya" 
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={<span style={{ fontWeight: '500' }}>Username</span>}
                    name="username"
                    rules={[
                      { 
                        pattern: /^[a-z0-9_.]*$/, 
                        message: 'Faqat kichik harflar, raqamlar, _ va . ishlating!' 
                      },
                      {
                        min: 3,
                        message: 'Username kamida 3 belgidan iborat bo\'lishi kerak!'
                      }
                    ]}
                  >
                    <Input 
                      prefix={<span style={{ color: '#0d7377', fontWeight: 'bold' }}>@</span>}
                      placeholder="username" 
                      size="large"
                      onChange={(e) => {
                        const lowerValue = e.target.value.toLowerCase();
                        form.setFieldValue('username', lowerValue);
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label={<span style={{ fontWeight: '500' }}>Joriy lokatsiya</span>}
                    name="location"
                  >
                    <Input 
                      prefix={<EnvironmentOutlined />}
                      placeholder="GPS orqali lokatsiyani oling" 
                      size="large"
                      disabled
                      suffix={
                        <Button
                          type="primary"
                          size="small"
                          icon={<AimOutlined />}
                          loading={loadingLocation}
                          onClick={getLocation}
                          disabled={!editMode}
                          style={{
                            background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                            border: 'none'
                          }}
                        >
                          GPS
                        </Button>
                      }
                    />
                  </Form.Item>
                  {userProfile.locationCoords && (
                    <div style={{ marginTop: '-15px', marginBottom: '15px' }}>
                      <a 
                        href={`https://yandex.uz/maps/?pt=${userProfile.locationCoords.lng},${userProfile.locationCoords.lat}&z=16&l=map`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0d7377', fontSize: '12px' }}
                      >
                        🗺️ Yandex Mapsda ko'rish
                      </a>
                    </div>
                  )}
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label={<span style={{ fontWeight: '500' }}>Status/Bio</span>}
                    name="bio"
                  >
                    <TextArea 
                      rows={4}
                      placeholder="Biror narsa yozing..."
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editMode && (
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    size="large"
                    className="mr-2"
                    style={{
                      background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      marginRight: '12px'
                    }}
                  >
                    Saqlash
                  </Button>
                  <Button 
                    size="large"
                    onClick={() => {
                      setEditMode(false);
                      form.setFieldsValue(userProfile);
                    }}
                    style={{
                      borderRadius: '8px',
                      borderColor: '#0d7377',
                      color: '#0d7377',
                      fontWeight: '600'
                    }}
                  >
                    Bekor qilish
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Card>

          {/* Eng so'nggi natijalar */}
          <Card 
            className="shadow-lg rounded-lg mt-4"
            title={<span style={{ fontSize: '18px', fontWeight: '600' }}>🏆 Eng So'nggi Natijalar</span>}
            bordered={false}
          >
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => {
                  const percentage = task.goalValue > 0 ? Math.round((task.actualValue / task.goalValue) * 100) : 0;
                  return (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <strong>{task.taskName}</strong>
                        <Tag color={task.completed ? 'success' : 'warning'}>
                          {task.completed ? '✓ Bajarildi' : `${percentage}%`}
                        </Tag>
                      </div>
                      <p className="text-sm text-gray-600">
                        {task.actualValue}/{task.goalValue} {task.unit} • {task.date}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Hozircha vazifa yo'q</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
