// components/Layout.tsx
import React from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1 }}>
        <Navbar />
        <main style={{ padding: '1.5rem' }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
