import React from 'react'
import { Layout } from 'antd';
import Header from './components/header';
import Navbar from './components/navbar';
import Footer from './components/footer';

const { Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Navbar />
      <Content style={{ 
        padding: '16px',
        '@media (min-width: 768px)': {
          padding: '24px 50px'
        }
      }}>
        <div style={{ 
          background: '#fff', 
          padding: '16px', 
          minHeight: '280px',
          borderRadius: '8px'
        }}>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 32px)' }}>Welcome to My App</h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>This is the main content area.</p>
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}
