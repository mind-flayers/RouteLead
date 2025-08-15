'use client';

import React, { useState, useEffect } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';

const Settings = () => {
  const [supportEmail, setSupportEmail] = useState('support@routelead.com');
  const [supportPhone, setSupportPhone] = useState('+94 71 234 5678');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingSave, setPendingSave] = useState(false);

  // Prefill support phone with admin's phone number
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        const admin = Array.isArray(data) ? data.find((u: any) => String(u.role || '').toUpperCase() === 'ADMIN' && (u.phone_number || u.phoneNumber)) : null;
        if (admin) {
          setSupportPhone(admin.phoneNumber || admin.phone_number);
        }
      } catch {
        // ignore if unavailable
      }
    })();
  }, []);

  const handleReset = () => {
    setSupportEmail('support@routelead.com');
    setSupportPhone('+94 71 234 5678');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPasswordPrompt(true);
    setPendingSave(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPasswordPrompt(false);
    setPendingSave(false);
    setAdminPassword('');
    // Here you would verify the password with backend
    alert('Settings saved!');
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
    setPendingSave(false);
    setAdminPassword('');
  };

  return (
    <div
      style={{
        padding: '0 0 2rem 0',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Add space above heading */}
      <div style={{ height: 32 }} />
      <h1
        style={{
          fontWeight: 800,
          fontSize: 28,
          color: NAVY_BLUE,
          textAlign: 'left',
          marginBottom: 5,
          letterSpacing: '-1px',
        }}
      >
        Application Settings
      </h1>
      <div
        style={{
          color: '#7B7B93',
          fontSize: 16,
          marginBottom: 18,
          maxWidth: 600,
        }}
      >
        Configure core application details and support contact.
      </div>
      {/* Only General Settings Panel */}
      <form
        onSubmit={handleSave}
        style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 24px #0002',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginTop: 0,
          marginBottom: 24,
          maxWidth: '100%',
          transition: 'box-shadow 0.2s',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            gap: 32,
            marginBottom: 32,
            rowGap: 24,
          }}
        >
          <div style={{ flex: 1, minWidth: 260, maxWidth: 420, marginBottom: 24 }}>
            <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: NAVY_BLUE }}>
              Support Contact Number
            </label>
            <input
              type="tel"
              value={supportPhone}
              onChange={e => setSupportPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1.5px solid #E5E7EB',
                fontSize: 15,
                marginBottom: 8,
                background: '#F8F6F4',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              placeholder="Enter support phone (e.g., +94 71 234 5678)"
            />
          </div>
          <div style={{ flex: 1, minWidth: 260, maxWidth: 420, marginBottom: 24 }}>
            <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: NAVY_BLUE }}>
              Support Contact Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={e => setSupportEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1.5px solid #E5E7EB',
                fontSize: 15,
                marginBottom: 8,
                background: '#F8F6F4',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              placeholder="Enter support email"
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: '#fff',
              border: `1.5px solid #E5E7EB`,
              borderRadius: 8,
              padding: '12px 30px',
              fontWeight: 600,
              fontSize: 16,
              color: NAVY_BLUE,
              cursor: 'pointer',
              marginRight: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s, border 0.2s',
            }}
          >
            &#8634; Reset
          </button>
          <button
            type="submit"
            style={{
              background: ROYAL_ORANGE,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 30px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px #FF8C0022',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            <span role="img" aria-label="save">💾</span> Save Changes
          </button>
        </div>
      </form>
      {/* Admin Password Prompt Modal */}
      {showPasswordPrompt && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <form
            onSubmit={handlePasswordSubmit}
            style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 4px 24px #0003',
              padding: '2rem 2.5rem',
              minWidth: 320,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, color: NAVY_BLUE, marginBottom: 6 }}>
              Admin Verification Required
            </div>
            <div style={{ color: '#7B7B93', fontSize: 15, marginBottom: 8, textAlign: 'center' }}>
              Please enter your admin password to confirm changes.
            </div>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="Admin Password"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1.5px solid #E5E7EB',
                fontSize: 15,
                background: '#F8F6F4',
                outline: 'none',
                marginBottom: 8,
              }}
              required
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={handlePasswordCancel}
                style={{
                  background: '#fff',
                  border: `1.5px solid #E5E7EB`,
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: 15,
                  color: NAVY_BLUE,
                  cursor: 'pointer',
                  transition: 'background 0.2s, border 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: ROYAL_ORANGE,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #FF8C0022',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;