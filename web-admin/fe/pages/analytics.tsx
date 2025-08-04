'use client';

import React, { useEffect, useState } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';

// We'll rely on real activities from the API instead of default ones

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>({ route: [], bid: [], users: [] });
  const [demographics, setDemographics] = useState<any[]>([]);
  const [disputeCategories, setDisputeCategories] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Store month labels for X-axis
  const [monthLabels, setMonthLabels] = useState<string[]>(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']);

  useEffect(() => {
    // Remember that we have default activities already set in state
    async function fetchAll() {
      setLoading(true);
      try {
        // Fetch all data in parallel for better performance
        // Add timeout to each fetch to prevent hanging indefinitely
        const timeoutDuration = 10000; // 10 seconds timeout
        
        const fetchWithTimeout = async (url: string, options = {}) => {
          const controller = new AbortController();
          const { signal } = controller;
          
          const timeout = setTimeout(() => {
            controller.abort();
          }, timeoutDuration);
          
          try {
            const response = await fetch(url, { ...options, signal });
            clearTimeout(timeout);
            return response;
          } catch (error) {
            clearTimeout(timeout);
            throw error;
          }
        };
        
        const [usersRes, routesRes, trendsRes, categoriesRes, activitiesRes] = await Promise.all([
          fetchWithTimeout('/api/admin/users').catch(err => ({ ok: false, json: () => Promise.resolve({}) })),
          fetchWithTimeout('/api/admin/routes').catch(err => ({ ok: false, json: () => Promise.resolve({}) })),
          fetchWithTimeout('/api/admin/trends').catch(err => ({ ok: false, json: () => Promise.resolve({}) })),
          fetchWithTimeout('/api/admin/dispute-categories').catch(err => ({ ok: false, json: () => Promise.resolve({}) })),
          fetchWithTimeout('/api/admin/activities').catch(err => ({ ok: false, json: () => Promise.resolve({}) }))
        ]);
        
        // Parse response data
        const usersData = await usersRes.json();
        const routesData = await routesRes.json();
        const trendsData = await trendsRes.json();
        const categoriesData = await categoriesRes.json();
        const activitiesData = await activitiesRes.json();
        
        // Set state with fetched data
        setUsers(usersData);
        setRoutes(routesData.routes || []);          // Convert trends data to the format needed by our charts
        if (trendsData.trends && trendsData.trends.length > 0) {
          const routePoints = trendsData.trends.map((item: any) => item.routes);
          const bidPoints = trendsData.trends.map((item: any) => item.bids);
          const userPoints = trendsData.trends.map((item: any) => item.users);
          
          console.log('Route data points:', routePoints);
          
          // Update the monthLabels for X-axis
          setMonthLabels(trendsData.trends.map((item: any) => item.month));
          
          // Set trends data
          setTrends({
            route: routePoints,
            bid: bidPoints,
            users: userPoints
          });
        }
        
        // Set dispute categories data
        if (categoriesData.categories) {
          setDisputeCategories(categoriesData.categories);
        }
        
        // Set activities data with improved handling
        console.log("Received activities data:", activitiesData);
        try {
          if (activitiesData && activitiesData.activities && Array.isArray(activitiesData.activities) && activitiesData.activities.length > 0) {
            console.log("Setting activities state with:", activitiesData.activities.length, "items");
            // Store in a variable first for safety
            const newActivities = activitiesData.activities.map((activity: any) => ({
              ...activity,
              // Ensure all required properties exist
              id: activity.id || `activity-${Math.random().toString(36).substring(2, 9)}`,
              icon: activity.icon || '📋',
              text: activity.text || 'System activity',
              time: activity.time || 'Recently'
            }));
            setActivities(newActivities);
          } else {
            console.log("No valid activities from API - keeping default activities");
            // Don't overwrite the default activities
          }
        } catch (err) {
          console.error("Error processing activities data:", err);
          // Keep default activities on error
        }

        // Compute stats
        const nonAdminUsers = usersData.filter((u: any) => u.role !== 'ADMIN');
        const drivers = nonAdminUsers.filter((u: any) => u.role === 'DRIVER');
        const customers = nonAdminUsers.filter((u: any) => u.role === 'CUSTOMER');
        
        // Handle case-insensitive status checks and null values
        const normalizeStatus = (status: any) => {
          return status ? String(status).toUpperCase() : null;
        };
        
        const verifiedDrivers = drivers.filter((u: any) => normalizeStatus(u.verification_status) === 'APPROVED').length;
        
        // For pending, check both 'PENDING' status and null/undefined status (users who haven't been verified yet)
        const pendingVerifications = nonAdminUsers.filter((u: any) => {
          const status = normalizeStatus(u.verification_status);
          // Count as pending if status is 'PENDING' or if it's null/undefined/empty (not yet verified)
          return status === 'PENDING' || !status;
        }).length;
        
        const blockedAccounts = nonAdminUsers.filter((u: any) => normalizeStatus(u.verification_status) === 'REJECTED').length;

        setStats([
          {
            label: 'Total Users',
            value: nonAdminUsers.length,
            desc: 'Overall user count',
          },
          {
            label: 'Verified Drivers',
            value: verifiedDrivers,
            desc: 'Drivers currently verified',
          },
          {
            label: 'Pending Verifications',
            value: pendingVerifications,
            desc: 'Users not yet verified',
          },
          {
            label: 'Blocked Accounts',
            value: blockedAccounts,
            desc: 'Permanently suspended users',
          },
          {
            label: 'Total Routes Posted',
            value: routesData.routes?.length || 0,
            desc: 'Total routes in system',
          },
        ]);

        // Trends data is now fetched from the /api/admin/trends endpoint

        // Demographics
        setDemographics([
          { label: 'Drivers', value: drivers.length },
          { label: 'Customers', value: customers.length },
        ]);

        // Dispute categories (dummy, replace with real if available)
        setDisputeCategories([
          { label: 'Payment Issues', value: 0, color: '#FF8C00' },
          { label: 'Route Deviations', value: 0, color: '#4F46E5' },
          { label: 'Service Quality', value: 0, color: '#A1A1AA' },
          { label: 'Other', value: 0, color: '#FACC15' },
        ]);

        // We rely solely on real activities from the API - no dummy data
        // If activitiesData.activities is empty, we'll show a "No activities" message
      } catch (err) {
        setStats([]);
        setTrends({ route: [], bid: [], users: [] });
        setDemographics([]);
        setDisputeCategories([]);
        setActivities([]);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  const maxDemographic = demographics.length > 0 ? Math.max(...demographics.map(d => d.value)) : 1;

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: NAVY_BLUE }}>Loading analytics...</div>;
  }

  return (
    <div style={{
      padding: '0 0 2rem 0',
      width: '100%',
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      <div style={{ height: 32 }} />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 18,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: 28,
              color: NAVY_BLUE,
              textAlign: 'left',
              marginBottom: 5
            }}
          >
            Analytics Dashboard
          </h1>
          <div style={{ color: '#7B7B93', fontSize: 16 }}>
            Comprehensive insights into platform performance and user engagement.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            onChange={(e) => {
              const value = e.target.value;
              // In a real implementation, this would trigger a re-fetch with the new date range
              // For now, just show a notification
              alert(`Filter changed to: ${value}. In a production environment, this would refresh the dashboard data.`);
            }}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 15,
              background: '#fff',
            }}
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="180d">Last 180 Days</option>
            <option value="1y">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={() => {
              alert('Report download functionality would be implemented here in a production environment.');
            }}
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
      </div>
      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
        {stats.map((s: any) => (
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
            <div style={{ fontSize: 14, color: '#7B7B93', fontWeight: 500 }}>{s.desc}</div>
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
            {/* Example: Just show total for now */}
            <svg width="100%" height="100%" viewBox="0 0 400 180">
              {/* Axes */}
              <polyline points="40,10 40,160 380,160" fill="none" stroke="#E5E7EB" strokeWidth="2" />
              {/* Y-axis grid lines */}
              {[0, 6, 12, 18, 24, 30].map((y) => (
                <line
                  key={`grid-${y}`}
                  x1={40}
                  y1={160 - (y * 5)}
                  x2={380}
                  y2={160 - (y * 5)}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}
              {/* Route Postings */}
              <polyline
                fill="none"
                stroke="#FF8C00"
                strokeWidth="2.5"
                points={trends.route.map((v: number, i: number) => `${40 + i * 48},${160 - Math.min(v, 30) * 5}`).join(' ')}
              />
              {/* Bid Activity */}
              <polyline
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                points={trends.bid.map((v: number, i: number) => `${40 + i * 48},${160 - Math.min(v, 30) * 5}`).join(' ')}
              />
              {/* New Users */}
              <polyline
                fill="none"
                stroke="#22C55E"
                strokeWidth="2.5"
                points={trends.users.map((v: number, i: number) => `${40 + i * 48},${160 - Math.min(v, 30) * 5}`).join(' ')}
              />
              {/* Dots */}
              {['#FF8C00', '#4F46E5', '#22C55E'].map((color, idx) =>
                (Object.values(trends)[idx] as number[]).map((v: number, i: number) => (
                  <circle
                    key={color + i}
                    cx={40 + i * 48}
                    cy={160 - Math.min(v, 30) * 5}
                    r={3.5}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="1"
                  />
                ))
              )}
              {/* Y axis labels */}
              {[0, 6, 12, 18, 24, 30].map((y) => (
                <text key={y} x={20} y={160 - (y * 5) + 5} fontSize="11" fill="#A1A1AA" textAnchor="end">{y}</text>
              ))}
              {/* X axis labels */}
              {monthLabels.map((m, i) => (
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
              <span style={{ width: 14, height: 4, background: '#22C55E', borderRadius: 2, display: 'inline-block' }} /> Users
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
                const total = disputeCategories.reduce((sum, d) => sum + d.value, 0) || 1;
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
                <span style={{ color: '#7B7B93' }}>{d.value}</span>
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
          <div style={{ width: '100%', marginTop: 8, minHeight: 180 }}>
            {/* Status message */}
            <div style={{ fontSize: 13, color: '#7B7B93', marginBottom: 12 }}>
              {activities.length > 0 
                ? `Showing the latest ${activities.length} system activities`
                : 'No recent system activities found'
              }
            </div>
            
            {/* Activities list - with proper error handling and guaranteed rendering */}
            {Array.isArray(activities) && activities.length > 0 ? (
              activities.map((a: any, i: number) => (
                <div 
                  key={a.id || `activity-${i}`} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i !== activities.length - 1 ? '1px solid #F3EDE7' : 'none',
                  }}
                >
                  <span style={{ fontSize: 22, minWidth: 30, textAlign: 'center' }}>
                    {a.icon || '📋'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, color: NAVY_BLUE }}>
                      {a.text || 'System activity'}
                    </div>
                    <div style={{ fontSize: 13, color: '#7B7B93' }}>
                      {a.time || 'Recently'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 0',
                color: '#7B7B93',
                textAlign: 'center',
                height: '150px'
              }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>📊</div>
                <div style={{ fontWeight: 600, color: NAVY_BLUE }}>No recent activities</div>
                <div style={{ fontSize: 13, color: '#7B7B93', maxWidth: '80%' }}>
                  System activities will appear here as users interact with the platform
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;