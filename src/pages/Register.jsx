import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const { name, email, password } = values;
    
    // Yangi foydalanuvchini yaratish
    const userData = {
      name: name,
      email: email,
      role: 'user',
      isLoggedIn: true
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Profil ma'lumotlarini ham saqlash
    const userProfile = {
      name: name,
      email: email,
      phone: '+998 90 123 45 67',
      bio: 'Yangi foydalanuvchi',
      avatar: null,
      city: 'Toshkent'
    };
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Ro'yxatdan o'tgan foydalanuvchilarni saqlash (Admin panel uchun)
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Email allaqachon mavjudligini tekshirish
    const existingUser = registeredUsers.find(u => u.email === email);
    if (existingUser) {
      message.error('Bu email allaqachon ro\'yxatdan o\'tgan!');
      return;
    }
    
    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: password,
      registeredDate: new Date().toLocaleDateString('uz-UZ'),
      tasksCount: 0,
      completedCount: 0,
      status: 'active'
    };
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    message.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)' }}>
      <Card 
        className="shadow-2xl rounded-xl"
        style={{ width: '100%', maxWidth: '450px', margin: '20px' }}
      >
        <div className="text-center mb-6">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🕌</div>
          <h1 className="text-3xl font-bold" style={{ color: '#0d7377' }}>
            Ro'yxatdan o'tish
          </h1>
          <p className="text-gray-500 mt-2">Yangi hisob yarating</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Ism va familiya"
            name="name"
            rules={[{ required: true, message: 'Iltimos, ismingizni kiriting!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Ism va familiya"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Iltimos, emailni kiriting!' },
              { type: 'email', message: 'Noto\'g\'ri email format!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="email@example.com"
            />
          </Form.Item>

          <Form.Item
            label="Parol"
            name="password"
            rules={[
              { required: true, message: 'Iltimos, parolni kiriting!' },
              { min: 6, message: 'Parol kamida 6 belgidan iborat bo\'lishi kerak!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parolingizni kiriting"
            />
          </Form.Item>

          <Form.Item
            label="Parolni tasdiqlang"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Iltimos, parolni tasdiqlang!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Parollar mos emas!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parolni qayta kiriting"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              style={{ 
                background: 'linear-gradient(135deg, #0d7377 0%, #14FFEC 100%)',
                border: 'none',
                height: '45px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Ro'yxatdan o'tish
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="text-gray-500">Hisobingiz bormi? </span>
            <Link to="/login" style={{ color: '#0d7377', fontWeight: '600' }}>
              Kirish
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
