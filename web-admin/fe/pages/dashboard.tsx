import React from 'react';
import dynamic from 'next/dynamic';

const NAVBAR_HEIGHT = 64;

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

const Dashboard: React.FC = () => {
  return (
    <div style={{ paddingTop: NAVBAR_HEIGHT }}>
      <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 24, color: '#222' }}>
        Welcome to the Dashboard
      </h1>
      <div style={{
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap',
      }}>
        {/* Example Stat Cards */}
        <div style={cardStyle}>
          <div style={cardTitle}>Total Users</div>
          <div style={cardValue}>1,245</div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}>Active Routes</div>
          <div style={cardValue}>87</div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}>Pending Disputes</div>
          <div style={cardValue}>5</div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}>Revenue (This Month)</div>
          <div style={cardValue}>Rs.12,340</div>
        </div>
      </div>
      {/* Analytics Section */}
      <div style={{
        display: 'flex',
        gap: 32,
        marginTop: 40,
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px #0001',
          padding: '1.5rem 2rem',
          minWidth: 340,
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
      </div>
    </div>
  );
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

export default Dashboard;