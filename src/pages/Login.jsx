import React, { useState } from 'react';
import { Form, Input, Button, Card, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { email, password, remember } = values;
    
    setLoading(true);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // Save user data to localStorage for quick access
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: result.profile.name,
          role: result.profile.role,
          avatar: result.profile.avatar,
          isLoggedIn: true
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        if (remember) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        message.success('Xush kelibsiz, ' + result.profile.name + '!');
        
        // Navigate based on role
        if (result.profile.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        message.error(result.error || 'Email yoki parol noto\'g\'ri!');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Tizimga kirishda xatolik yuz berdi');
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
            Tizimga kirish
          </h1>
          <p className="text-gray-500 mt-2">Hisobingizga kiring</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Iltimos, emailni kiriting!' },
              { type: 'email', message: 'Noto\'g\'ri email format!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="email@example.com"
            />
          </Form.Item>

          <Form.Item
            label="Parol"
            name="password"
            rules={[{ required: true, message: 'Iltimos, parolni kiriting!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Parolingizni kiriting"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Eslab qolish</Checkbox>
              </Form.Item>
              <Link to="#" style={{ color: '#667eea' }}>
                Parolni unutdingizmi?
              </Link>
            </div>
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
              Kirish
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="text-gray-500">Hisobingiz yo'qmi? </span>
            <Link to="/register" style={{ color: '#0d7377', fontWeight: '600' }}>
              Ro'yxatdan o'tish
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
