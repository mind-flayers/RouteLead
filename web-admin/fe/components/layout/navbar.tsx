// Navbar.tsx
import React from 'react';

const Navbar: React.FC = () => {
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
        <span style={styles.bell}>🔔</span>
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="User"
          style={styles.avatar}
        />
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    width: '100vw',
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
  bell: {
    fontSize: 22,
    color: '#FF8C00', // Royal orange, or use '#1A237E' for navy blue
    cursor: 'pointer',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #F3EDE7',
  },
};

export default Navbar;