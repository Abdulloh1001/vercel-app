import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/header';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Routes>
          {/* Login va Register sahifalari navbar/header siz */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Asosiy sahifalar header bilan */}
          <Route path="*" element={
            <>
              <Header />
              <Content className="px-4 py-6 md:px-12 lg:px-24" style={{ background: '#f0f2f5' }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </Content>
            </>
          } />
        </Routes>
      </Layout>
    </Router>
  )
}
