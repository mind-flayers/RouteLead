'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

const themeColor = "#FF8C00";
const NAVY_BLUE = '#1A237E';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.signOut(); // Clear any cached session on mount
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    console.log('=== LOGIN FORM SUBMITTED ===');
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Login attempt with:', { email, password: password ? '***' : 'empty' });
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }
    
    try {
      // Sign in with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) {
        console.error('Auth error:', authError);
        
        // Handle specific error cases
        if (authError.message === 'Email not confirmed') {
          setError('Email not confirmed. Please check your email and click the confirmation link, or contact an administrator to verify your account.');
        } else if (authError.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(authError.message);
        }
        
        setLoading(false);
        return;
      }
      
      console.log('Auth successful, user:', data.user?.id);
      
      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      console.log('Profile data:', profile, 'Profile error:', profileError);
      
      if (profileError) {
        console.error('Profile error:', profileError);
        setError('Error fetching user profile.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      if (profile?.role !== 'ADMIN') {
        console.log('User role is not ADMIN:', profile?.role);
        setError('You are not authorized as an admin.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      console.log('Login successful, redirecting to dashboard');
      // Redirect to admin dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

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
          <form style={styles.form} onSubmit={handleLogin}>
            <label style={styles.label}>Username or Email</label>
            <input
              style={styles.input}
              type="text"
              placeholder="admin@routelead.com"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label style={{ ...styles.label, marginTop: 18 }}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                style={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                    <ellipse cx="10" cy="10" rx="7" ry="5" stroke="#BDBDBD" strokeWidth="2" />
                    <circle cx="10" cy="10" r="2" fill="#BDBDBD" />
                  </svg>
                ) : (
                  // Eye closed
                  <svg width="20" height="20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="5" stroke="#BDBDBD" strokeWidth="2" />
                    <line x1="4" y1="16" x2="16" y2="4" stroke="#BDBDBD" strokeWidth="2" />
                  </svg>
                )}
              </span>
            </div>
            <button
              type="submit"
              style={styles.loginBtn}
              disabled={loading || !email || !password}
              onClick={() => console.log('Button clicked!')}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
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
    color: themeColor,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  right: {
    flex: 1,
    background: '#F8F6F4',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 0,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
  rightOverlay: {
    position: 'relative',
    zIndex: 1,
    padding: '0 32px',
    width: '100%',
    textAlign: 'center',
  },
  welcomeTitle: {
    fontWeight: 800,
    fontSize: 26,
    color: NAVY_BLUE,
    marginBottom: 8,
    marginTop: 60,
  },
  welcomeDesc: {
    color: '#7B7B93',
    fontSize: 16,
    marginBottom: 0,
  },
};

export default Login;