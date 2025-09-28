'use client';
import React, { useState, useEffect } from 'react';
import { authHeaders } from '../lib/authHeaders';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';
const GREEN = '#22C55E';
const LIGHT_GREEN = '#D1FAE5';
const GREY = '#7B7B93';
const RED = '#EF4444';

const statusColors: { [key: string]: string } = {
  PENDING: ROYAL_ORANGE,
  PROCESSING: '#3B82F6',
  COMPLETED: GREEN,
  FAILED: RED,
};

interface Withdrawal {
  id: string;
  driverId: string;
  amount: number;
  bankDetails: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    routingNumber?: string;
  };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  processedAt?: string;
  createdAt: string;
  driverName: string;
}

const WithdrawalManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    async function fetchWithdrawals() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/withdrawals', { headers: await authHeaders() });
        const data = await res.json();
        setWithdrawals(data.data || []);
      } catch (err) {
        console.error('Error fetching withdrawals:', err);
        setWithdrawals([]);
      }
      setLoading(false);
    }
    fetchWithdrawals();
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
    fontFamily: 'Outfit, sans-serif',
    color: NAVY_BLUE,
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
  };

  // Filtered withdrawals based on filters
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesStatus = statusFilter === 'All' || withdrawal.status === statusFilter;
    const matchesDriver = driverFilter.trim() === '' || 
      withdrawal.driverName.toLowerCase().includes(driverFilter.toLowerCase());
    return matchesStatus && matchesDriver;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, driverFilter, withdrawals.length]);

  const totalFiltered = filteredWithdrawals.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndexExclusive = Math.min(startIndex + pageSize, totalFiltered);
  const pageWithdrawals = filteredWithdrawals.slice(startIndex, endIndexExclusive);

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
  const processingWithdrawals = withdrawals.filter(w => w.status === 'PROCESSING').length;
  const completedWithdrawals = withdrawals.filter(w => w.status === 'COMPLETED').length;
  const failedWithdrawals = withdrawals.filter(w => w.status === 'FAILED').length;

  const handleStatusUpdate = async () => {
    if (!selectedWithdrawal || !newStatus) return;
    
    setUpdateLoading(true);
    try {
      const params = new URLSearchParams({
        status: newStatus,
        ...(transactionId && { transactionId })
      });
      
      const res = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}/status?${params}`, {
        method: 'PATCH',
        headers: await authHeaders()
      });
      
      if (res.ok) {
        // Refresh withdrawals list
        const refreshRes = await fetch('/api/admin/withdrawals', { headers: await authHeaders() });
        const refreshData = await refreshRes.json();
        setWithdrawals(refreshData.data || []);
        
        setUpdateModalOpen(false);
        setSelectedWithdrawal(null);
        setNewStatus('');
        setTransactionId('');
      } else {
        alert('Failed to update withdrawal status');
      }
    } catch (err) {
      console.error('Error updating withdrawal status:', err);
      alert('Error updating withdrawal status');
    }
    setUpdateLoading(false);
  };

  const openUpdateModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setTransactionId(withdrawal.transactionId || '');
    setUpdateModalOpen(true);
  };

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
        Withdrawal Management Dashboard
      </h1>
      <div style={{ color: '#7B7B93', fontSize: 16, marginBottom: 18 }}>
        Review and manage driver withdrawal requests.
      </div>
      
      {/* Statistics Cards */}
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
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Pending</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{pendingWithdrawals}</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>Awaiting review</div>
          <div style={{ position: 'absolute', top: 18, right: 18, opacity: 0.15, fontSize: 54 }}>⏳</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: '#3B82F6',
          color: '#fff',
          borderRadius: 12,
          padding: '1.6rem 2rem',
          boxShadow: '0 2px 12px #3B82F622',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Processing</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{processingWithdrawals}</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>In progress</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: GREEN,
          color: '#fff',
          borderRadius: 12,
          padding: '1.6rem 2rem',
          boxShadow: '0 2px 12px #22C55E22',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Completed</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{completedWithdrawals}</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>Successfully processed</div>
        </div>
        <div style={{
          flex: 1,
          minWidth: 220,
          background: RED,
          color: '#fff',
          borderRadius: 12,
          padding: '1.6rem 2rem',
          boxShadow: '0 2px 12px #EF444422',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Failed</div>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 4 }}>{failedWithdrawals}</div>
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>Processing failed</div>
        </div>
      </div>

      {/* Filters and Table */}
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
              fontFamily: 'Outfit, sans-serif',
              outline: 'none',
              minWidth: 180,
              maxWidth: 320,
            }}
          />
          <select style={filterSelectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>Loading withdrawals...</div>
        ) : (
          <table style={{
            width: '100%',
            minWidth: 800,
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontFamily: 'Outfit, sans-serif',
            tableLayout: 'fixed'
          }}>
            <thead>
              <tr style={{ color: '#7B7B93', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
                <th style={{ ...thStyle, width: '20%' }}>Driver Name</th>
                <th style={{ ...thStyle, width: '15%' }}>Amount</th>
                <th style={{ ...thStyle, width: '20%' }}>Bank Details</th>
                <th style={{ ...thStyle, width: '12%' }}>Status</th>
                <th style={{ ...thStyle, width: '15%' }}>Created At</th>
                <th style={{ ...thStyle, width: '18%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} style={rowStyle}>
                  <td style={cellStyle}>{withdrawal.driverName}</td>
                  <td style={cellStyle}>Rs. {withdrawal.amount.toFixed(2)}</td>
                  <td style={cellStyle}>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                      <div><strong>{withdrawal.bankDetails.bankName || 'N/A'}</strong></div>
                      <div style={{ color: '#7B7B93' }}>
                        {withdrawal.bankDetails.accountNumber ? `****${withdrawal.bankDetails.accountNumber.slice(-4)}` : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <span style={labelButtonStyle(statusColors[withdrawal.status] || GREY)}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ ...cellStyle, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        style={{
                          background: NAVY_BLUE,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          minWidth: 70,
                          fontSize: 13,
                        }}
                        onClick={() => openUpdateModal(withdrawal)}
                      >
                        Update
                      </button>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          verticalAlign: 'middle',
                        }}
                        title="View Details"
                        onClick={() => {
                          alert(`Withdrawal Details:\n\nDriver: ${withdrawal.driverName}\nAmount: Rs. ${withdrawal.amount.toFixed(2)}\nBank: ${withdrawal.bankDetails.bankName || 'N/A'}\nAccount: ${withdrawal.bankDetails.accountNumber || 'N/A'}\nStatus: ${withdrawal.status}\nCreated: ${new Date(withdrawal.createdAt).toLocaleString()}`);
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" fill="#1A237E"/>
                          <path d="M10 2C5.58172 2 1.99998 5.58172 1.99998 10C1.99998 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 3.99998 13.3137 3.99998 10C3.99998 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="#1A237E"/>
                        </svg>
                      </button>
                    </div>
                  </td>
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
          <span>Showing {totalFiltered === 0 ? 0 : startIndex + 1} - {Math.min(endIndexExclusive, totalFiltered)} of {totalFiltered} withdrawals</span>
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

      {/* Update Status Modal */}
      {updateModalOpen && selectedWithdrawal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 4px 24px #0003',
              padding: '2rem 2.5rem',
              minWidth: 400,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, color: NAVY_BLUE, marginBottom: 6 }}>
              Update Withdrawal Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Driver: {selectedWithdrawal.driverName}</label>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Amount: Rs. {selectedWithdrawal.amount.toFixed(2)}</label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15, width: '100%' }}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID if available"
                  style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15, width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => { setUpdateModalOpen(false); setSelectedWithdrawal(null); setNewStatus(''); setTransactionId(''); }}
                style={{
                  background: '#fff',
                  border: `1.5px solid #E5E7EB`,
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: 15,
                  color: NAVY_BLUE,
                  cursor: 'pointer',
                  transition: 'background 0.2s, border 0.2s',
                }}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                style={{
                  background: ROYAL_ORANGE,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #FF8C0022',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManagement;
