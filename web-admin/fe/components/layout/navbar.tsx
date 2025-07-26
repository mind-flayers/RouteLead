// Navbar.tsx
import React from 'react';

const Navbar: React.FC = () => {
  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      // Add logout logic here
      console.log('Logout confirmed');
      // You can redirect to login page or clear session
      // window.location.href = '/login';
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <img
          src="/images/logo.png"
          alt="RouteLead Logo"
          style={styles.logoImg}
          width={36}
          height={36}
        />
        <span style={styles.title}>RouteLead</span>
      </div>
      <div style={styles.center}>
        <input
          type="text"
          placeholder="Search"
          style={styles.searchInput}
        />
      </div>
      <div style={styles.right}>
        {/* Admin icon instead of image */}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#FF6A00',
          color: '#fff',
          fontWeight: 700,
          fontSize: 22,
          border: '2px solid #F3EDE7',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" fill="white"/>
            <rect x="4" y="16" width="16" height="4" rx="2" fill="white"/>
          </svg>
        </span>
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    width: '100%',
    left: 0,
    top: 0,
    height: 64,
    background: '#fff',
    boxShadow: '0 2px 16px #0001',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2.5rem',
    margin: 0,
    position: 'fixed',
    zIndex: 100,
    boxSizing: 'border-box',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 36,
    height: 36,
    objectFit: 'contain',
    display: 'block',
  },
  title: {
    fontWeight: 700,
    fontSize: 20,
    color: '#222',
    fontFamily: 'Montserrat, sans-serif',
  },
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  searchInput: {
    width: 260,
    padding: '0.6rem 1.2rem',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    background: '#F8F6F4',
    fontSize: 16,
    fontFamily: 'Montserrat, sans-serif',
    outline: 'none',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
  },
  bell: {
    fontSize: 22,
    color: '#FF8C00',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    background: '#EF4444',
    color: '#fff',
    borderRadius: '50%',
    width: 18,
    height: 18,
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #F3EDE7',
  },
  logoutButton: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: 14,
    color: '#EF4444',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'Montserrat, sans-serif',
  },
};

export default Navbar;