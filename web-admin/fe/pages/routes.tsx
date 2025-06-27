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

  const statusColors: { [key: string]: string } = {
	Active: '#22C55E',
	Pending: ROYAL_ORANGE,
	Suspended: '#A1A1AA',
	Blocked: '#EF4444',
};

// Dummy route data (Sri Lankan version)
const routes = [
  {
    id: 'SL-001',
    origin: 'Colombo',
    destination: 'Kandy',
    driver: 'Nimal Perera',
    status: 'Active',
    compliance: 'Compliant',
    dispute: 'No',
    postDate: '2024-06-01',
    eta: '2024-06-01',
  },
  {
    id: 'SL-002',
    origin: 'Galle',
    destination: 'Matara',
    driver: 'Kamal Silva',
    status: 'Pending',
    compliance: 'Needs Attention',
    dispute: 'Yes',
    postDate: '2024-06-03',
    eta: '2024-06-03',
  },
  {
    id: 'SL-003',
    origin: 'Jaffna',
    destination: 'Anuradhapura',
    driver: 'Suresh Kumar',
    status: 'Blocked',
    compliance: 'Blocked',
    dispute: 'No',
    postDate: '2024-06-05',
    eta: '2024-06-06',
  },
  {
    id: 'SL-004',
    origin: 'Negombo',
    destination: 'Kurunegala',
    driver: 'Thilina Jayasuriya',
    status: 'Active',
    compliance: 'Compliant',
    dispute: 'No',
    postDate: '2024-06-07',
    eta: '2024-06-07',
  },
  {
    id: 'SL-005',
    origin: 'Badulla',
    destination: 'Nuwara Eliya',
    driver: 'Ruwan Fernando',
    status: 'Pending',
    compliance: 'Needs Attention',
    dispute: 'Yes',
    postDate: '2024-06-09',
    eta: '2024-06-09',
  },
];

  const labelButtonStyle = (color: string, active: boolean = false): React.CSSProperties => ({
	background: color + '22',
	color,
	borderRadius: 8,
	padding: '4px 0',
	width: 110,
	display: 'inline-block',
	textAlign: 'center',
	fontWeight: 600,
	fontSize: 14,
	cursor: 'pointer',
	userSelect: 'none',
	border: active ? `2px solid ${color}` : '2px solid transparent',
	transition: 'background 0.2s, color 0.2s, border 0.2s',
	margin: '0 auto',
});

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
};

const cellStyle: React.CSSProperties = {
	...tdStyle,
	padding: '14px 8px',
	verticalAlign: 'middle',
};

const rowStyle: React.CSSProperties = {
	borderBottom: '1px solid #F3EDE7',
	fontSize: 15,
	height: 56,
};

const filterSelectStyle: React.CSSProperties = {
	border: `1px solid ${NAVY_BLUE}22`,
	borderRadius: 10,
	padding: '0.5rem 1.2rem',
	background: '#fff',
	fontSize: 15,
	fontFamily: 'Montserrat, sans-serif',
	color: NAVY_BLUE,
	outline: 'none',
	appearance: 'none',
	WebkitAppearance: 'none',
	MozAppearance: 'none',
	cursor: 'pointer',
};

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      {/* Add space above heading */}
      <div style={{ height: 32 }} />
      <h1
        style={{
          fontWeight: 800,
          fontSize: 28,
          color: NAVY_BLUE,
          textAlign: 'left',
          marginBottom: 5
        }}
      >
        Route Management Dashboard
      </h1>
      <div style={{ color: '#7B7B93', fontSize: 16, marginBottom: 18 }}>
        Monitor and manage all active and historical routes.
      </div>
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
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>5</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>+2% from last month</div>
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
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>2</div>
          <div style={{ fontSize: 15, color: GREEN, marginBottom: 8 }}>+5% from last week</div>
        </div>
      </div>
      {/* Route Overview Table */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: '1.5rem 1.5rem 1rem 1.5rem',
        marginBottom: 16,
        width: '100%',
        overflowX: 'auto',
      }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            marginBottom: 18,
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', gap: 16, flex: 1, minWidth: 0, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search routes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: '0.7rem 1.2rem',
                borderRadius: 10,
                border: `1px solid ${NAVY_BLUE}22`,
                background: '#F8F6F4',
                fontSize: 15,
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none',
                minWidth: 180,
                maxWidth: 320,
              }}
            />
            <select style={filterSelectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option value="Compliant">Compliant</option>
              <option value="Attention">Needs Attention</option>
              <option value="Blocked">Blocked</option>
            </select>
            <button
              style={{
                background: '#fff',
                border: `1px solid ${NAVY_BLUE}22`,
                borderRadius: 8,
                padding: '0 18px',
                fontWeight: 600,
                fontSize: 15,
                height: 40,
                color: NAVY_BLUE,
                cursor: 'pointer',
                minWidth: 120,
              }}
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
              }}
            >
              Reset Filters
            </button>
          </div>
          <button style={{
            background: NAVY_BLUE,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0 18px',
            fontWeight: 600,
            fontSize: 15,
            height: 40,
            cursor: 'pointer',
            minWidth: 120,
          }}>
            + Add New Route
          </button>
        </div>
        <table style={{
          width: '100%',
          minWidth: 900,
          borderCollapse: 'separate',
          borderSpacing: 0,
          fontFamily: 'Montserrat, sans-serif'
        }}>
          <thead>
            <tr style={{ color: '#7B7B93', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
              <th style={thStyle}>Route ID</th>
              <th style={thStyle}>Origin</th>
              <th style={thStyle}>Destination</th>
              <th style={thStyle}>Driver</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Compliance</th>
              <th style={thStyle}>Post Date</th>
              <th style={thStyle}>ETA</th>
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
              .map((route) => (
                <tr key={route.id} style={rowStyle}>
                  <td style={cellStyle}>{route.id}</td>
                  <td style={cellStyle}>{route.origin}</td>
                  <td style={cellStyle}>{route.destination}</td>
                  <td style={{ ...cellStyle, fontWeight: 600 }}>{route.driver}</td>
                  <td style={cellStyle}>
                    <span style={labelButtonStyle(statusColors[route.status])}>
                      {route.status}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <span style={labelButtonStyle(
                      route.compliance === 'Compliant' ? NAVY_BLUE :
                      route.compliance === 'Needs Attention' ? ROYAL_ORANGE : '#EF4444'
                    )}>
                      {route.compliance}
                    </span>
                  </td>
                  <td style={cellStyle}>{route.postDate}</td>
                  <td style={cellStyle}>{route.eta}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
          color: '#7B7B93',
          fontSize: 14,
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span>Showing 1 - {routes.length} of {routes.length} routes</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              background: '#fff',
              border: `1px solid ${NAVY_BLUE}22`,
              borderRadius: 8,
              padding: '4px 18px',
              fontWeight: 600,
              fontSize: 15,
              color: NAVY_BLUE,
              marginLeft: 8,
              cursor: 'pointer',
            }}>Previous</button>
            <button style={{
              background: '#fff',
              border: `1px solid ${NAVY_BLUE}22`,
              borderRadius: 8,
              padding: '4px 18px',
              fontWeight: 600,
              fontSize: 15,
              color: NAVY_BLUE,
              marginLeft: 8,
              cursor: 'pointer',
            }}>Next</button>
          </div>
        </div>
        {/* Responsive Table Notice */}
        <div style={{
          display: 'none',
          marginTop: 12,
          color: '#EF4444',
          fontSize: 14,
        }} className="responsive-table-notice">
          Scroll horizontally to view more columns.
        </div>
        <style>{`
          @media (max-width: 900px) {
            .responsive-table-notice {
              display: block !important;
            }
            table {
              min-width: 600px !important;
            }
          }
          @media (max-width: 700px) {
            .responsive-table-notice {
              display: block !important;
            }
            table {
              min-width: 500px !important;
            }
            th, td {
              font-size: 13px !important;
              padding: 8px 4px !important;
            }
          }
          @media (max-width: 600px) {
            .responsive-table-notice {
              display: block !important;
            }
            table {
              min-width: 400px !important;
            }
            th, td {
              font-size: 12px !important;
              padding: 6px 2px !important;
            }
          }
          @media (max-width: 500px) {
            .responsive-table-notice {
              display: block !important;
            }
            table {
              min-width: 350px !important;
            }
            th, td {
              font-size: 11px !important;
              padding: 4px 1px !important;
            }
          }
          select {
            transition: border 0.2s, box-shadow 0.2s;
          }
          select:focus {
            border-color: ${NAVY_BLUE};
            box-shadow: 0 0 0 2px ${NAVY_BLUE}22;
          }
          select option {
            background: #fff;
            color: #1A237E;
            font-size: 15px;
            font-family: Montserrat, sans-serif;
            padding: 8px 12px;
          }
          select option:checked, select option:focus {
            background: #FF8C0022;
            color: #FF8C00;
          }
        `}</style>
      </div>
    </div>
  );
};

export default RouteDashboard;