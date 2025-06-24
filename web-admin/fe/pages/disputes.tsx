import React, { useState } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';

const disputes = [
  {
    id: 'D001',
    claimant: 'Alice Johnson',
    respondent: 'Bob Williams',
    type: 'Route Deviation',
    status: 'Open',
    date: '2023-10-26',
    description: 'Customer claims the driver took an unauthorized detour, resulting in significant delay and additional mileage charges.',
    claimantRole: 'Customer',
    respondentRole: 'Driver',
    claimantAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    respondentAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    valueImpact: 20,
  },
  {
    id: 'D002',
    claimant: 'Charlie Brown',
    respondent: 'Diana Prince',
    type: 'Service Quality',
    status: 'Pending',
    date: '2023-10-25',
    description: '',
    claimantRole: 'Driver',
    respondentRole: 'Customer',
    claimantAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    respondentAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    valueImpact: 5,
  },
  {
    id: 'D003',
    claimant: 'Eve Adams',
    respondent: 'Frank White',
    type: 'Payment Issue',
    status: 'Closed',
    date: '2023-10-24',
    description: '',
    claimantRole: 'Customer',
    respondentRole: 'Driver',
    claimantAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    respondentAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    valueImpact: 10,
  },
  {
    id: 'D004',
    claimant: 'Grace Hall',
    respondent: 'Henry King',
    type: 'Item Left Behind',
    status: 'Open',
    date: '2023-10-23',
    description: '',
    claimantRole: 'Driver',
    respondentRole: 'Customer',
    claimantAvatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    respondentAvatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    valueImpact: 0,
  },
  {
    id: 'D005',
    claimant: 'Ivy Chen',
    respondent: 'Jack Lee',
    type: 'False Report',
    status: 'Pending',
    date: '2023-10-22',
    description: '',
    claimantRole: 'Customer',
    respondentRole: 'Driver',
    claimantAvatar: 'https://randomuser.me/api/portraits/women/9.jpg',
    respondentAvatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    valueImpact: 0,
  },
];

const statusColors: { [key: string]: string } = {
  Open: '#22C55E',
  Pending: ROYAL_ORANGE,
  Closed: NAVY_BLUE,
};

const statusBgColors: { [key: string]: string } = {
  Open: '#22C55E11',
  Pending: '#FF8C0011',
  Closed: '#1A237E11',
};

const DisputePage: React.FC = () => {
  const [selected, setSelected] = useState(disputes[0]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Metrics
  const openCount = disputes.filter(d => d.status === 'Open').length;
  const pendingCount = disputes.filter(d => d.status === 'Pending').length;
  const closedCount = disputes.filter(d => d.status === 'Closed').length;
  const valueImpact = disputes.reduce((sum, d) => sum + (d.valueImpact || 0), 0);

  const filteredDisputes = disputes.filter(d =>
    (filter === 'All' || d.status === filter) &&
    (d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.claimant.toLowerCase().includes(search.toLowerCase()) ||
      d.respondent.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {/* Left: Dispute Table */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            padding: 16,
            minWidth: 320,
            flex: 1,
            maxWidth: 1000,
            width: '100%',
            minHeight: 420,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: NAVY_BLUE, flex: 1, minWidth: 180 }}>Active Disputes</h2>
            <button
              style={{
                background: '#fff',
                border: `1px solid #E5E7EB`,
                borderRadius: 8,
                width: 36,
                height: 36,
                marginRight: 8,
                cursor: 'pointer',
                fontSize: 18,
                color: NAVY_BLUE,
              }}
              title="Refresh"
              onClick={() => window.location.reload()}
            >⟳</button>
            <button
              style={{
                background: ROYAL_ORANGE,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0 18px',
                fontWeight: 700,
                fontSize: 15,
                height: 36,
                cursor: 'pointer'
              }}
            >+ New Dispute</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search disputes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                background: '#F8F6F4',
                fontSize: 15,
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none',
                minWidth: 120,
                maxWidth: 220,
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
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="All">Filter by Status</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              minWidth: 600,
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontFamily: 'Montserrat, sans-serif',
              marginBottom: 8,
            }}>
              <thead>
                <tr style={{ color: '#7B7B93', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Claimant</th>
                  <th style={thStyle}>Respondent</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date Filed</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.map((d) => (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid #F3EDE7',
                      fontSize: 15,
                      cursor: 'pointer',
                      background: selected.id === d.id ? '#F8F6F4' : '#fff',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => setSelected(d)}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: NAVY_BLUE }}>{d.id}</td>
                    <td style={tdStyle}>{d.claimant}</td>
                    <td style={tdStyle}>{d.respondent}</td>
                    <td style={tdStyle}>{d.type}</td>
                    <td style={{ ...tdStyle, padding: '8px 0' }}>
                      <span style={{
                        display: 'inline-block',
                        minWidth: 70,
                        textAlign: 'center',
                        background: statusBgColors[d.status],
                        color: statusColors[d.status],
                        borderRadius: 16,
                        fontWeight: 600,
                        fontSize: 14,
                        padding: '2px 16px'
                      }}>{d.status}</span>
                    </td>
                    <td style={tdStyle}>{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
            color: '#7B7B93',
            fontSize: 14,
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <span>Showing {filteredDisputes.length} of {disputes.length} disputes</span>
            <div>
              <button style={paginationBtnStyle} disabled>Previous</button>
              <button style={paginationBtnStyle} disabled>Next</button>
            </div>
          </div>
        </div>
        {/* Right: Metrics and Details */}
        <div style={{
          flex: 1,
          minWidth: 300,
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          width: '100%',
        }}>
          {/* Metrics */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            padding: 16,
            marginBottom: 0,
            display: 'flex',
            gap: 10,
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}>
            <MetricCard label="Open Disputes" value={openCount} icon="🟢" />
            <MetricCard label="Pending Resolution" value={pendingCount} icon="🟠" />
            <MetricCard label="Resolved Disputes" value={closedCount} icon="🔵" />
            <MetricCard label="Value Impact" value={`$${valueImpact.toFixed(2)}`} icon="💲" />
          </div>
          {/* Details */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            padding: 16,
            minWidth: 0,
          }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: NAVY_BLUE, marginBottom: 8 }}>
              Dispute #{selected.id} Details
            </div>
            <div style={{ color: '#7B7B93', fontSize: 14, marginBottom: 18 }}>
              Comprehensive view of the selected dispute.
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #F3EDE7', marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{
                padding: '8px 18px',
                fontWeight: 700,
                color: NAVY_BLUE,
                borderBottom: `3px solid ${NAVY_BLUE}`,
                background: '#fff',
                cursor: 'pointer'
              }}>Claim Details</div>
              <div style={{
                padding: '8px 18px',
                fontWeight: 600,
                color: '#A1A1AA',
                background: '#fff',
                cursor: 'not-allowed'
              }}>Evidence</div>
              <div style={{
                padding: '8px 18px',
                fontWeight: 600,
                color: '#A1A1AA',
                background: '#fff',
                cursor: 'not-allowed'
              }}>Communication Log</div>
              <div style={{
                padding: '8px 18px',
                fontWeight: 600,
                color: '#A1A1AA',
                background: '#fff',
                cursor: 'not-allowed'
              }}>Resolution</div>
            </div>
            {/* Claim Details */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 120, flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>Claimant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={selected.claimantAvatar} alt={selected.claimant} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F3EDE7' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{selected.claimant}</div>
                    <span style={{
                      background: selected.claimantRole === 'Customer' ? ROYAL_ORANGE + '22' : NAVY_BLUE + '22',
                      color: selected.claimantRole === 'Customer' ? ROYAL_ORANGE : NAVY_BLUE,
                      borderRadius: 8,
                      padding: '2px 10px',
                      fontWeight: 600,
                      fontSize: 13,
                      marginTop: 2,
                      display: 'inline-block'
                    }}>{selected.claimantRole}</span>
                  </div>
                </div>
              </div>
              <div style={{ minWidth: 120, flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>Respondent</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={selected.respondentAvatar} alt={selected.respondent} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F3EDE7' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{selected.respondent}</div>
                    <span style={{
                      background: selected.respondentRole === 'Customer' ? ROYAL_ORANGE + '22' : NAVY_BLUE + '22',
                      color: selected.respondentRole === 'Customer' ? ROYAL_ORANGE : NAVY_BLUE,
                      borderRadius: 8,
                      padding: '2px 10px',
                      fontWeight: 600,
                      fontSize: 13,
                      marginTop: 2,
                      display: 'inline-block'
                    }}>{selected.respondentRole}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>Dispute Type</div>
                <div style={{ fontWeight: 600, color: NAVY_BLUE }}>{selected.type}</div>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>Date Filed</div>
                <div style={{ fontWeight: 600, color: NAVY_BLUE }}>{selected.date}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>Description</div>
              <textarea
                value={selected.description || 'No description provided.'}
                readOnly
                style={{
                  width: '100%',
                  minHeight: 60,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: '#F8F6F4',
                  fontSize: 15,
                  padding: 10,
                  color: '#444',
                  resize: 'none'
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>Current Status</div>
              <span style={{
                display: 'inline-block',
                minWidth: 70,
                textAlign: 'center',
                background: statusBgColors[selected.status],
                color: statusColors[selected.status],
                borderRadius: 16,
                fontWeight: 600,
                fontSize: 14,
                padding: '2px 16px'
              }}>{selected.status}</span>
            </div>
          </div>
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
  padding: '12px 8px',
  fontWeight: 500,
  fontSize: 15,
  background: 'none',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const paginationBtnStyle: React.CSSProperties = {
  background: '#fff',
  border: `1px solid #E5E7EB`,
  borderRadius: 8,
  padding: '4px 18px',
  fontWeight: 600,
  fontSize: 15,
  color: NAVY_BLUE,
  marginLeft: 8,
  cursor: 'pointer',
  opacity: 0.7,
};

const MetricCard: React.FC<{ label: string, value: string | number, icon: string }> = ({ label, value, icon }) => (
  <div style={{
    flex: 1,
    background: '#F8F6F4',
    borderRadius: 10,
    padding: '1rem 1.2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 90,
    gap: 4,
    marginBottom: 6,
  }}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontWeight: 800, fontSize: 20, color: NAVY_BLUE }}>{value}</div>
    <div style={{ fontSize: 13, color: '#7B7B93', textAlign: 'center' }}>{label}</div>
  </div>
);

export default DisputePage;