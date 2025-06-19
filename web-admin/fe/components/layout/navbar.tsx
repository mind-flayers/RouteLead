// Navbar.tsx
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <span style={styles.flagIcon}>🏴</span>
        <span style={styles.title}>Swift Logistics</span>
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
    width: '100%',
    height: 64,
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 2px 16px #0001',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2.5rem',
    margin: 12,
    marginLeft: 272, // sidebar width + margin
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  flagIcon: {
    fontSize: 24,
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
    color: '#6B7280',
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