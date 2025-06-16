// Sidebar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: <svg width="20" height="20" fill="none"><rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2"/></svg> },
  { href: '/users', label: 'Users', icon: <svg width="20" height="20" fill="none"><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M3 17c0-2.21 3.134-4 7-4s7 1.79 7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { href: '/routes', label: 'Routes', icon: <svg width="20" height="20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2"/></svg> },
  { href: '/disputes', label: 'Disputes', icon: <svg width="20" height="20" fill="none"><rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
  { href: '/analytics', label: 'Analytics', icon: <svg width="20" height="20" fill="none"><rect x="4" y="12" width="2" height="4" rx="1" fill="currentColor"/><rect x="9" y="8" width="2" height="8" rx="1" fill="currentColor"/><rect x="14" y="4" width="2" height="12" rx="1" fill="currentColor"/></svg> },
  { href: '/settings', label: 'Settings', icon: <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" strokeWidth="2"/></svg> },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoSection}>
        <div style={styles.logoCircle}>SL</div>
        <span style={styles.logoText}>Swift Logistics</span>
      </div>
      <nav style={{ flex: 1 }}>
        <ul style={styles.navList}>
          {navLinks.map(link => {
            const isActive = router.pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} style={{
                  ...styles.link,
                  ...(isActive ? styles.activeLink : {})
                }}>
                  <span style={{
                    ...styles.icon,
                    color: isActive ? '#222' : '#6B7280'
                  }}>{link.icon}</span>
                  <span style={{
                    ...styles.label,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#222' : '#6B7280'
                  }}>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div style={styles.bottomSection}>
        <button style={styles.newOrderBtn}>New Order</button>
        <div style={styles.helpRow}>
          <div style={styles.avatar}>N</div>
          <Link href="/help" style={styles.helpLink}>
            <span style={{ marginRight: 6 }}>?</span>Help
          </Link>
        </div>
      </div>
    </aside>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: 260,
    background: '#fff',
    height: '100vh',
    borderRadius: 20,
    boxShadow: '0 2px 16px #0001',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 0 1.5rem 0',
    margin: 12,
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 101,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 32,
    marginBottom: 32,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#183D2B',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 1,
  },
  logoText: {
    fontWeight: 700,
    fontSize: 18,
    color: '#222',
    fontFamily: 'Montserrat, sans-serif',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0.85rem 2rem',
    borderRadius: 12,
    textDecoration: 'none',
    color: '#6B7280',
    fontWeight: 500,
    fontSize: 16,
    transition: 'background 0.2s, color 0.2s',
    marginBottom: 4,
  },
  activeLink: {
    background: '#F3EDE7',
    color: '#222',
    fontWeight: 700,
  },
  icon: {
    minWidth: 22,
    display: 'flex',
    alignItems: 'center',
    fontSize: 20,
  },
  label: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  bottomSection: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '0 2rem',
  },
  newOrderBtn: {
    width: '100%',
    background: '#FF6A00',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '0.9rem 0',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    marginBottom: 8,
    fontFamily: 'Montserrat, sans-serif',
  },
  helpRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#222',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
    marginRight: 6,
  },
  helpLink: {
    color: '#6B7280',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: 'Montserrat, sans-serif',
  },
};

export default Sidebar;