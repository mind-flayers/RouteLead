'use client'
import React from 'react';
import dynamic from 'next/dynamic';

const NAVBAR_HEIGHT = 64;
const NAVY_BLUE = '#1A237E';

// Dynamically import Chart.js components to avoid SSR issues
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });

// Chart.js needs to be registered
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const barData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'User Growth',
      data: [120, 190, 170, 220, 200, 250],
      backgroundColor: '#FF8C00',
      borderRadius: 8,
      maxBarThickness: 32,
    },
  ],
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#F3EDE7' }, beginAtZero: true },
  },
};

const pieData = {
  labels: ['Drivers', 'Customers'],
  datasets: [
    {
      data: [35, 65],
      backgroundColor: ['#FFD9B3', '#7B7B93'],
      borderWidth: 0,
    },
  ],
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px #0001',
  padding: '2rem 2.5rem',
  minWidth: 220,
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
};

const cardTitle: React.CSSProperties = {
  fontSize: 16,
  color: '#7B7B93',
  marginBottom: 10,
  fontWeight: 600,
  fontFamily: 'Montserrat, Arial, sans-serif',
};

const cardValue: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: '#FF8C00',
  fontFamily: 'Montserrat, Arial, sans-serif',
};

const incomeData = [
  { month: 'Jan', income: 8000 },
  { month: 'Feb', income: 9500 },
  { month: 'Mar', income: 10200 },
  { month: 'Apr', income: 11000 },
  { month: 'May', income: 12000 },
  { month: 'Jun', income: 12340 },
];

const incomeChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Monthly Income',
      data: [8000, 9500, 10200, 11000, 12000, 12340],
      backgroundColor: '#1A237E',
      borderRadius: 8,
      maxBarThickness: 32,
    },
  ],
};

const incomeChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#F3EDE7' }, beginAtZero: true },
  },
};

const Dashboard: React.FC = () => {
  return (
    <div style={{padding: '0 0 2rem 0'}}>
      {/* Add space above heading */}
      <div style={{ height: 32 }} />
      <h1
        style={{
          fontWeight: 800,
          fontSize: 28,
          marginBottom: 24,
          color: NAVY_BLUE,
          textAlign: 'left'
        }}
      >
        Welcome to the Dashboard
      </h1>
      {/* Stat Cards Row */}
      <div style={{
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap',
        marginBottom: 32,
        justifyContent: 'space-between',
      }}>
        <div style={{ ...cardStyle, flex: 1, minWidth: 180, maxWidth: 300 }}>
          <div style={cardTitle}>Total Users</div>
          <div style={cardValue}>1,245</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: 180, maxWidth: 300 }}>
          <div style={cardTitle}>Active Routes</div>
          <div style={cardValue}>87</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: 180, maxWidth: 300 }}>
          <div style={cardTitle}>Pending Disputes</div>
          <div style={cardValue}>5</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: 180, maxWidth: 300 }}>
          <div style={cardTitle}>Revenue (This Month)</div>
          <div style={cardValue}>Rs.12,340</div>
        </div>
      </div>
      {/* Analytics Section: 3 charts in a row */}
      <div style={{
        display: 'flex',
        gap: 32,
        marginTop: 0,
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px #0001',
          padding: '1.5rem 2rem',
          minWidth: 320,
          flex: 1,
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#222' }}>
            Monthly User Growth
          </div>
          <Bar data={barData} options={barOptions} height={180} />
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px #0001',
          padding: '1.5rem 2rem',
          minWidth: 220,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#222' }}>
            User Types
          </div>
          <Pie data={pieData} options={pieOptions} height={180} />
          <div style={{ marginTop: 16, fontSize: 14, color: '#7B7B93', textAlign: 'center' }}>
            <span style={{ color: '#FFD9B3', fontWeight: 700 }}>●</span> Drivers &nbsp;
            <span style={{ color: '#7B7B93', fontWeight: 700 }}>●</span> Customers
          </div>
        </div>
        {/* Monthly Income Chart */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px #0001',
          padding: '1.5rem 2rem',
          minWidth: 320,
          flex: 1,
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#222' }}>
            Monthly Income Chart
          </div>
          <Bar data={incomeChartData} options={incomeChartOptions} height={180} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;