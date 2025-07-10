'use client';
import React, { useState, useEffect } from 'react';

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
	const [search, setSearch] = useState('');
	const [role, setRole] = useState('All Roles');
	const [status, setStatus] = useState('All Statuses');
	const [verification, setVerification] = useState('All Verification Statuses');
	const [userList, setUserList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
	const [verificationDropdown, setVerificationDropdown] = useState<string | null>(null);

	useEffect(() => {
		async function fetchUsers() {
			setLoading(true);
			try {
				const res = await fetch('/api/admin/users');
				const data = await res.json();
				// Map snake_case to camelCase and exclude admin users
				setUserList(
					data
						.filter((u: any) => u.role !== 'ADMIN') // Exclude admin users
						.map((u: any) => ({
							...u,
							firstName: u.firstName || u.first_name,
							lastName: u.lastName || u.last_name,
							phoneNumber: u.phoneNumber || u.phone_number,
							isVerified: u.isVerified ?? u.is_verified,
							createdAt: u.createdAt || u.created_at,
						}))
				);
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
	};

	// Optionally, you can implement status/verification change logic for real data here

	const filteredUsers = userList.filter((u) => {
		const name = (u.firstName || '') + ' ' + (u.lastName || '');
		const matchesSearch =
			name.toLowerCase().includes(search.toLowerCase()) ||
			(u.email || '').toLowerCase().includes(search.toLowerCase()) ||
			(u.id || '').toLowerCase().includes(search.toLowerCase());
		const matchesRole = role === 'All Roles' || u.role === role;
		// You may want to map your real status/verification fields here
		return matchesSearch && matchesRole;
	});

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
								<th style={thStyle}>Verified</th>
								<th style={thStyle}>Status</th>
								<th style={thStyle}>Registered</th>
								<th style={thStyle}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.map((u) => (
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
											{u.verification_status || 'APPROVED'}
										</span>
									</td>
									<td style={cellStyle}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
									<td style={cellStyle}>
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
													marginRight: 8,
												}}
												onClick={async () => {
													if (window.confirm('Are you sure you want to unblock this user?')) {
														await fetch(`/api/admin/users/${u.id}`, {
															method: 'PUT',
															headers: { 'Content-Type': 'application/json' },
															body: JSON.stringify({ verification_status: 'APPROVED' }),
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
												}}
												onClick={async () => {
													if (window.confirm('Are you sure you want to block this user as fraud?')) {
														await fetch(`/api/admin/users/${u.id}`, {
															method: 'PUT',
															headers: { 'Content-Type': 'application/json' },
															body: JSON.stringify({ verification_status: 'REJECTED' }),
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
												disabled={u.verification_status === 'REJECTED'}
											>
												Block
											</button>
										)}
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
					<span>Showing 1 - {filteredUsers.length} of {userList.length} users</span>
					<div style={{ display: 'flex', gap: 8 }}>
						<button style={paginationBtnStyle}>Previous</button>
						<button style={paginationBtnStyle}>Next</button>
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
		</div>
	);
};

// Dummy StatCard for completeness
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

export default UserManagement;
