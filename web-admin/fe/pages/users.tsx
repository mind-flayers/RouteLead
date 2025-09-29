import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { authHeaders } from '../lib/authHeaders';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';

const statusColors: { [key: string]: string } = {
	Active: '#22C55E',
	Pending: ROYAL_ORANGE,
	Suspended: '#A1A1AA',
	Blocked: '#EF4444',
};

const verificationColors: { [key: string]: string } = {
	Verified: NAVY_BLUE,
	Pending: ROYAL_ORANGE,
	Rejected: '#EF4444',
};

const roleColors: { [key: string]: string } = {
	DRIVER: NAVY_BLUE,
	CUSTOMER: ROYAL_ORANGE,
	ADMIN: '#7B7B93',
};

const roleOptions = ['All Roles', 'DRIVER', 'CUSTOMER'];
const statusOptions = ['Active', 'Pending', 'Suspended', 'Blocked'];
const verificationOptions = ['Verified', 'Pending', 'Rejected'];

const verificationStatusColors: { [key: string]: string } = {
  APPROVED: NAVY_BLUE,
  PENDING: ROYAL_ORANGE,
  REJECTED: '#EF4444',
};

// Map backend verification status to display label
const getDisplayStatus = (status?: string): string => {
	if (!status) return 'Active';
	const s = String(status).toUpperCase();
	switch (s) {
		case 'APPROVED':
			return 'Active';
		case 'REJECTED':
			return 'On Hold';
		case 'PENDING':
			return 'Pending';
		default:
			return status;
	}
};

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

const paginationBtnStyle: React.CSSProperties = {
	background: '#fff',
	border: `1px solid ${NAVY_BLUE}22`,
	borderRadius: 8,
	padding: '4px 18px',
	fontWeight: 600,
	fontSize: 15,
	color: NAVY_BLUE,
	marginLeft: 8,
	cursor: 'pointer',
};

const UserManagement: React.FC = () => {
	const [showDocsModal, setShowDocsModal] = useState(false);
	const [search, setSearch] = useState('');
	const [role, setRole] = useState('All Roles');
	const [status, setStatus] = useState('All Statuses');
	const [verification, setVerification] = useState('All Verification Statuses');
	const [userList, setUserList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
	const [verificationDropdown, setVerificationDropdown] = useState<string | null>(null);
		const [editModalOpen, setEditModalOpen] = useState(false);
		const [editUser, setEditUser] = useState<any | null>(null);
		const [editForm, setEditForm] = useState<any>({});
		const [editLoading, setEditLoading] = useState(false);
		const [docs, setDocs] = useState<any>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	useEffect(() => {
		async function fetchUsers() {
			setLoading(true);
			try {
				const res = await fetch('/api/admin/users', { headers: await authHeaders() });
				const data = await res.json();
				// Map snake_case to camelCase and exclude admin users
				if (Array.isArray(data)) {
					setUserList(
						data
							.filter((u: any) => String(u.role || '').toUpperCase() !== 'ADMIN') // Exclude admin users (case-insensitive)
							.map((u: any) => ({
								...u,
								firstName: u.firstName || u.first_name,
								lastName: u.lastName || u.last_name,
								phoneNumber: u.phoneNumber || u.phone_number,
								isVerified: u.isVerified ?? u.is_verified,
								createdAt: u.createdAt || u.created_at,
								nicNumber: u.nicNumber || u.nic_number || '',
							}))
					);
				} else {
					setUserList([]);
					// Optionally, handle error or show a message
				}
			} catch (err) {
				setUserList([]);
			}
			setLoading(false);
		}
		fetchUsers();
	}, []);

	const handleReset = () => {
		setSearch('');
		setRole('All Roles');
		setStatus('All Statuses');
		setVerification('All Verification Statuses');
		setCurrentPage(1);
	};

	// Optionally, you can implement status/verification change logic for real data here

	const filteredUsers = userList
		.filter((u) => String(u.role || '').toUpperCase() !== 'ADMIN')
		.filter((u) => {
			const name = (u.firstName || '') + ' ' + (u.lastName || '');
			const searchLower = search.toLowerCase();
			const searchDigits = search.replace(/\D/g, '');
			const phoneStr = String(u.phoneNumber || '').toLowerCase();
			const phoneDigits = String(u.phoneNumber || '').replace(/\D/g, '');
			const matchesSearch =
				name.toLowerCase().includes(searchLower) ||
				(u.email || '').toLowerCase().includes(searchLower) ||
				(u.id || '').toLowerCase().includes(searchLower) ||
				phoneStr.includes(searchLower) ||
				(!!searchDigits && phoneDigits.includes(searchDigits));
			const matchesRole = role === 'All Roles' || u.role === role;
			// You may want to map your real status/verification fields here
			return matchesSearch && matchesRole;
		})
		.sort((a, b) => {
			// Blocked users (REJECTED) go last
			if (a.verification_status === 'REJECTED' && b.verification_status !== 'REJECTED') return 1;
			if (a.verification_status !== 'REJECTED' && b.verification_status === 'REJECTED') return -1;
			return 0;
		});

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [search, role]);

	// Pagination calculations
	const totalFiltered = filteredUsers.length;
	const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [totalPages, currentPage]);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndexExclusive = Math.min(startIndex + pageSize, totalFiltered);
	const pageUsers = filteredUsers.slice(startIndex, endIndexExclusive);

	// Stat counts based on filteredUsers
	const totalUsers = filteredUsers.length;
	const verifiedDrivers = filteredUsers.filter(u => u.role === 'DRIVER' && u.isVerified).length;
	const pendingVerifications = filteredUsers.filter(u => u.isVerified === false).length;
	const blockedAccounts = filteredUsers.filter(u => u.verification_status === 'REJECTED').length;

	return (
		<div style={{
			padding: '0 0 2rem 0',
			width: '100%',
			maxWidth: 1200,
			margin: '0 auto',
			boxSizing: 'border-box'
		}}>
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
				User Management Dashboard
			</h1>
			<div style={{ color: '#7B7B93', fontSize: 16, marginBottom: 18 }}>
				Manage, search, and filter all registered users.
			</div>
			<div
				style={{
					display: 'flex',
					gap: 24,
					marginBottom: 28,
					flexWrap: 'wrap',
					alignItems: 'stretch',
				}}
			>
				<StatCard title="Total Users" value={String(totalUsers)} desc="Overall user count" color={NAVY_BLUE} />
				<StatCard title="Verified Drivers" value={String(verifiedDrivers)} desc="Drivers currently verified" color={ROYAL_ORANGE} />
				<StatCard title="Pending Verifications" value={String(pendingVerifications)} desc="Users not yet verified" color={ROYAL_ORANGE} />
				<StatCard title="Blocked Accounts" value={String(blockedAccounts)} desc="Permanently suspended users" color="#EF4444" />
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
							placeholder="Search users..."
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
						<select style={filterSelectStyle} value={role} onChange={e => setRole(e.target.value)}>
							{roleOptions.map(opt => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
						{/* You can add more filters for status/verification if you map those fields */}
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
							onClick={handleReset}
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
						+ Add New User
					</button>
				</div>
				{loading ? (
					<div style={{ padding: 24, textAlign: 'center' }}>Loading users...</div>
				) : (
					<table style={{
						width: '100%',
						minWidth: 700,
						borderCollapse: 'separate',
						borderSpacing: 0,
						fontFamily: 'Montserrat, sans-serif'
					}}>
						<thead>
							<tr style={{ color: '#7B7B93', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
								{/* <th style={thStyle}>ID</th> */}
								<th style={thStyle}>First Name</th>
								<th style={thStyle}>Last Name</th>
								<th style={thStyle}>Email</th>
								<th style={thStyle}>Phone Number</th>
								<th style={thStyle}>Role</th>
								<th style={thStyle}>eMail</th>
								<th style={thStyle}>Status</th>
								<th style={thStyle}>Registered</th>
								<th style={thStyle}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{pageUsers.map((u) => (
								<tr key={u.id} style={rowStyle}>
									{/* <td style={cellStyle}>{u.id}</td> */}
									<td style={cellStyle}>{u.firstName || ''}</td>
									<td style={cellStyle}>{u.lastName || ''}</td>
									<td style={cellStyle}>{u.email}</td>
									<td style={cellStyle}>{u.phoneNumber || ''}</td>
									<td style={cellStyle}>
										<span style={labelButtonStyle(roleColors[u.role] || '#7B7B93')}>{u.role}</span>
									</td>
									<td style={cellStyle}>
										<span style={labelButtonStyle(u.isVerified ? NAVY_BLUE : ROYAL_ORANGE)}>
											{u.isVerified ? 'Verified' : 'Pending'}
										</span>
									</td>
									<td style={cellStyle}>
										<span style={labelButtonStyle(verificationStatusColors[u.verification_status || 'APPROVED'] || '#7B7B93')}>
											{getDisplayStatus(u.verification_status || 'APPROVED')}
										</span>
									</td>
									<td style={cellStyle}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
									<td style={{ ...cellStyle, minWidth: 180 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<button
												style={{
													background: 'none',
													border: 'none',
													cursor: 'pointer',
													padding: 4,
													verticalAlign: 'middle',
												}}
												title="Edit User"
												onClick={() => {
													setEditUser(u);
													setEditForm({
														firstName: u.firstName || '',
														lastName: u.lastName || '',
														email: u.email || '',
														phoneNumber: u.phoneNumber || '',
														role: u.role || '',
														verification_status: u.verification_status || 'PENDING',
													});
													setEditModalOpen(true);
												}}
											>
												{/* Edit (pencil) icon SVG */}
												<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M4 13.5V16H6.5L14.87 7.63C15.16 7.34 15.16 6.86 14.87 6.57L13.43 5.13C13.14 4.84 12.66 4.84 12.37 5.13L4 13.5ZM16.71 6.04C17.1 5.65 17.1 5.02 16.71 4.63L15.37 3.29C14.98 2.9 14.35 2.9 13.96 3.29L13.13 4.12L15.88 6.87L16.71 6.04Z" fill="#1A237E"/>
												</svg>
											</button>
											<button
												style={{
													background: 'none',
													border: 'none',
													cursor: 'pointer',
													padding: 4,
													verticalAlign: 'middle',
												}}
												title="Delete User"
												onClick={async () => {
													if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
														await fetch(`/api/admin/users/${u.id}`, {
															method: 'DELETE',
														});
														setLoading(true);
														const res = await fetch('/api/admin/users');
														const data = await res.json();
														setUserList(
															data.map((u: any) => ({
																...u,
																firstName: u.firstName || u.first_name,
																lastName: u.lastName || u.last_name,
																phoneNumber: u.phoneNumber || u.phone_number,
																isVerified: u.isVerified ?? u.is_verified,
																createdAt: u.createdAt || u.created_at,
															}))
														);
														setLoading(false);
													}
												}}
											>
												{/* Delete (trash) icon SVG */}
												<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M6 7V15C6 15.55 6.45 16 7 16H13C13.55 16 14 15.55 14 15V7M9 10V13M11 10V13M4 7H16M8 4H12C12.55 4 13 4.45 13 5V6H7V5C7 4.45 7.45 4 8 4Z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
												</svg>
											</button>
											{u.verification_status === 'REJECTED' ? (
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
													}}
													onClick={async () => {
														if (window.confirm('Are you sure you want to unblock this user?')) {
															setLoading(true);
															try {
																const headers = await authHeaders();
																const putRes = await fetch(`/api/admin/users/${u.id}`, {
																	method: 'PUT',
																	headers: { ...headers, 'Content-Type': 'application/json' },
																	body: JSON.stringify({ verification_status: 'APPROVED' }),
																});
																if (!putRes.ok) {
																	const err = await putRes.json();
																	alert('Failed to unblock user: ' + (err.error || putRes.statusText));
																}
																const res = await fetch('/api/admin/users', { headers });
																const data = await res.json();
																setUserList(
																	data.map((u: any) => ({
																		...u,
																		firstName: u.firstName || u.first_name,
																		lastName: u.lastName || u.last_name,
																		phoneNumber: u.phoneNumber || u.phone_number,
																		isVerified: u.isVerified ?? u.is_verified,
																		createdAt: u.createdAt || u.created_at,
																	}))
																);
															} catch (e) {
																alert('Error unblocking user.');
															}
															setLoading(false);
														}
													}}
												>
													Unblock
												</button>
											) : (
												<button
													style={{
														background: '#EF4444',
														color: '#fff',
														border: 'none',
														borderRadius: 6,
														padding: '6px 14px',
														fontWeight: 600,
														cursor: 'pointer',
														minWidth: 70,
													}}
													onClick={async () => {
														if (window.confirm('Are you sure you want to block this user as fraud?')) {
															setLoading(true);
															try {
																const headers = await authHeaders();
																const putRes = await fetch(`/api/admin/users/${u.id}`, {
																	method: 'PUT',
																	headers: { ...headers, 'Content-Type': 'application/json' },
																	body: JSON.stringify({ verification_status: 'REJECTED' }),
																});
																if (!putRes.ok) {
																	const err = await putRes.json();
																	alert('Failed to block user: ' + (err.error || putRes.statusText));
																}
																const res = await fetch('/api/admin/users', { headers });
																const data = await res.json();
																setUserList(
																	data.map((u: any) => ({
																		...u,
																		firstName: u.firstName || u.first_name,
																		lastName: u.lastName || u.last_name,
																		phoneNumber: u.phoneNumber || u.phone_number,
																		isVerified: u.isVerified ?? u.is_verified,
																		createdAt: u.createdAt || u.created_at,
																	}))
																);
															} catch (e) {
																alert('Error blocking user.');
															}
															setLoading(false);
														}
													}}
													disabled={u.verification_status === 'REJECTED'}
												>
													Block
												</button>
											)}
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
					<span>Showing {totalFiltered === 0 ? 0 : startIndex + 1} - {Math.min(endIndexExclusive, totalFiltered)} of {totalFiltered} users</span>
					<div style={{ display: 'flex', gap: 8 }}>
						<button
							style={{ ...paginationBtnStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
							onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
							disabled={currentPage === 1}
						>
							Previous
						</button>
						<button
							style={{ ...paginationBtnStyle, opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
							onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
							disabled={currentPage >= totalPages}
						>
							Next
						</button>
					</div>
				</div>
			</div>
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
				}
				@media (max-width: 900px) {
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
			`}</style>
			<style>{`
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

			{/* Edit User Modal */}
			{editModalOpen && (
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
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							setEditLoading(true);
															const putRes = await fetch(`/api/admin/users/${editUser.id}`, {
																method: 'PUT',
																headers: {
																	'Content-Type': 'application/json',
																	...(await authHeaders()),
																},
																body: JSON.stringify({
																	first_name: editForm.firstName,
																	last_name: editForm.lastName,
																	email: editForm.email,
																	phone_number: editForm.phoneNumber,
																	role: editForm.role,
																	verification_status: editForm.verification_status,
																}),
															});
															if (!putRes.ok) {
																const err = await putRes.json().catch(() => ({}));
																alert('Failed to update user: ' + (err.error || putRes.statusText));
																setEditLoading(false);
																return;
															}
															setEditModalOpen(false);
															setEditUser(null);
															setEditLoading(false);
															setLoading(true);
															const res = await fetch('/api/admin/users', { headers: await authHeaders() });
															if (!res.ok) {
																const err = await res.json().catch(() => ({}));
																alert('Failed to fetch users: ' + (err.error || res.statusText));
																setUserList([]);
																setLoading(false);
																return;
															}
															const data = await res.json();
															if (Array.isArray(data)) {
																setUserList(
																	data.map((u: any) => ({
																		...u,
																		firstName: u.firstName || u.first_name,
																		lastName: u.lastName || u.last_name,
																		phoneNumber: u.phoneNumber || u.phone_number,
																		isVerified: u.isVerified ?? u.is_verified,
																		createdAt: u.createdAt || u.created_at,
																	}))
																);
															} else {
																setUserList([]);
															}
															setLoading(false);
						}}
						style={{
							background: '#fff',
							borderRadius: 14,
							boxShadow: '0 4px 24px #0003',
							padding: '2rem 2.5rem',
							minWidth: 320,
							maxWidth: '90vw',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 18,
						}}
					>
						<div style={{ fontWeight: 700, fontSize: 18, color: NAVY_BLUE, marginBottom: 6 }}>
							Edit User
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
							<label>First Name</label>
							<input
								type="text"
								value={editForm.firstName}
								onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
								style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15 }}
								required
							/>
							<label>Last Name</label>
							<input
								type="text"
								value={editForm.lastName}
								onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
								style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15 }}
								required
							/>
							<label>Email</label>
							<input
								type="email"
								value={editForm.email}
								onChange={e => setEditForm({ ...editForm, email: e.target.value })}
								style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15 }}
								required
							/>
							<label>Phone Number</label>
							<input
								type="text"
								value={editForm.phoneNumber}
								onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
								style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15 }}
							/>
							<label>Role</label>
							<select
								value={editForm.role}
								onChange={e => setEditForm({ ...editForm, role: e.target.value })}
								style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15 }}
								required
							>
								<option value="DRIVER">DRIVER</option>
								<option value="CUSTOMER">CUSTOMER</option>
								<option value="ADMIN">ADMIN</option>
							</select>
							<label>Status</label>
							<select
								value={editForm.verification_status}
								onChange={e => setEditForm({ ...editForm, verification_status: e.target.value })}
								style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 15 }}
								required
							>
								<option value="APPROVED">Approved</option>
								<option value="PENDING">Pending</option>
								<option value="REJECTED">Rejected</option>
							</select>
						</div>
						<div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center' }}>
							<button
								type="button"
								onClick={() => { setEditModalOpen(false); setEditUser(null); }}
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
								disabled={editLoading}
							>
								Cancel
							</button>
							<button
								type="submit"
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
								disabled={editLoading}
							>
								{editLoading ? 'Saving...' : 'Save Changes'}
							</button>
							<button
								type="button"
								style={{
									background: NAVY_BLUE,
									color: '#fff',
									border: 'none',
									borderRadius: 8,
									padding: '10px 18px',
									fontWeight: 600,
									fontSize: 15,
									cursor: 'pointer',
									boxShadow: '0 2px 8px #1A237E22',
									transition: 'background 0.2s, box-shadow 0.2s',
								}}
								onClick={async () => {
									// Simulate fetching documents for the user
									// Replace this with your real API call if needed
									setDocs(editUser?.documents || null);
									setShowDocsModal(true);
								}}
							>
								Check Documents
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Check Documents Modal */}
			{showDocsModal && editUser && (
				<div
					style={{
						position: 'fixed',
						top: 0, left: 0, right: 0, bottom: 0,
						background: 'rgba(0,0,0,0.18)',
						zIndex: 1100,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div style={{
						background: '#fff',
						borderRadius: 18,
						boxShadow: '0 8px 32px #0004',
						padding: '2.5rem 3.5rem',
						minWidth: 520,
						maxWidth: 800,
						minHeight: 320,
						maxHeight: '90vh',
						overflowY: 'auto',
						display: 'flex',
						flexDirection: 'column',
					}}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
							<div style={{ fontWeight: 800, fontSize: 26, color: NAVY_BLUE, letterSpacing: 0.5 }}>User Documents</div>
							<button
								type="button"
								onClick={async () => {
									const content = document.getElementById('user-docs-modal-content');
									if (!content) return;
									// Wait for all images to load
									const images = content.querySelectorAll('img');
									const promises = Array.from(images).map(img => {
										if (img.complete) return Promise.resolve();
										return new Promise(resolve => {
											img.onload = img.onerror = resolve;
										});
									});
									await Promise.all(promises);
									// Use useCORS: true for external images
									const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#fff' });
									const imgData = canvas.toDataURL('image/png');
									const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
									const pageWidth = pdf.internal.pageSize.getWidth();
									const margin = 40;
									const heading = 'User Document';
									pdf.setFont('helvetica', 'bold');
									pdf.setFontSize(22);
									pdf.text(heading, pageWidth / 2, margin, { align: 'center' });
									// Add user name and user ID below heading
									pdf.setFontSize(14);
									pdf.setFont('helvetica', 'normal');
									const userName = `${editUser.firstName || ''} ${editUser.lastName || ''}`.trim();
									const userId = editUser.id || '';
									let y = margin + 22;
									if (userName) {
										pdf.text(`Name: ${userName}`, margin, y);
										y += 18;
									}
									if (userId) {
										pdf.text(`User ID: ${userId}`, margin, y);
										y += 18;
									}
									const imgWidth = pageWidth - margin * 2;
									const imgHeight = canvas.height * (imgWidth / canvas.width);
									pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight, undefined, 'FAST');
									const name = `${editUser.firstName || ''}_${editUser.lastName || ''}`.replace(/\s+/g, '_') || 'user';
									pdf.save(`${name}_documents.pdf`);
								}}
								style={{
									background: ROYAL_ORANGE,
									color: '#fff',
									border: 'none',
									borderRadius: 8,
									padding: '10px 22px',
									fontWeight: 700,
									fontSize: 16,
									cursor: 'pointer',
									boxShadow: '0 2px 8px #FF8C0022',
									transition: 'background 0.2s, box-shadow 0.2s',
								}}
							>
								Download as PDF
							</button>
						</div>
						<div style={{ marginBottom: 24, fontSize: 18, color: '#333' }}>
							<b>Role:</b> {editUser.role}
						</div>
						<div id="user-docs-modal-content" style={{ padding: 24, background: '#fff', borderRadius: 12, maxWidth: 700, margin: '0 auto', fontFamily: 'Montserrat, Arial, sans-serif' }}>
						{editUser.role === 'DRIVER' ? (
							<div>
								<div style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: '18px 32px',
									marginBottom: 18,
									alignItems: 'center',
									background: '#f8f8fa',
									borderRadius: 10,
									padding: 18,
								}}>
									<div style={{ fontSize: 17 }}><b>NIC Number:</b> <span style={{ color: '#222' }}>{docs?.nicNumber || editUser.nicNumber || 'Not provided'}</span></div>
									<div style={{ fontSize: 17 }}><b>Face Photo:</b><br />{(editUser.profile_photo_url || docs?.facePhoto) ? (
										<img src={editUser.profile_photo_url || docs?.facePhoto} alt="Face" style={{ maxWidth: 140, maxHeight: 140, borderRadius: '50%', border: '2px solid #eee', marginTop: 6 }} />
									) : <span style={{ color: '#888' }}>Not uploaded</span>}</div>
									<div style={{ fontSize: 17 }}><b>Driver Licence Number:</b> <span style={{ color: '#222' }}>{docs?.licenceNumber || 'Not uploaded'}</span></div>
									<div style={{ fontSize: 17 }}><b>Licence Expiry Date:</b> <span style={{ color: '#222' }}>{docs?.licenceExpiry || 'Not uploaded'}</span></div>
									<div style={{ fontSize: 17, gridColumn: '1/3' }}><b>Vehicle Documents:</b><br />{docs?.vehicleDocs ? docs.vehicleDocs.map((v: any, i: number) => <div key={i}><a href={v.url} target="_blank" rel="noopener noreferrer">{v.name || `Document ${i+1}`}</a></div>) : <span style={{ color: '#888' }}>Not uploaded</span>}</div>
									<div style={{ fontSize: 17, gridColumn: '1/3' }}><b>Other Documents:</b><br />{docs?.otherDocs ? docs.otherDocs.map((d: any, i: number) => <div key={i}><a href={d.url} target="_blank" rel="noopener noreferrer">{d.name || `Document ${i+1}`}</a></div>) : <span style={{ color: '#888' }}>None</span>}</div>
								</div>
								{/* Vehicle Details Section */}
								<div style={{ marginTop: 32, paddingTop: 18, borderTop: '2px solid #e3e3e3', background: '#f8f8fa', borderRadius: 10, padding: 18 }}>
									<div style={{ fontWeight: 800, fontSize: 22, color: '#1A237E', marginBottom: 18 }}>Vehicle Details</div>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', alignItems: 'center' }}>
										<div style={{ fontSize: 17 }}><b>Make:</b> <span style={{ color: '#222' }}>{editUser.vehicle_make || docs?.vehicleMake || 'Not provided'}</span></div>
										<div style={{ fontSize: 17 }}><b>Model:</b> <span style={{ color: '#222' }}>{editUser.vehicle_model || docs?.vehicleModel || 'Not provided'}</span></div>
										<div style={{ fontSize: 17 }}><b>Plate Number:</b> <span style={{ color: '#222' }}>{editUser.vehicle_plate_number || docs?.vehiclePlateNumber || 'Not provided'}</span></div>
										<div style={{ fontSize: 17, gridColumn: '1/3' }}><b>Vehicle Photos:</b><br />{
											(editUser.vehicle_photos || docs?.vehiclePhotos) ?
												((editUser.vehicle_photos || docs?.vehiclePhotos).map ?
													(editUser.vehicle_photos || docs?.vehiclePhotos).map((url: string, i: number) => (
														<img key={i} src={url} alt={`Vehicle ${i+1}`} style={{ maxWidth: 200, maxHeight: 140, marginRight: 12, marginBottom: 12, borderRadius: 10, border: '2px solid #eee' }} />
													))
													: <span style={{ color: '#888' }}>Not uploaded</span>)
												: <span style={{ color: '#888' }}>Not uploaded</span>
										}</div>
									</div>
								</div>
							</div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f8f8fa', borderRadius: 10, padding: 18 }}>
								<div><b>NIC Number:</b> {docs?.nicNumber || editUser.nicNumber || 'Not provided'}</div>
								<div><b>Face Photo:</b> {(editUser.profile_photo_url || docs?.facePhoto) ? (
									<img src={editUser.profile_photo_url || docs?.facePhoto} alt="Face" style={{ maxWidth: 120, maxHeight: 120, borderRadius: '50%' }} />
								) : 'Not uploaded'}</div>
								<div><b>Other Documents:</b> {docs?.otherDocs ? docs.otherDocs.map((d: any, i: number) => <div key={i}><a href={d.url} target="_blank" rel="noopener noreferrer">{d.name || `Document ${i+1}`}</a></div>) : 'None'}</div>
							</div>
						)}
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
							<button
								type="button"
								onClick={() => setShowDocsModal(false)}
								style={{
									background: '#fff',
									border: `2px solid #1A237E33`,
									borderRadius: 10,
									padding: '12px 32px',
									fontWeight: 700,
									fontSize: 18,
									color: NAVY_BLUE,
									cursor: 'pointer',
									transition: 'background 0.2s, border 0.2s',
								}}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// Dummy StatCard for completeness

// Add the update button to the end of the main component
// (This ensures it appears on all pages for easy access)
export default UserManagement;
const StatCard = ({ title, value, desc, color }: { title: string, value: string, desc: string, color: string }) => (
	<div style={{
		background: '#F8F6F4',
		borderRadius: 12,
		padding: '1.2rem 1.5rem',
		minWidth: 180,
		flex: 1,
		boxShadow: '0 1px 6px #0001',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyContent: 'center',
		marginBottom: 8,
	}}>
		<div style={{ fontWeight: 700, fontSize: 16, color }}>{title}</div>
		<div style={{ fontWeight: 800, fontSize: 28, color, margin: '6px 0' }}>{value}</div>
		<div style={{ color: '#7B7B93', fontSize: 13 }}>{desc}</div>
	</div>
);

