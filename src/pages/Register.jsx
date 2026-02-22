import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { name, email, password } = values;
    
    setLoading(true);
    
    try {
      const result = await registerUser(email, password, name);
      
      if (result.success) {
        message.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
        
        // Auto login after registration
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: name,
          role: 'user',
          isLoggedIn: true
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // Check if error is about email confirmation
        if (result.error && result.error.includes('email')) {
          message.warning('Emailingizni tasdiqlash kerak. Iltimos, emailingizni tekshiring.');
        } else {
          message.error(result.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
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
              loading={loading}
              disabled={loading}
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
