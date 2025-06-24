'use client';

import React, { useState } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';

const tabs = [
  'General',
  'User Accounts',
  'Notifications',
  'Security',
  'Integrations',
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [appName, setAppName] = useState('RouteLead Dashboard');
  const [supportEmail, setSupportEmail] = useState('support@routelead.com');

  const handleReset = () => {
    setAppName('RouteLead Dashboard');
    setSupportEmail('support@routelead.com');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic here
    alert('Settings saved!');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '2vw 4vw',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          fontWeight: 800,
          fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
          color: NAVY_BLUE,
          marginBottom: 6,
          letterSpacing: '-1px',
        }}
      >
        Application Settings
      </h1>
      <div
        style={{
          color: '#7B7B93',
          fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
          marginBottom: 24,
          maxWidth: 600,
        }}
      >
        Manage and configure various aspects of your RouteLead Dashboard.
      </div>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: 24,
          overflowX: 'auto',
          borderBottom: '2px solid #F3F4F6',
        }}
      >
        {tabs.map(tab => (
          <div
            key={tab}
            style={{
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: 16,
              color: activeTab === tab ? NAVY_BLUE : '#7B7B93',
              background: activeTab === tab ? '#fff' : '#F3F4F6',
              borderRadius: activeTab === tab ? '12px 12px 0 0' : '12px 12px 0 0',
              borderBottom: activeTab === tab ? `3px solid ${NAVY_BLUE}` : '3px solid transparent',
              cursor: 'pointer',
              marginRight: 2,
              transition: 'color 0.2s, background 0.2s, border-bottom 0.2s',
              minWidth: 120,
              textAlign: 'center',
              boxShadow: activeTab === tab ? '0 2px 8px #0001' : undefined,
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      {/* General Settings Panel */}
      {activeTab === 'General' && (
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
              fontWeight: 700,
              fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
              color: NAVY_BLUE,
              marginBottom: 6,
              letterSpacing: '-0.5px',
            }}
          >
            General Application Settings
          </div>
          <div
            style={{
              color: '#7B7B93',
              fontSize: 15,
              marginBottom: 28,
              maxWidth: 500,
            }}
          >
            Configure core application details and support contact.
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              marginBottom: 32,
              rowGap: 24,
            }}
          >
            <div style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: NAVY_BLUE }}>
                Application Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={e => setAppName(e.target.value)}
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
                placeholder="Enter application name"
              />
            </div>
            <div style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
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
      )}
    </div>
  );
};

export default Settings;