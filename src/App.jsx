import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/header';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Ramazon from './pages/Ramazon';
import BaxtiyorOila from './pages/BaxtiyorOila';
import Login from './pages/Login';
import Register from './pages/Register';
import { supabase } from './lib/supabaseClient';

const { Content } = Layout;

export default function App() {
  // Check and sync Supabase session on app load
  useEffect(() => {
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          // Update localStorage with database data
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: profile.name,
            role: profile.role,
            avatar: profile.avatar,
            selected_city: profile.selected_city,
            isLoggedIn: true,
            user: session.user
          };
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      } else {
        // No session - clear localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          if (user.isLoggedIn) {
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }
        }
      }
    };
    
    syncSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: profile.name,
            role: profile.role,
            avatar: profile.avatar,
            selected_city: profile.selected_city,
            isLoggedIn: true,
            user: session.user
          };
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('currentUser');
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
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
                  <Route path="/ramazon" element={<Ramazon />} />
                  <Route path="/baxtiyor-oila" element={<BaxtiyorOila />} />
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
