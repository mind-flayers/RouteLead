'use client';
import React, { useState, useEffect } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';
const GREEN = '#22C55E';
const LIGHT_GREEN = '#D1FAE5';
const GREY = '#7B7B93';

const statusColors: { [key: string]: string } = {
  OPEN: GREEN,
  PENDING: ROYAL_ORANGE,
  SUSPENDED: GREY,
  ACTIVE: GREEN,
};

const RouteDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // Removed date filters per requirement
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutes() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/routes');
        const data = await res.json();
        setRoutes(data.routes || []);
      } catch (err) {
        setRoutes([]);
      }
      setLoading(false);
    }
    fetchRoutes();
  }, []);

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

  // Constrain wide text columns to avoid excessive gaps between columns
  const originCellStyle: React.CSSProperties = {
    ...cellStyle,
    maxWidth: 260,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
  const destinationCellStyle: React.CSSProperties = {
    ...cellStyle,
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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

  // Filtered routes based on filters
  const filteredRoutes = routes.filter((route) => {
    const matchesStatus = statusFilter === 'All' || route.status === statusFilter;
    const matchesOrigin = originFilter.trim() === '' || (route.origin_name || route.origin || '').toLowerCase().includes(originFilter.toLowerCase());
    const matchesDestination = destinationFilter.trim() === '' || (route.destination_name || route.destination || '').toLowerCase().includes(destinationFilter.toLowerCase());
    const matchesDriver = driverFilter.trim() === '' || (`${route.driver?.first_name || ''} ${route.driver?.last_name || ''}`.trim()).toLowerCase().includes(driverFilter.toLowerCase());

    return matchesStatus && matchesOrigin && matchesDestination && matchesDriver;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, originFilter, destinationFilter, driverFilter, routes.length]);

  const totalFiltered = filteredRoutes.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndexExclusive = Math.min(startIndex + pageSize, totalFiltered);
  const pageRoutes = filteredRoutes.slice(startIndex, endIndexExclusive);

  const openRoutes = routes.filter(r => r.status === 'OPEN').length;
  const pendingRoutes = routes.filter(r => r.status === 'PENDING').length;
  // Add more as needed

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
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
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{routes.length}</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>+2% from last month</div>
          <div style={{ position: 'absolute', top: 18, right: 18, opacity: 0.15, fontSize: 54 }}>🛣️</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: GREEN,
          color: NAVY_BLUE,
          borderRadius: 12,
          padding: '1.6rem 2rem',
          boxShadow: '0 2px 12px #22C55E22',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Open Routes</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{openRoutes}</div>
          <div style={{ fontSize: 15, color: GREEN, marginBottom: 8 }}>Open for bidding</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: ROYAL_ORANGE,
          color: '#fff',
          borderRadius: 12,
          padding: '1.6rem 2rem',
          boxShadow: '0 2px 12px #FF8C0022',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Pending Routes</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{pendingRoutes}</div>
          <div style={{ fontSize: 15, color: ROYAL_ORANGE, marginBottom: 8 }}>Awaiting approval</div>
        </div>
        {/* Removed Blocked Routes card per requirement */}
      </div>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: '1.5rem 1.5rem 1rem 1.5rem',
        marginBottom: 16,
        width: '100%',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Global search removed per requirement */}
          <input
            type="text"
            placeholder="Filter origin..."
            value={originFilter}
            onChange={e => setOriginFilter(e.target.value)}
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
          <input
            type="text"
            placeholder="Filter destination..."
            value={destinationFilter}
            onChange={e => setDestinationFilter(e.target.value)}
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
          <input
            type="text"
            placeholder="Filter driver name..."
            value={driverFilter}
            onChange={e => setDriverFilter(e.target.value)}
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
            <option value="All">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="ACTIVE">Active</option>
          </select>
          {/* Date filters removed per requirement */}
        </div>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>Loading routes...</div>
        ) : (
          <table style={{
            width: '100%',
            minWidth: 700,
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontFamily: 'Montserrat, sans-serif',
            tableLayout: 'fixed'
          }}>
            <thead>
              <tr style={{ color: '#7B7B93', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
                <th style={{ ...thStyle, width: '18%' }}>Driver Name</th>
                <th style={{ ...thStyle, width: '28%' }}>Origin</th>
                <th style={{ ...thStyle, width: '34%' }}>Destination</th>
                <th style={{ ...thStyle, width: '12%' }}>Status</th>
                <th style={{ ...thStyle, width: '8%' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {pageRoutes.map((route) => (
                <tr key={route.id} style={rowStyle}>
                  <td style={cellStyle}>
                    {route.driver ? `${route.driver?.first_name} ${route.driver?.last_name}` : ''}
                  </td>
                  <td style={originCellStyle}>{route.origin_name || route.origin || ''}</td>
                  <td style={destinationCellStyle}>{route.destination_name || route.destination || ''}</td>
                  <td style={cellStyle}>
                    <span style={labelButtonStyle(statusColors[route.status] || GREY)}>{route.status}</span>
                  </td>
                  <td style={cellStyle}>{route.created_at ? new Date(route.created_at).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
          <span>Showing {totalFiltered === 0 ? 0 : startIndex + 1} - {Math.min(endIndexExclusive, totalFiltered)} of {totalFiltered} routes</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{ background: '#fff', border: `1px solid ${NAVY_BLUE}22`, borderRadius: 8, padding: '4px 18px', fontWeight: 600, fontSize: 15, color: NAVY_BLUE, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              style={{ background: '#fff', border: `1px solid ${NAVY_BLUE}22`, borderRadius: 8, padding: '4px 18px', fontWeight: 600, fontSize: 15, color: NAVY_BLUE, opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDashboard;