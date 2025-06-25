'use client';

import React, { useState } from 'react';

const themeColor = "#FF8C00"; // RouteLead theme orange

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        {/* Left Side */}
        <div style={styles.left}>
          <div style={styles.logoWrap}>
            <img
              src="/images/logo.png"
              alt="RouteLead Logo"
              style={styles.logoImg}
              width={64}
              height={64}
            />
          </div>
          <h2 style={styles.title}>Admin Login</h2>
          <div style={styles.subtitle}>Access your RouteLead admin panel</div>
          <form style={styles.form}>
            <label style={styles.label}>Username or Email</label>
            <input
              style={styles.input}
              type="text"
              placeholder="admin@routelead.com"
              autoComplete="username"
            />
            <label style={{ ...styles.label, marginTop: 18 }}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                style={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                autoComplete="current-password"
              />
              <span
                style={styles.eye}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={0}
                role="button"
                aria-label="Show password"
              >
                {showPassword ? (
                  // Eye open
                  <svg width="20" height="20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="5" stroke="#BDBDBD" strokeWidth="2"/>
                    <circle cx="10" cy="10" r="2" fill="#BDBDBD"/>
                  </svg>
                ) : (
                  // Eye closed
                  <svg width="20" height="20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="5" stroke="#BDBDBD" strokeWidth="2"/>
                    <line x1="4" y1="16" x2="16" y2="4" stroke="#BDBDBD" strokeWidth="2"/>
                  </svg>
                )}
              </span>
            </div>
            <button type="submit" style={styles.loginBtn}>Login</button>
          </form>
          <div style={styles.forgot}>
            <a href="#" style={styles.forgotLink}>Forgot Password?</a>
          </div>
        </div>
        {/* Right Side */}
        <div style={styles.right}>
          <img
            src="/images/login-cover.png"
            alt="RouteLead Login Cover"
            style={styles.coverImg}
          />
          <div style={styles.rightOverlay}>
            <div style={styles.welcomeTitle}>Welcome to <b>RouteLead</b></div>
            <div style={styles.welcomeDesc}>Manage your routes, leads, and operations with ease.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputWidth = 320;

const styles: { [key: string]: React.CSSProperties } = {
  bg: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: 800,
    minHeight: 500,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 24px #0001',
    display: 'flex',
    overflow: 'hidden',
    marginTop: 60,
  },
  left: {
    flex: 1,
    padding: '48px 40px 32px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#fff',
    zIndex: 1,
  },
  logoWrap: {
    marginBottom: 18,
  },
  logoImg: {
    width: 64,
    height: 64,
    objectFit: 'contain',
    display: 'block',
  },
  title: {
    fontWeight: 900,
    fontSize: 32,
    margin: '0 0 8px 0',
    fontFamily: 'Montserrat, Arial, sans-serif',
    textAlign: 'center',
    background: 'none',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
  },
  subtitle: {
    color: '#7B7B93',
    fontSize: 16,
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    width: inputWidth,
    display: 'flex',
    flexDirection: 'column',
    marginTop: 8,
    maxWidth: '100%',
  },
  label: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 6,
    color: '#222',
    fontFamily: 'Montserrat, Arial, sans-serif',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 6,
    border: '1.5px solid #E5E7EB',
    fontSize: 15,
    marginBottom: 2,
    fontFamily: 'Montserrat, Arial, sans-serif',
    background: '#fff',
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  },
  passwordWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eye: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    opacity: 0.7,
  },
  loginBtn: {
    width: '100%',
    background: '#FF8C00',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '12px 0',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 22,
    fontFamily: 'Montserrat, Arial, sans-serif',
    boxShadow: '0 2px 8px #FF8C0022',
    transition: 'background 0.2s',
  },
  forgot: {
    marginTop: 18,
    textAlign: 'center',
  },
  forgotLink: {
    color: '#7B7B93',
    fontSize: 15,
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
  },
  right: {
    flex: 1,
    position: 'relative',
    minHeight: 500,
    background: '#F7F7FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
  rightOverlay: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    background: 'rgba(34,34,34,0.32)',
    padding: '60px 24px 40px 24px',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },
  welcomeTitle: {
    fontWeight: 700,
    fontSize: 26,
    color: '#fff',
    marginTop: 0,
    textAlign: 'center',
    textShadow: '0 2px 8px #0004',
  },
  welcomeDesc: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    maxWidth: 320,
    textShadow: '0 2px 8px #0004',
  },
};

export default Login;