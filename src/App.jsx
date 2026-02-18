import React, { useState, useEffect } from 'react'
import { Layout, Form, Input, Select, Button, Card, Table, Space, Tag, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Header from './components/header';
import Navbar from './components/navbar';
import Footer from './components/footer';

const { Content } = Layout;
const { Option } = Select;

export default function App() {
  const [form] = Form.useForm();
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('items');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('uz-UZ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('uz-UZ', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const handleSubmit = (values) => {
    const dateTime = getCurrentDateTime();
    const newItem = {
      id: Date.now(),
      name: values.name,
      type: values.type,
      date: dateTime.date,
      time: dateTime.time,
    };
    
    setItems([newItem, ...items]);
    message.success('Muvaffaqiyatli qo\'shildi!');
    form.resetFields();
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
    message.info('O\'chirildi');
  };

  const columns = [
    {
      title: 'Nomi',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Turi',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          'Mahsulot': 'blue',
          'Xizmat': 'green',
          'Loyiha': 'orange',
          'Vazifa': 'purple',
          'Boshqa': 'default',
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Sana',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Vaqt',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Amallar',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          O'chirish
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Navbar />
      <Content className="px-4 py-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <Card 
            title="Yangi Element Qo'shish" 
            className="mb-6 shadow-lg rounded-lg"
            bordered={false}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Nomi"
                  name="name"
                  rules={[{ required: true, message: 'Iltimos, nom kiriting!' }]}
                >
                  <Input 
                    placeholder="Nom kiriting" 
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label="Turi"
                  name="type"
                  rules={[{ required: true, message: 'Iltimos, turini tanlang!' }]}
                >
                  <Select 
                    placeholder="Turini tanlang" 
                    size="large"
                    className="rounded-lg"
                  >
                    <Option value="Mahsulot">Mahsulot</Option>
                    <Option value="Xizmat">Xizmat</Option>
                    <Option value="Loyiha">Loyiha</Option>
                    <Option value="Vazifa">Vazifa</Option>
                    <Option value="Boshqa">Boshqa</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlusOutlined />}
                  size="large"
                  className="w-full md:w-auto"
                >
                  Qo'shish
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card 
            title={`Ro'yxat (${items.length})`}
            className="shadow-lg rounded-lg"
            bordered={false}
          >
            <Table 
              columns={columns} 
              dataSource={items} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Ma\'lumot yo\'q' }}
              scroll={{ x: 800 }}
            />
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}
