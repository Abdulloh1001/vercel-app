import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Button, Card, Table, Space, Tag, message, Modal, Progress, Statistic, Row, Col, Checkbox, Badge, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, TrophyOutlined, FireOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function Dashboard() {
  const [form] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [dhikrForm] = Form.useForm();
  
  // Joriy foydalanuvchini olish
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userEmail = currentUser.email || 'default';
  
  const [tasks, setTasks] = useState(() => {
    const tasksKey = `dailyTasks_${userEmail}`;
    const savedTasks = localStorage.getItem(tasksKey);
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Shahar tanlash va koordinatalar
  const [selectedCity, setSelectedCity] = useState(() => {
    const cityKey = `selectedCity_${userEmail}`;
    return localStorage.getItem(cityKey) || 'Toshkent';
  });
  
  // O'zbekiston shaharlari koordinatalari
  const cityCoordinates = {
    'Andijon': { lat: 40.7821, lng: 72.3442 },
    'Buxoro': { lat: 39.7747, lng: 64.4286 },
    'Guliston': { lat: 40.4897, lng: 68.7842 },
    'Jizzax': { lat: 40.1158, lng: 67.8422 },
    'Marg\'ilon': { lat: 40.4716, lng: 71.7245 },
    'Namangan': { lat: 41.0004, lng: 71.6726 },
    'Navoiy': { lat: 40.0844, lng: 65.3792 },
    'Nukus': { lat: 42.4531, lng: 59.6103 },
    'Qarshi': { lat: 38.8606, lng: 65.7890 },
    'Qo\'qon': { lat: 40.5283, lng: 70.9424 },
    'Samarqand': { lat: 39.6542, lng: 66.9597 },
    'Toshkent': { lat: 41.2995, lng: 69.2401 },
    'Xiva': { lat: 41.3775, lng: 60.3642 }
  };
  
  const [prayerTimesLoading, setPrayerTimesLoading] = useState(true);
  
  // Namoz vaqtlari state
  const [prayers, setPrayers] = useState(() => {
    const prayersKey = `dailyPrayers_${userEmail}`;
    const savedPrayers = localStorage.getItem(prayersKey);
    const today = new Date().toLocaleDateString('uz-UZ');
    const saved = savedPrayers ? JSON.parse(savedPrayers) : null;
    
    // Agar bugun uchun saqlanmagan bo'lsa, yangi kun uchun reset qil
    if (!saved || saved.date !== today) {
      const newPrayers = {
        date: today,
        prayers: [
          { id: 1, name: 'Bomdod', time: '...', completed: false, icon: '🌅' },
          { id: 2, name: 'Peshin', time: '...', completed: false, icon: '☀️' },
          { id: 3, name: 'Asr', time: '...', completed: false, icon: '🌤️' },
          { id: 4, name: 'Shom', time: '...', completed: false, icon: '🌆' },
          { id: 5, name: 'Xufton', time: '...', completed: false, icon: '🌙' }
        ]
      };
      localStorage.setItem(prayersKey, JSON.stringify(newPrayers));
      return newPrayers.prayers;
    }
    return saved.prayers;
  });
  
  // API dan namoz vaqtlarini olish
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setPrayerTimesLoading(true);
        
        // Backend serverless function dan namoz vaqtlarini olish
        const response = await fetch(
          `/api/prayer-times?city=${selectedCity}`
        );
        const data = await response.json();
        
        if (data.success && data.times) {
          const times = data.times;
          const today = new Date().toLocaleDateString('uz-UZ');
          
          setPrayers(prev => {
            const updated = [
              { ...prev[0], time: times.Bomdod },
              { ...prev[1], time: times.Peshin },
              { ...prev[2], time: times.Asr },
              { ...prev[3], time: times.Shom },
              { ...prev[4], time: times.Xufton }
            ];
            
            const prayersKey = `dailyPrayers_${userEmail}`;
            localStorage.setItem(prayersKey, JSON.stringify({ 
              date: today, 
              prayers: updated,
              city: selectedCity,
              source: data.source
            }));
            
            return updated;
          });
        }
      } catch (error) {
        console.error('Namoz vaqtlarini yuklashda xatolik:', error);
        
        // Agar server ishlamasa, Aladhan API dan olamiz
        await fetchFromAladhanAPI();
      } finally {
        setPrayerTimesLoading(false);
      }
    };
    
    // Fallback function
    const fetchFromAladhanAPI = async () => {
      try {
        const coords = cityCoordinates[selectedCity];
        const response = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=2`
        );
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.timings) {
          const timings = data.data.timings;
          const today = new Date().toLocaleDateString('uz-UZ');
          
          setPrayers(prev => {
            const updated = [
              { ...prev[0], time: timings.Fajr },
              { ...prev[1], time: timings.Dhuhr },
              { ...prev[2], time: timings.Asr },
              { ...prev[3], time: timings.Maghrib },
              { ...prev[4], time: timings.Isha }
            ];
            
            const prayersKey = `dailyPrayers_${userEmail}`;
            localStorage.setItem(prayersKey, JSON.stringify({ 
              date: today, 
              prayers: updated,
              city: selectedCity,
              source: 'fallback'
            }));
            
            return updated;
          });
        }
      } catch (err) {
        console.error('Fallback API xatolik:', err);
      }
    };
    
    fetchPrayerTimes();
  }, [selectedCity]);
  
  const handleCityChange = (city) => {
    setSelectedCity(city);
    const cityKey = `selectedCity_${userEmail}`;
    localStorage.setItem(cityKey, city);
  };

  // Zikr tizimi - turli xil zikrlar
  const [dhikrList, setDhikrList] = useState(() => {
    const dhikrKey = `dhikrList_${userEmail}`;
    const saved = localStorage.getItem(dhikrKey);
    const today = new Date().toLocaleDateString('uz-UZ');
    const savedData = saved ? JSON.parse(saved) : null;
    
    // Agar bugun uchun saqlanmagan bo'lsa, yangi kun uchun reset qil
    if (!savedData || savedData.date !== today) {
      const newDhikrList = {
        date: today,
        dhikrs: []
      };
      localStorage.setItem(dhikrKey, JSON.stringify(newDhikrList));
      return newDhikrList.dhikrs;
    }
    return savedData.dhikrs;
  });
  
  const [isDhikrModalVisible, setIsDhikrModalVisible] = useState(false);
  const [isAddDhikrModalVisible, setIsAddDhikrModalVisible] = useState(false);
  const [isStatsModalVisible, setIsStatsModalVisible] = useState(false);
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const tasksKey = `dailyTasks_${userEmail}`;
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  }, [tasks, userEmail]);

  useEffect(() => {
    const today = new Date().toLocaleDateString('uz-UZ');
    const prayersKey = `dailyPrayers_${userEmail}`;
    localStorage.setItem(prayersKey, JSON.stringify({ date: today, prayers }));
  }, [prayers, userEmail]);

  useEffect(() => {
    const today = new Date().toLocaleDateString('uz-UZ');
    const dhikrKey = `dhikrList_${userEmail}`;
    localStorage.setItem(dhikrKey, JSON.stringify({ date: today, dhikrs: dhikrList }));
  }, [dhikrList, userEmail]);

  // Reset current dhikr index if it's out of bounds
  useEffect(() => {
    if (currentDhikrIndex >= dhikrList.length && dhikrList.length > 0) {
      setCurrentDhikrIndex(dhikrList.length - 1);
    } else if (dhikrList.length === 0) {
      setCurrentDhikrIndex(0);
    }
  }, [dhikrList.length, currentDhikrIndex]);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('uz-UZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const togglePrayer = (id) => {
    // Namoz vaqtini tekshirish
    const prayer = prayers.find(p => p.id === id);
    if (!prayer) return;
    
    const currentTime = new Date();
    const [hours, minutes] = prayer.time.split(':');
    const prayerTime = new Date();
    prayerTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0);
    
    // Agar namoz vaqti hali kelmagan bo'lsa
    if (currentTime < prayerTime) {
      message.warning('⏰ Bu namoz vaqti hali kelmadi!');
      return;
    }
    
    setPrayers(prayers.map(p => 
      p.id === id ? { ...p, completed: !p.completed } : p
    ));
    message.success('✅ Namoz holati yangilandi');
  };

  const incrementDhikr = (id) => {
    setDhikrList(dhikrList.map(dhikr => 
      dhikr.id === id ? { ...dhikr, count: dhikr.count + 1 } : dhikr
    ));
  };

  const handleAddDhikr = (values) => {
    const newDhikr = {
      id: Date.now(),
      name: values.name,
      goal: values.goal,
      count: 0,
      icon: values.icon || ''
    };
    setDhikrList([...dhikrList, newDhikr]);
    message.success('✅ Yangi zikr qo\'shildi!');
    setIsAddDhikrModalVisible(false);
    dhikrForm.resetFields();
  };

  const handleDhikrSubmit = (values) => {
    const dhikrId = values.dhikrId;
    setDhikrList(dhikrList.map(dhikr => 
      dhikr.id === dhikrId ? { ...dhikr, count: dhikr.count + values.count } : dhikr
    ));
    message.success(`${values.count} ta zikr qo'shildi!`);
    setIsDhikrModalVisible(false);
    dhikrForm.resetFields();
  };

  const deleteDhikr = (id) => {
    setDhikrList(dhikrList.filter(dhikr => dhikr.id !== id));
    message.success('Zikr o\'chirildi');
  };

  const handleSubmit = (values) => {
    const newTask = {
      id: Date.now(),
      taskName: values.taskName,
      goalValue: values.goalValue,
      unit: values.unit,
      actualValue: 0,
      date: getCurrentDate(),
      completed: false
    };
    
    setTasks([newTask, ...tasks]);
    message.success('✅ Vazifa qo\'shildi!');
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    message.info('O\'chirildi');
  };

  const showProgressModal = (task) => {
    setSelectedTask(task);
    progressForm.setFieldsValue({ actualValue: task.actualValue });
    setIsProgressModalVisible(true);
  };

  const handleProgressUpdate = (values) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          actualValue: values.actualValue,
          completed: values.actualValue >= task.goalValue
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    message.success('Natija yangilandi!');
    setIsProgressModalVisible(false);
    progressForm.resetFields();
    setSelectedTask(null);
  };

  // Statistika
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const completedPrayers = prayers.filter(p => p.completed).length;
  const totalPrayers = prayers.length;
  const prayerRate = totalPrayers > 0 ? Math.round((completedPrayers / totalPrayers) * 100) : 0;
  
  const totalDhikrCount = dhikrList.reduce((sum, dhikr) => sum + dhikr.count, 0);
  const totalDhikrGoal = dhikrList.reduce((sum, dhikr) => sum + dhikr.goal, 0);
  const dhikrProgress = totalDhikrGoal > 0 ? Math.round((totalDhikrCount / totalDhikrGoal) * 100) : 0;

  const columns = [
    {
      title: 'Vazifa nomi',
      dataIndex: 'taskName',
      key: 'taskName',
      render: (text) => <strong style={{ fontSize: '15px' }}>{text}</strong>,
    },
    {
      title: 'Maqsad',
      key: 'goal',
      render: (_, record) => (
        <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px' }}>
          {record.goalValue} {record.unit}
        </Tag>
      ),
    },
    {
      title: 'Bajarilgan',
      key: 'actual',
      render: (_, record) => {
        const percentage = record.goalValue > 0 ? Math.round((record.actualValue / record.goalValue) * 100) : 0;
        return (
          <div>
            <Progress 
              percent={percentage} 
              size="small" 
              status={percentage >= 100 ? 'success' : percentage >= 50 ? 'active' : 'normal'}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.actualValue}/{record.goalValue} {record.unit}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Holati',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed) => (
        <Tag color={completed ? 'success' : 'warning'} style={{ fontSize: '13px', padding: '4px 12px' }}>
          {completed ? '✓ Bajarildi' : '⏳ Jarayonda'}
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
        <Space>
          <Button 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showProgressModal(record)}
            size="small"
          >
            Yangilash
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            O'chirish
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto" style={{ maxWidth: '100%', padding: '0', background: '#f0f2f5' }}>
      
      {/* Namoz vaqtlari - Islomiy dizayn */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
        padding: '40px 20px',
        marginBottom: '24px',
        borderRadius: '0 0 30px 30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          color: 'white', 
          textAlign: 'center', 
          fontSize: '28px', 
          fontWeight: 'bold',
          marginBottom: '8px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          🕌 Namoz Vaqtlari
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '16px', fontSize: '16px' }}>
          {getCurrentDate()} - {getCurrentTime()}
        </p>
        
        {/* Shahar tanlash */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Select
            value={selectedCity}
            onChange={handleCityChange}
            style={{ width: 200 }}
            size="large"
            loading={prayerTimesLoading}
          >
            <Option value="Andijon">📍 Andijon</Option>
            <Option value="Buxoro">📍 Buxoro</Option>
            <Option value="Guliston">📍 Guliston</Option>
            <Option value="Jizzax">📍 Jizzax</Option>
            <Option value="Marg'ilon">📍 Marg'ilon</Option>
            <Option value="Namangan">📍 Namangan</Option>
            <Option value="Navoiy">📍 Navoiy</Option>
            <Option value="Nukus">📍 Nukus</Option>
            <Option value="Qarshi">📍 Qarshi</Option>
            <Option value="Qo'qon">📍 Qo'qon</Option>
            <Option value="Samarqand">📍 Samarqand</Option>
            <Option value="Toshkent">📍 Toshkent</Option>
            <Option value="Xiva">📍 Xiva</Option>
          </Select>
        </div>
        
        <Row gutter={[12, 12]} justify="center">
          {prayers.map((prayer, index) => {
            const currentTime = new Date();
            const timeStr = prayer.time || '00:00';
            const [hours, minutes] = timeStr.split(':');
            const prayerTime = new Date();
            prayerTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0);
            const isCurrentPrayer = currentTime >= prayerTime && 
              (index === prayers.length - 1 || currentTime < (() => {
                const nextTime = prayers[index + 1]?.time || '23:59';
                const [h, m] = nextTime.split(':');
                const next = new Date();
                next.setHours(parseInt(h) || 23, parseInt(m) || 59, 0);
                return next;
              })());
            
            return (
              <Col xs={12} sm={8} md={4} key={prayer.id}>
                <div
                  onClick={() => togglePrayer(prayer.id)}
                  style={{
                    background: prayer.completed ? 'rgba(76, 175, 80, 0.95)' : isCurrentPrayer ? '#FFD700' : 'rgba(255,255,255,0.95)',
                    borderRadius: '20px',
                    padding: '20px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: isCurrentPrayer ? '3px solid #FF6B6B' : 'none',
                    boxShadow: prayer.completed ? '0 4px 15px rgba(76, 175, 80, 0.4)' : '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    transform: isCurrentPrayer ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = isCurrentPrayer ? 'scale(1.05)' : 'translateY(0)'}
                >
                  {prayer.completed && (
                    <CheckCircleOutlined 
                      style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        right: '8px', 
                        fontSize: '20px', 
                        color: 'white' 
                      }} 
                    />
                  )}
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{prayer.icon}</div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: prayer.completed ? 'white' : isCurrentPrayer ? '#000' : '#0d7377',
                    marginBottom: '4px'
                  }}>
                    {prayer.name}
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: prayer.completed ? 'white' : isCurrentPrayer ? '#000' : '#333'
                  }}>
                    {prayer.time}
                  </div>
                  {isCurrentPrayer && (
                    <div style={{ 
                      fontSize: '11px', 
                      marginTop: '6px', 
                      color: '#d32f2f',
                      fontWeight: 'bold'
                    }}>
                      HOZIR
                    </div>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>

        {/* Namoz statistikasi */}
        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center', 
          background: 'rgba(255,255,255,0.15)',
          padding: '20px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <Progress 
            percent={prayerRate} 
            strokeColor="#4CAF50"
            trailColor="rgba(255,255,255,0.3)"
            style={{ marginBottom: '10px' }}
            strokeWidth={12}
          />
          <p style={{ color: 'white', fontSize: '16px', margin: 0 }}>
            <strong>{completedPrayers}</strong> / {totalPrayers} namoz o'qildi
          </p>
        </div>
      </div>

      {/* Zikr hisoblagichi va Asosiy statistika */}
      <Row gutter={[24, 24]} className="mb-8" style={{ padding: '0 20px' }}>
        {/* Zikr kartochkasi */}
        <Col xs={24} lg={16}>
          <Card 
            className="shadow-2xl rounded-2xl"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none'
            }}
            bodyStyle={{ padding: '32px' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: 'white', fontSize: '24px' }}>📿 Kunlik Zikr</span>
                <Space>
                  <Button 
                    size="small"
                    onClick={() => setIsStatsModalVisible(true)}
                    style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid white'
                    }}
                  >
                    📊 Statistika
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => setIsAddDhikrModalVisible(true)}
                    icon={<PlusOutlined />}
                    style={{ 
                      background: 'white',
                      color: '#667eea',
                      fontWeight: 'bold',
                      border: 'none'
                    }}
                  >
                    Zikr qo'shish
                  </Button>
                </Space>
              </div>
            }
            headStyle={{ background: 'transparent', border: 'none' }}
          >
            {dhikrList.length > 0 ? (
              <div>
                {(() => {
                  const dhikr = dhikrList[currentDhikrIndex];
                  const progress = dhikr.goal > 0 ? Math.round((dhikr.count / dhikr.goal) * 100) : 0;
                  const isCompleted = dhikr.count >= dhikr.goal;
                  
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <div
                        onClick={() => incrementDhikr(dhikr.id)}
                        style={{
                          background: isCompleted ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
                          borderRadius: '50%',
                          width: '200px',
                          height: '200px',
                          margin: '20px auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          border: isCompleted ? '4px solid #4CAF50' : '4px solid rgba(255,255,255,0.5)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
                        }}
                      >
                        {isCompleted && (
                          <CheckCircleOutlined 
                            style={{ 
                              position: 'absolute', 
                              top: '10px', 
                              right: '10px', 
                              fontSize: '32px', 
                              color: '#4CAF50' 
                            }} 
                          />
                        )}
                        {dhikr.icon && (
                          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{dhikr.icon}</div>
                        )}
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>
                          {dhikr.count}
                        </div>
                        <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
                          / {dhikr.goal}
                        </div>
                      </div>
                      <p style={{ 
                        color: 'white', 
                        marginTop: '16px', 
                        fontSize: '24px',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        {dhikr.name}
                      </p>
                      <Progress 
                        percent={progress > 100 ? 100 : progress} 
                        strokeColor="#FFD700"
                        trailColor="rgba(255,255,255,0.3)"
                        strokeWidth={10}
                        showInfo={true}
                        style={{ width: '80%', maxWidth: '400px', margin: '20px auto' }}
                      />
                    </div>
                  );
                })()}
                
                {/* Navigation buttons */}
                {dhikrList.length > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '20px',
                    marginTop: '30px'
                  }}>
                    <Button
                      size="large"
                      icon={<LeftOutlined />}
                      disabled={currentDhikrIndex === 0}
                      onClick={() => setCurrentDhikrIndex(prev => prev - 1)}
                      style={{ 
                        background: currentDhikrIndex === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.5)',
                        fontWeight: 'bold',
                        width: '140px',
                        height: '45px'
                      }}
                    >
                      Oldingi
                    </Button>
                    <span style={{ 
                      color: 'white', 
                      fontSize: '16px', 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: '500'
                    }}>
                      {currentDhikrIndex + 1} / {dhikrList.length}
                    </span>
                    <Button
                      size="large"
                      icon={<RightOutlined />}
                      disabled={currentDhikrIndex === dhikrList.length - 1}
                      onClick={() => setCurrentDhikrIndex(prev => prev + 1)}
                      style={{ 
                        background: currentDhikrIndex === dhikrList.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.5)',
                        fontWeight: 'bold',
                        width: '140px',
                        height: '45px'
                      }}
                    >
                      Keyingi
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
            
            {dhikrList.length === 0 && (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '200px',
                    height: '200px',
                    margin: '20px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    border: '4px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>
                    0
                  </div>
                  <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
                    / 0
                  </div>
                </div>
              </div>
            )}

            <div style={{ 
              marginTop: '30px', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.15)',
              padding: '20px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <Progress 
                percent={dhikrProgress > 100 ? 100 : dhikrProgress} 
                strokeColor="#FFD700"
                trailColor="rgba(255,255,255,0.3)"
                strokeWidth={12}
                style={{ marginBottom: '10px' }}
              />
              <p style={{ color: 'white', fontSize: '16px', margin: 0 }}>
                <strong>{totalDhikrCount}</strong> / {totalDhikrGoal} zikr
              </p>
            </div>
          </Card>
        </Col>

        {/* Vazifalar statistikasi */}
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card 
                className="shadow-xl rounded-xl hover:shadow-2xl transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                  color: 'white',
                  border: 'none'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '16px', fontWeight: '500' }}>📋 Jami Vazifalar</span>}
                  value={totalTasks}
                  prefix={<CalendarOutlined style={{ fontSize: '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card 
                className="shadow-xl rounded-xl hover:shadow-2xl transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                  color: 'white',
                  border: 'none'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '16px', fontWeight: '500' }}>✅ Bajarilgan</span>}
                  value={completedTasks}
                  suffix={`/ ${totalTasks}`}
                  prefix={<TrophyOutlined style={{ fontSize: '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Vazifa qo'shish formasi */}
      <div style={{ padding: '0 20px' }}>
      {/* Vazifalar jadvali */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#0d7377' }}>📋 Kundalik Vazifalar ({tasks.length})</span>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              size="large"
              style={{ 
                background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                border: 'none',
                height: '44px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Yangi Vazifa
            </Button>
          </div>
        }
        className="mb-8 shadow-2xl rounded-2xl"
        bordered={false}
        bodyStyle={{ padding: '32px' }}
      >
        <Table 
          columns={columns} 
          dataSource={tasks} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Hozircha vazifa yo\'q. "+ Yangi Vazifa" tugmasini bosib qo\'shing!' }}
          scroll={{ x: 800 }}
        />
      </Card>
      </div>

      {/* Zikr statistika modali */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>📊 Kunlik Zikr Statistikasi</span>}
        open={isStatsModalVisible}
        onCancel={() => setIsStatsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsStatsModalVisible(false)}>
            Yopish
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            color: 'white',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'white', margin: 0, marginBottom: '12px' }}>Umumiy natija</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
              {totalDhikrCount}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              / {totalDhikrGoal} ({dhikrProgress}%)
            </div>
            <Progress 
              percent={dhikrProgress > 100 ? 100 : dhikrProgress} 
              strokeColor="#FFD700"
              trailColor="rgba(255,255,255,0.3)"
              strokeWidth={12}
              style={{ marginTop: '16px' }}
            />
          </div>

          {dhikrList.map((dhikr) => {
            const progress = dhikr.goal > 0 ? Math.round((dhikr.count / dhikr.goal) * 100) : 0;
            const isCompleted = dhikr.count >= dhikr.goal;

            return (
              <div 
                key={dhikr.id}
                style={{ 
                  background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : '#f5f5f5',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  border: isCompleted ? '2px solid #4CAF50' : '1px solid #e0e0e0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {dhikr.icon && <span style={{ fontSize: '24px' }}>{dhikr.icon}</span>}
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>{dhikr.name}</span>
                    {isCompleted && <CheckCircleOutlined style={{ color: '#4CAF50', fontSize: '20px' }} />}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      size="small"
                      onClick={() => setIsDhikrModalVisible(true)}
                      style={{ 
                        background: '#667eea',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      + Qo'shish
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => deleteDhikr(dhikr.id)}
                    >
                      O'chirish
                    </Button>
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: isCompleted ? '#4CAF50' : '#667eea', marginBottom: '8px' }}>
                  {dhikr.count} / {dhikr.goal}
                </div>
                <Progress 
                  percent={progress > 100 ? 100 : progress} 
                  strokeColor={isCompleted ? '#4CAF50' : '#667eea'}
                  trailColor="#e0e0e0"
                  strokeWidth={10}
                />
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Zikr sonini qo'lda qo'shish modali (statistikadan) */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>📿 Zikr qo'shish</span>}
        open={isDhikrModalVisible}
        onCancel={() => {
          setIsDhikrModalVisible(false);
          dhikrForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={dhikrForm}
          layout="vertical"
          onFinish={handleDhikrSubmit}
        >
          <Form.Item
            label={<span style={{ fontWeight: '500' }}>Qaysi zikrga qo'shmoqchisiz?</span>}
            name="dhikrId"
            rules={[{ required: true, message: 'Iltimos, zikr tanlang!' }]}
          >
            <Select 
              size="large"
              placeholder="Zikr tanlang"
            >
              {dhikrList.map(dhikr => (
                <Option key={dhikr.id} value={dhikr.id}>
                  {dhikr.icon && `${dhikr.icon} `}{dhikr.name} ({dhikr.count}/{dhikr.goal})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: '500' }}>Nechta zikr qo'shmoqchisiz?</span>}
            name="count"
            rules={[{ required: true, message: 'Iltimos, sonni kiriting!' }]}
            initialValue={1}
          >
            <InputNumber 
              placeholder="Masalan: 33" 
              size="large"
              min={1}
              max={10000}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => {
                  setIsDhikrModalVisible(false);
                  dhikrForm.resetFields();
                }}
              >
                Bekor qilish
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Qo'shish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Natijani yangilash modali */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>📝 Natijani Yangilash</span>}
        open={isProgressModalVisible}
        onCancel={() => {
          setIsProgressModalVisible(false);
          progressForm.resetFields();
          setSelectedTask(null);
        }}
        footer={null}
        width={500}
      >
        {selectedTask && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-gray-800">{selectedTask.taskName}</p>
            <p className="text-gray-600 mt-1">🎯 Maqsad: {selectedTask.goalValue} {selectedTask.unit}</p>
            <p className="text-gray-600">✅ Hozirgi: {selectedTask.actualValue} {selectedTask.unit}</p>
          </div>
        )}
        <Form
          form={progressForm}
          layout="vertical"
          onFinish={handleProgressUpdate}
        >
          <Form.Item
            label={<span style={{ fontWeight: '500' }}>Bajarilgan miqdor</span>}
            name="actualValue"
            rules={[{ required: true, message: 'Iltimos, natijani kiriting!' }]}
          >
            <InputNumber 
              placeholder="Necha ko'rsatkichni bajardingiz?" 
              size="large"
              min={0}
              className="w-full"
              addonAfter={selectedTask?.unit}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<CheckOutlined />}
                size="large"
              >
                Saqlash
              </Button>
              <Button 
                size="large"
                onClick={() => {
                  setIsProgressModalVisible(false);
                  progressForm.resetFields();
                  setSelectedTask(null);
                }}
              >
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Yangi zikr qo'shish modali */}
      <Modal
        title={
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📿 Yangi Zikr Qo'shish
          </div>
        }
        open={isAddDhikrModalVisible}
        onCancel={() => {
          setIsAddDhikrModalVisible(false);
          dhikrForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={dhikrForm}
          layout="vertical"
          onFinish={handleAddDhikr}
        >
          <Form.Item
            label={<span style={{ fontWeight: '500', fontSize: '15px' }}>Zikr nomi</span>}
            name="name"
            rules={[{ required: true, message: 'Iltimos, zikr nomini kiriting!' }]}
          >
            <Input 
              placeholder="Masalan: SubhanAllah, La ilaha illallah, yoki Salovat" 
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: '500', fontSize: '15px' }}>Kunlik maqsad (son)</span>}
            name="goal"
            rules={[{ required: true, message: 'Iltimos, maqsadni kiriting!' }]}
            initialValue={33}
          >
            <InputNumber 
              placeholder="Masalan: 33, 100, yoki 1000" 
              size="large"
              min={1}
              max={100000}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: '500', fontSize: '15px' }}>Emoji (ixtiyoriy)</span>}
            name="icon"
            help="Emoji qo'shmasangiz ham bo'ladi, faqat raqamlar ko'rinadi"
          >
            <Input 
              placeholder="📿 🤲 ☝️ 🕋 (ixtiyoriy)" 
              size="large"
              maxLength={2}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button 
                size="large"
                onClick={() => {
                  setIsAddDhikrModalVisible(false);
                  dhikrForm.resetFields();
                }}
                style={{ borderRadius: '8px' }}
              >
                Bekor qilish
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                icon={<PlusOutlined />}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Qo'shish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Yangi vazifa qo'shish modali */}
      <Modal
        title={
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎯 Yangi Vazifa Qo'shish
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={<span style={{ fontWeight: '500', fontSize: '15px' }}>Vazifa nomi</span>}
            name="taskName"
            rules={[{ required: true, message: 'Iltimos, vazifa nomini kiriting!' }]}
          >
            <Input 
              placeholder="Masalan: Kitob o'qish, Sport mashqlari, Dasturlash" 
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ fontWeight: '500', fontSize: '15px' }}>Maqsad (son)</span>}
                name="goalValue"
                rules={[{ required: true, message: 'Iltimos, maqsadni kiriting!' }]}
              >
                <InputNumber 
                  placeholder="Masalan: 50" 
                  size="large"
                  min={1}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ fontWeight: '500', fontSize: '15px' }}>O'lchov birligi</span>}
                name="unit"
                rules={[{ required: true, message: "Iltimos, o'lchov birligini kiriting!" }]}
              >
                <Input 
                  placeholder="bet, daqiqa, km, marta" 
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button 
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
                style={{ borderRadius: '8px' }}
              >
                Bekor qilish
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />}
                size="large"
                style={{ 
                  background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Vazifa Qo'shish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
