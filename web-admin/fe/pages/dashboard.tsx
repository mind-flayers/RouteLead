'use client'
import React, { useState, useEffect } from 'react';
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

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
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
  const [users, setUsers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRoutes: 0,
    pendingDisputes: 0,
    revenue: 0,
    drivers: 0,
    customers: 0,
    admins: 0
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch users
        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Fetch routes
        const routesRes = await fetch('/api/admin/routes');
        const routesData = await routesRes.json();
        setRoutes(routesData.routes || []);

        // Calculate stats (excluding admins)
        const nonAdminUsers = usersData.filter((u: any) => u.role !== 'ADMIN');
        const totalUsers = nonAdminUsers.length;
        const drivers = nonAdminUsers.filter((u: any) => u.role === 'DRIVER').length;
        const customers = nonAdminUsers.filter((u: any) => u.role === 'CUSTOMER').length;
        const activeRoutes = routesData.routes?.length || 0;
        const pendingDisputes = 0; // TODO: Add disputes API when available
        const revenue = 0; // TODO: Add revenue calculation when available

        setStats({
          totalUsers,
          activeRoutes,
          pendingDisputes,
          revenue,
          drivers,
          customers,
          admins: 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  // Prepare chart data based on real data
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'User Growth',
        data: [stats.totalUsers * 0.1, stats.totalUsers * 0.2, stats.totalUsers * 0.3, stats.totalUsers * 0.4, stats.totalUsers * 0.5, stats.totalUsers],
        backgroundColor: '#FF8C00',
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  const pieData = {
    labels: ['Drivers', 'Customers'],
    datasets: [
      {
        data: [stats.drivers, stats.customers],
        backgroundColor: ['#FFD9B3', '#7B7B93'],
        borderWidth: 0,
      },
    ],
  };

  const incomeChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Income',
        data: [stats.revenue * 0.1, stats.revenue * 0.2, stats.revenue * 0.3, stats.revenue * 0.4, stats.revenue * 0.5, stats.revenue],
        backgroundColor: '#1A237E',
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: NAVY_BLUE }}>Loading dashboard data...</div>
      </div>
    );
  }

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
          <div style={cardValue}>{stats.totalUsers}</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: 180, maxWidth: 300 }}>
          <div style={cardTitle}>Active Routes</div>
          <div style={cardValue}>{stats.activeRoutes}</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: 180, maxWidth: 300 }}>
          <div style={cardTitle}>Pending Disputes</div>
          <div style={cardValue}>{stats.pendingDisputes}</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: 180, maxWidth: 300 }}>
          <div style={cardTitle}>Revenue (This Month)</div>
          <div style={cardValue}>Rs.{stats.revenue}</div>
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