import React from 'react';

// Dummy data for charts and stats
const stats = [
  {
    label: 'Total Routes Posted',
    value: '1,892',
    change: '+12.5%',
    positive: true,
    desc: 'compared to last month',
  },
  {
    label: 'Active Drivers',
    value: '450',
    change: '+8.1%',
    positive: true,
    desc: 'compared to last month',
  },
  {
    label: 'Successful Bids',
    value: '1,520',
    change: '+10.3%',
    positive: true,
    desc: 'compared to last month',
  },
  {
    label: 'Disputes Resolved',
    value: '85',
    change: '-5.0%',
    positive: false,
    desc: 'compared to last month',
  },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const trends = {
  route: [80, 110, 140, 160, 180, 200, 210, 230],
  bid: [70, 100, 130, 150, 170, 190, 200, 220],
  users: [60, 90, 120, 140, 160, 180, 190, 210],
};

const demographics = [
  { label: 'Drivers', value: 500 },
  { label: 'Customers', value: 800 },
];

const disputeCategories = [
  { label: 'Payment Issues', value: 43, color: '#FF8C00' },
  { label: 'Route Deviations', value: 29, color: '#4F46E5' },
  { label: 'Service Quality', value: 19, color: '#A1A1AA' },
  { label: 'Other', value: 10, color: '#FACC15' },
];

const activities = [
  { icon: '🟢', text: 'New driver registered: John Doe', time: '5 minutes ago' },
  { icon: '🔴', text: 'Dispute filed for Route #RL789', time: '1 hour ago' },
  { icon: '🔵', text: 'Route #RL101 completed by Sarah', time: '3 hours ago' },
  { icon: '🟣', text: 'High bid received for Logistics route #RL234', time: 'Yesterday' },
  { icon: '⚡', text: 'System update initiated for server cluster', time: 'Yesterday' },
  { icon: '🟢', text: 'Customer feedback submitted: excellent service', time: '2 days ago' },
  { icon: '🟠', text: 'Route optimization algorithm updated', time: '3 days ago' },
];

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';

// Helper for max value
const maxDemographic = Math.max(...demographics.map(d => d.value));

const Analytics = () => (
  <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: 24, boxSizing: 'border-box' }}>
    <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 4, color: NAVY_BLUE }}>Analytics Dashboard</h1>
    <div style={{ color: '#7B7B93', fontSize: 16, marginBottom: 18 }}>
      Comprehensive insights into platform performance and user engagement.
    </div>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
      <div style={{ flex: 1 }} />
      <input
        type="date"
        style={{
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          padding: '8px 14px',
          fontSize: 15,
          marginRight: 10,
        }}
      />
      <button
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 600,
          fontSize: 15,
          color: NAVY_BLUE,
          cursor: 'pointer',
        }}
      >
        &#128190; Share Report
      </button>
    </div>
    {/* Stat Cards */}
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px #0001',
            padding: '1.2rem 2rem',
            minWidth: 210,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minHeight: 90,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{s.label}</div>
          <div style={{ fontWeight: 800, fontSize: 28, color: NAVY_BLUE }}>{s.value}</div>
          <div style={{ fontSize: 14, color: s.positive ? '#22C55E' : '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            {s.positive ? '↑' : '↓'} {s.change}
            <span style={{ color: '#7B7B93', fontWeight: 500, marginLeft: 8 }}>{s.desc}</span>
          </div>
        </div>
      ))}
    </div>
    {/* Trends & Demographics */}
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
      {/* Trends */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: 18,
        flex: 2,
        minWidth: 340,
        minHeight: 320,
        maxWidth: 600,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: NAVY_BLUE, marginBottom: 8 }}>
          Platform Activity Trends
        </div>
        <div style={{ color: '#7B7B93', fontSize: 14, marginBottom: 10 }}>
          Monthly trends for route postings, bid activity, and new user registrations.
        </div>
        <div style={{ width: '100%', height: 180, marginBottom: 10 }}>
          <svg width="100%" height="100%" viewBox="0 0 400 180">
            {/* Axes */}
            <polyline points="40,10 40,160 380,160" fill="none" stroke="#E5E7EB" strokeWidth="2" />
            {/* Route Postings */}
            <polyline
              fill="none"
              stroke="#FF8C00"
              strokeWidth="2.5"
              points={trends.route.map((v, i) => `${40 + i * 48},${160 - v / 1.5}`).join(' ')}
            />
            {/* Bid Activity */}
            <polyline
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2.5"
              points={trends.bid.map((v, i) => `${40 + i * 48},${160 - v / 1.5}`).join(' ')}
            />
            {/* New Users */}
            <polyline
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              points={trends.users.map((v, i) => `${40 + i * 48},${160 - v / 1.5}`).join(' ')}
            />
            {/* Dots */}
            {['#FF8C00', '#4F46E5', '#22C55E'].map((color, idx) =>
              (Object.values(trends)[idx] as number[]).map((v, i) => (
                <circle
                  key={color + i}
                  cx={40 + i * 48}
                  cy={160 - v / 1.5}
                  r={3.5}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="1"
                />
              ))
            )}
            {/* Y axis labels */}
            {[0, 65, 130, 195, 260].map((y, i) => (
              <text key={i} x={8} y={160 - y / 1.5 + 5} fontSize="11" fill="#A1A1AA">{y}</text>
            ))}
            {/* X axis labels */}
            {months.map((m, i) => (
              <text key={m} x={40 + i * 48} y={175} fontSize="12" fill="#A1A1AA" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 13, color: '#7B7B93', marginTop: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 4, background: '#FF8C00', borderRadius: 2, display: 'inline-block' }} /> Route Postings
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 4, background: '#4F46E5', borderRadius: 2, display: 'inline-block' }} /> Bid Activity
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 4, background: '#22C55E', borderRadius: 2, display: 'inline-block' }} /> New Users
          </span>
        </div>
      </div>
      {/* Demographics */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: 18,
        flex: 1,
        minWidth: 260,
        minHeight: 320,
        maxWidth: 340,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: NAVY_BLUE, marginBottom: 8 }}>
          User Demographics Overview
        </div>
        <div style={{ color: '#7B7B93', fontSize: 14, marginBottom: 10 }}>
          Distribution of user roles across the platform.
        </div>
        {/* Real Bar Chart using SVG */}
        <div style={{ width: '100%', height: 180, marginBottom: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <svg width="100%" height="100%" viewBox="0 0 140 160" style={{ width: '100%', maxWidth: 140 }}>
            {/* Y axis lines and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <g key={i}>
                <line
                  x1={30}
                  x2={120}
                  y1={160 - t * 140}
                  y2={160 - t * 140}
                  stroke="#E5E7EB"
                  strokeDasharray="2,2"
                />
                <text
                  x={24}
                  y={164 - t * 140}
                  fontSize="11"
                  fill="#A1A1AA"
                  textAnchor="end"
                  alignmentBaseline="middle"
                >
                  {Math.round(maxDemographic * t)}
                </text>
              </g>
            ))}
            {/* Bars */}
            {demographics.map((d, i) => {
              const barHeight = (d.value / maxDemographic) * 140;
              const x = 40 + i * 50;
              const color = i === 0 ? '#4F46E5' : '#FF8C00';
              return (
                <g key={d.label}>
                  <rect
                    x={x}
                    y={160 - barHeight}
                    width={36}
                    height={barHeight}
                    rx={8}
                    fill={color}
                  />
                  <text
                    x={x + 18}
                    y={160 - barHeight - 8}
                    fontSize="13"
                    fill={NAVY_BLUE}
                    fontWeight={700}
                    textAnchor="middle"
                  >
                    {d.value}
                  </text>
                  <text
                    x={x + 18}
                    y={172}
                    fontSize="13"
                    fill="#7B7B93"
                    textAnchor="middle"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
    {/* Dispute Categories & Activities */}
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
      {/* Dispute Categories */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: 18,
        flex: 1,
        minWidth: 260,
        maxWidth: 340,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: NAVY_BLUE, marginBottom: 8 }}>
          Top Dispute Categories
        </div>
        <div style={{ color: '#7B7B93', fontSize: 14, marginBottom: 10 }}>
          Breakdown of disputes by common categories.
        </div>
        <div style={{ width: '100%', height: 160, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Simple pie chart */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            {(() => {
              const total = disputeCategories.reduce((sum, d) => sum + d.value, 0);
              let start = 0;
              return disputeCategories.map((d, i) => {
                const angle = (d.value / total) * 360;
                const large = angle > 180 ? 1 : 0;
                const r = 50;
                const x1 = 60 + r * Math.cos((Math.PI * (start - 90)) / 180);
                const y1 = 60 + r * Math.sin((Math.PI * (start - 90)) / 180);
                const x2 = 60 + r * Math.cos((Math.PI * (start + angle - 90)) / 180);
                const y2 = 60 + r * Math.sin((Math.PI * (start + angle - 90)) / 180);
                const path = `
                  M60,60
                  L${x1},${y1}
                  A${r},${r} 0 ${large} 1 ${x2},${y2}
                  Z
                `;
                start += angle;
                return <path key={d.label} d={path} fill={d.color} />;
              });
            })()}
          </svg>
        </div>
        <div style={{ fontSize: 13, color: '#7B7B93', marginTop: 2 }}>
          {disputeCategories.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ width: 12, height: 12, background: d.color, borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ color: d.color, fontWeight: 700 }}>{d.label}</span>
              <span style={{ color: '#7B7B93' }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Activities */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px #0001',
        padding: 18,
        flex: 2,
        minWidth: 340,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: NAVY_BLUE, marginBottom: 8 }}>
          Recent System Activities
        </div>
        <div style={{ color: '#7B7B93', fontSize: 14, marginBottom: 10 }}>
          Latest events and updates across the platform.
        </div>
        <div style={{ width: '100%', marginTop: 8 }}>
          {activities.map((a, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: i !== activities.length - 1 ? '1px solid #F3EDE7' : 'none',
            }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: NAVY_BLUE }}>{a.text}</div>
                <div style={{ fontSize: 13, color: '#7B7B93' }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Analytics;