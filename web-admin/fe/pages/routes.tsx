'use client';
import React, { useState } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';
const GREEN = '#22C55E';
const LIGHT_GREEN = '#D1FAE5';
const GREY = '#7B7B93';

const RouteDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Dummy data for compliance
  const compliance = {
    percent: 92,
    compliant: 876,
    attention: 45,
    blocked: 12,
  };

  // Dummy data for stat cards
  const totalRoutes = 987;
  const activeDrivers = 56;

  // Dummy route data
  const routes = [
    {
      id: 'RL-101',
      origin: 'New York',
      destination: 'Boston',
      driver: 'Sarah Lee',
      status: 'Active',
      compliance: 'Compliant',
      dispute: 'No',
      postDate: '2024-06-01',
      eta: '2024-06-02',
    },
    {
      id: 'RL-102',
      origin: 'Chicago',
      destination: 'Detroit',
      driver: 'Mike Chen',
      status: 'Attention',
      compliance: 'Needs Attention',
      dispute: 'Yes',
      postDate: '2024-06-03',
      eta: '2024-06-04',
    },
    {
      id: 'RL-103',
      origin: 'San Francisco',
      destination: 'Los Angeles',
      driver: 'Priya Patel',
      status: 'Blocked',
      compliance: 'Blocked',
      dispute: 'No',
      postDate: '2024-06-05',
      eta: '2024-06-06',
    },
    {
      id: 'RL-104',
      origin: 'Dallas',
      destination: 'Houston',
      driver: 'Carlos Ruiz',
      status: 'Active',
      compliance: 'Compliant',
      dispute: 'No',
      postDate: '2024-06-07',
      eta: '2024-06-08',
    },
    {
      id: 'RL-105',
      origin: 'Miami',
      destination: 'Orlando',
      driver: 'Emily Wong',
      status: 'Attention',
      compliance: 'Needs Attention',
      dispute: 'Yes',
      postDate: '2024-06-09',
      eta: '2024-06-10',
    },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: 24, boxSizing: 'border-box' }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, color: NAVY_BLUE, marginBottom: 18 }}>
        Route Management Dashboard
      </h1>
      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: ROYAL_ORANGE,
          color: '#fff',
          borderRadius: 12,
          padding: '1.6rem 2rem',
          boxShadow: '0 2px 12px #FF8C0022',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Total Routes</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{totalRoutes}</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>+10% from last month</div>
          <div style={{ position: 'absolute', top: 18, right: 18, opacity: 0.15, fontSize: 54 }}>🛣️</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: LIGHT_GREEN,
          color: NAVY_BLUE,
          borderRadius: 12,
          padding: '1.6rem 2rem',
          boxShadow: '0 2px 12px #22C55E22',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Active Drivers</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{activeDrivers}</div>
          <div style={{ fontSize: 15, color: GREEN, marginBottom: 8 }}>+5% from last week</div>
          <a href="#" style={{ color: ROYAL_ORANGE, fontWeight: 700, fontSize: 15, textDecoration: 'none', marginTop: 8 }}>
            View All Routes <span style={{ fontSize: 18, verticalAlign: 'middle' }}>↗</span>
          </a>
        </div>
      </div>
      {/* Compliance Overview */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: 32,
        marginBottom: 28,
        display: 'flex',
        gap: 36,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: NAVY_BLUE, marginBottom: 4 }}>
            Route Compliance Overview
          </div>
          <div style={{ color: GREY, fontSize: 15, marginBottom: 18 }}>
            Overall compliance status of all active routes.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="#F3F4F6"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke={ROYAL_ORANGE}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - compliance.percent / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontWeight: 800, fontSize: 32, color: ROYAL_ORANGE }}>{compliance.percent}%</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: GREY }}>Compliant</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16 }}>
              <div style={{ color: GREEN, fontWeight: 600 }}>
                <span style={{ fontSize: 22, verticalAlign: 'middle' }}>●</span> {compliance.compliant} Routes Fully Compliant
              </div>
              <div style={{ color: ROYAL_ORANGE, fontWeight: 600 }}>
                <span style={{ fontSize: 22, verticalAlign: 'middle' }}>●</span> {compliance.attention} Routes Need Attention
              </div>
              <div style={{ color: '#EF4444', fontWeight: 600 }}>
                <span style={{ fontSize: 22, verticalAlign: 'middle' }}>●</span> {compliance.blocked} Routes Blocked
              </div>
            </div>
          </div>
          <button
            style={{
              marginTop: 28,
              background: '#F3F4F6',
              color: NAVY_BLUE,
              border: 'none',
              borderRadius: 8,
              padding: '10px 26px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px #0001',
            }}
          >
            Manage Compliance <span style={{ fontSize: 18 }}>↗</span>
          </button>
        </div>
      </div>
      {/* Route Overview Table */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: 28,
        marginBottom: 24,
        marginTop: 0,
      }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: NAVY_BLUE, marginBottom: 2 }}>
          Route Overview
        </div>
        <div style={{ color: GREY, fontSize: 15, marginBottom: 18 }}>
          Monitor and manage all active and historical routes.
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search routes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.7rem 1.2rem',
              borderRadius: 10,
              border: `1px solid #E5E7EB`,
              background: '#F8F6F4',
              fontSize: 15,
              fontFamily: 'Montserrat, sans-serif',
              outline: 'none',
              minWidth: 180,
              maxWidth: 260,
            }}
          />
          <select
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '0.5rem 1.2rem',
              background: '#fff',
              fontSize: 15,
              fontFamily: 'Montserrat, sans-serif',
              color: NAVY_BLUE,
              outline: 'none',
              minWidth: 120,
              maxWidth: 180,
            }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Compliant">Compliant</option>
            <option value="Attention">Needs Attention</option>
            <option value="Blocked">Blocked</option>
          </select>
          <button
            style={{
              background: '#fff',
              border: `1px solid #E5E7EB`,
              borderRadius: 8,
              width: 36,
              height: 36,
              marginLeft: 4,
              cursor: 'pointer',
              fontSize: 18,
              color: NAVY_BLUE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Refresh"
            onClick={() => window.location.reload()}
          >⟳</button>
        </div>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            minWidth: 900,
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontFamily: 'Montserrat, sans-serif',
            marginBottom: 8,
          }}>
            <thead>
              <tr style={{ color: GREY, fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
                <th style={thStyle}>Route ID</th>
                <th style={thStyle}>Origin</th>
                <th style={thStyle}>Destination</th>
                <th style={thStyle}>Driver</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Compliance</th>
                <th style={thStyle}>Dispute</th>
                <th style={thStyle}>Post Date</th>
                <th style={thStyle}>ETA</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes
                .filter(route =>
                  (statusFilter === 'All' || route.compliance === statusFilter || route.status === statusFilter) &&
                  (
                    route.id.toLowerCase().includes(search.toLowerCase()) ||
                    route.origin.toLowerCase().includes(search.toLowerCase()) ||
                    route.destination.toLowerCase().includes(search.toLowerCase()) ||
                    route.driver.toLowerCase().includes(search.toLowerCase())
                  )
                )
                .map(route => (
                  <tr key={route.id} style={{ borderBottom: '1px solid #F3EDE7', fontSize: 15 }}>
                    <td style={tdStyle}>{route.id}</td>
                    <td style={tdStyle}>{route.origin}</td>
                    <td style={tdStyle}>{route.destination}</td>
                    <td style={tdStyle}>{route.driver}</td>
                    <td style={tdStyle}>
                      <span style={{
                        color:
                          route.status === 'Active'
                            ? GREEN
                            : route.status === 'Attention'
                            ? ROYAL_ORANGE
                            : '#EF4444',
                        fontWeight: 700,
                      }}>
                        {route.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        color:
                          route.compliance === 'Compliant'
                            ? GREEN
                            : route.compliance === 'Needs Attention'
                            ? ROYAL_ORANGE
                            : '#EF4444',
                        fontWeight: 700,
                      }}>
                        {route.compliance}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {route.dispute === 'Yes' ? (
                        <span style={{ color: ROYAL_ORANGE, fontWeight: 700 }}>Yes</span>
                      ) : (
                        <span style={{ color: GREEN, fontWeight: 700 }}>No</span>
                      )}
                    </td>
                    <td style={tdStyle}>{route.postDate}</td>
                    <td style={tdStyle}>{route.eta}</td>
                    <td style={tdStyle}>
                      <button
                        style={{
                          background: '#fff',
                          border: `1px solid #E5E7EB`,
                          borderRadius: 6,
                          padding: '4px 12px',
                          fontWeight: 600,
                          fontSize: 14,
                          color: NAVY_BLUE,
                          cursor: 'pointer',
                          marginRight: 4,
                        }}
                        title="View"
                      >
                        View
                      </button>
                      <button
                        style={{
                          background: '#fff',
                          border: `1px solid #E5E7EB`,
                          borderRadius: 6,
                          padding: '4px 12px',
                          fontWeight: 600,
                          fontSize: 14,
                          color: ROYAL_ORANGE,
                          cursor: 'pointer',
                        }}
                        title="Edit"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  fontWeight: 700,
  fontSize: 15,
  background: 'none',
  borderBottom: '2px solid #F3EDE7',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 8px',
  fontWeight: 500,
  fontSize: 15,
  background: 'none',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

export default RouteDashboard;