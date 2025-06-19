// components/adminlayout.tsx
import React from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 272, padding: '2rem 2rem 2rem 0' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;