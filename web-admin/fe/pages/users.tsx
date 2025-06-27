'use client';
import React, { useState } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';
const users = [
	{
	  id: 'U001',
	  name: 'Nimal Perera',
	  email: 'nimal.p@slmail.com',
	  role: 'Driver',
	  status: 'Active',
	  verification: 'Verified',
	  registered: '2023-01-10',
	},
	{
	  id: 'U002',
	  name: 'Kavindi Jayasinghe',
	  email: 'kavindi.j@slmail.com',
	  role: 'Customer',
	  status: 'Active',
	  verification: 'Verified',
	  registered: '2023-02-12',
	},
	{
	  id: 'U003',
	  name: 'Suresh Fernando',
	  email: 'suresh.f@slmail.com',
	  role: 'Driver',
	  status: 'Pending',
	  verification: 'Pending',
	  registered: '2023-03-01',
	},
	{
	  id: 'U004',
	  name: 'Ishara Ranasinghe',
	  email: 'ishara.r@slmail.com',
	  role: 'Customer',
	  status: 'Suspended',
	  verification: 'Verified',
	  registered: '2023-03-19',
	},
	{
	  id: 'U005',
	  name: 'Nadeesha Karunaratne',
	  email: 'nadeesha.k@slmail.com',
	  role: 'Driver',
	  status: 'Active',
	  verification: 'Rejected',
	  registered: '2023-04-06',
	},
	{
	  id: 'U006',
	  name: 'Sajith Bandara',
	  email: 'sajith.b@slmail.com',
	  role: 'Customer',
	  status: 'Active',
	  verification: 'Verified',
	  registered: '2023-04-20',
	},
	{
	  id: 'U007',
	  name: 'Thilini Dissanayake',
	  email: 'thilini.d@slmail.com',
	  role: 'Driver',
	  status: 'Blocked',
	  verification: 'Verified',
	  registered: '2023-05-02',
	},
	{
	  id: 'U008',
	  name: 'Mohan de Silva',
	  email: 'mohan.d@slmail.com',
	  role: 'Customer',
	  status: 'Active',
	  verification: 'Pending',
	  registered: '2023-05-15',
	},
  ];
  

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
	Driver: NAVY_BLUE,
	Customer: ROYAL_ORANGE,
};

const roleOptions = ['All Roles', 'Driver', 'Customer'];
const statusOptions = ['Active', 'Pending', 'Suspended', 'Blocked'];
const verificationOptions = ['Verified', 'Pending', 'Rejected'];

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


const StatCard: React.FC<{ title: string, value: string, desc: string, color: string }> = ({ title, value, desc, color }) => {
	const [show, setShow] = useState(false);

	return (
		<div
			style={{
				background: '#fff',
				borderRadius: 12,
				boxShadow: '0 2px 12px #0001',
				padding: '1.2rem 2rem',
				minWidth: 180,
				minHeight: 80,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: 4,
				position: 'relative',
				flex: 1,
				maxWidth: 260,
			}}
		>
			<div style={{ fontWeight: 700, fontSize: 18, color: '#222' }}>{title}</div>
			<div style={{ fontWeight: 800, fontSize: 26, color }}>{value}</div>
			<div style={{ fontSize: 13, color: '#7B7B93' }}>{desc}</div>
			<a
				style={{
					color,
					fontWeight: 600,
					fontSize: 14,
					marginTop: 2,
					cursor: 'pointer',
					textDecoration: 'none'
				}}
				onClick={() => setShow(s => !s)}
			>
				View Details
			</a>
			{show && (
				<div style={{
					position: 'absolute',
					top: '100%',
					left: 0,
					marginTop: 8,
					background: '#fff',
					border: `1px solid ${color}33`,
					borderRadius: 10,
					boxShadow: '0 4px 24px #0002',
					padding: '1rem 1.5rem',
					zIndex: 10,
					minWidth: 220,
				}}>
					<div style={{ fontWeight: 700, color, marginBottom: 6 }}>{title} Details</div>
					<div style={{ color: '#444', fontSize: 15 }}>
						{title === 'Total Users' && <>There are <b>{value}</b> users registered in the system.</>}
						{title === 'Active Drivers' && <>There are <b>{value}</b> drivers currently active.</>}
						{title === 'Pending Verifications' && <>There are <b>{value}</b> users awaiting verification.</>}
						{title === 'Blocked Accounts' && <>There are <b>{value}</b> permanently suspended users.</>}
					</div>
					<button
						style={{
							marginTop: 12,
							background: color,
							color: '#fff',
							border: 'none',
							borderRadius: 6,
							padding: '6px 18px',
							fontWeight: 600,
							cursor: 'pointer'
						}}
						onClick={() => setShow(false)}
					>
						Close
					</button>
				</div>
			)}
		</div>
	);
};

const UserManagement: React.FC = () => {
	const [search, setSearch] = useState('');
	const [role, setRole] = useState('All Roles');
	const [status, setStatus] = useState('All Statuses');
	const [verification, setVerification] = useState('All Verification Statuses');
	const [userList, setUserList] = useState(users);
	const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
	const [verificationDropdown, setVerificationDropdown] = useState<string | null>(null);

	const handleReset = () => {
		setSearch('');
		setRole('All Roles');
		setStatus('All Statuses');
		setVerification('All Verification Statuses');
	};

	const handleStatusChange = (id: string, newStatus: string) => {
		setUserList(prev =>
			prev.map(u => u.id === id ? { ...u, status: newStatus } : u)
		);
		setStatusDropdown(null);
	};

	const handleVerificationChange = (id: string, newVerification: string) => {
		setUserList(prev =>
			prev.map(u => u.id === id ? { ...u, verification: newVerification } : u)
		);
		setVerificationDropdown(null);
	};

	const filteredUsers = userList.filter((u) => {
		const matchesSearch =
			u.name.toLowerCase().includes(search.toLowerCase()) ||
			u.email.toLowerCase().includes(search.toLowerCase()) ||
			u.id.toLowerCase().includes(search.toLowerCase());

		const matchesRole = role === 'All Roles' || u.role === role;
		const matchesStatus = status === 'All Statuses' || u.status === status;
		const matchesVerification = verification === 'All Verification Statuses' || u.verification === verification;

		return matchesSearch && matchesRole && matchesStatus && matchesVerification;
	});



	// Stat counts based on filteredUsers
	const totalUsers = filteredUsers.length;
	const activeDrivers = filteredUsers.filter(u => u.role === 'Driver' && u.status === 'Active').length;
	const pendingVerifications = filteredUsers.filter(u => u.verification === 'Pending').length;
	const blockedAccounts = filteredUsers.filter(u => u.status === 'Blocked').length;

	return (
		<div style={{
			padding: '0 0 2rem 0',
			width: '100%',
			maxWidth: 1200,
			margin: '0 auto',
			boxSizing: 'border-box'
		}}>
			{/* Add space above heading */}
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
			{/* Stat Cards */}
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
				<StatCard title="Active Drivers" value={String(activeDrivers)} desc="Drivers currently active" color={ROYAL_ORANGE} />
				<StatCard title="Pending Verifications" value={String(pendingVerifications)} desc="Documents awaiting review" color={ROYAL_ORANGE} />
				<StatCard title="Blocked Accounts" value={String(blockedAccounts)} desc="Permanently suspended users" color="#EF4444" />
			</div>
			{/* Filters and Add User in same row */}
			{/* Table */}
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
						<select style={filterSelectStyle} value={status} onChange={e => setStatus(e.target.value)}>
							<option value="All Statuses">All Statuses</option>
							{statusOptions.map(opt => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
						<select style={filterSelectStyle} value={verification} onChange={e => setVerification(e.target.value)}>
							<option value="All Verification Statuses">All Verification Statuses</option>
							{verificationOptions.map(opt => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
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

				<table style={{
					width: '100%',
					minWidth: 700,
					borderCollapse: 'separate',
					borderSpacing: 0,
					fontFamily: 'Montserrat, sans-serif'
				}}>
					<thead>
						<tr style={{ color: '#7B7B93', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
							<th style={thStyle}>ID</th>
							<th style={thStyle}>Name</th>
							<th style={thStyle}>Email</th>
							<th style={thStyle}>Role</th>
							<th style={thStyle}>Status</th>
							<th style={thStyle}>Verification</th>
							<th style={thStyle}>Registered</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map((u) => (
							<tr key={u.id} style={rowStyle}>
								<td style={cellStyle}>{u.id}</td>
								<td style={{ ...cellStyle, fontWeight: 600 }}>{u.name}</td>
								<td style={cellStyle}>{u.email}</td>
								<td style={cellStyle}>
									<span style={labelButtonStyle(roleColors[u.role])}>{u.role}</span>
								</td>
								<td style={{ ...cellStyle, position: 'relative' }}>
									<span
										style={labelButtonStyle(statusColors[u.status], !!(statusDropdown === u.id))}
										title="Change status"
										onClick={() => setStatusDropdown(statusDropdown === u.id ? null : u.id)}
									>
										{u.status}
									</span>
									{statusDropdown === u.id && (
										<div
											style={{
												position: 'absolute',
												top: 48,
												left: 0,
												background: '#fff',
												border: `1.5px solid ${statusColors[u.status]}33`,
												borderRadius: 8,
												boxShadow: '0 4px 24px #0002',
												zIndex: 20,
												minWidth: 110,
												padding: '6px 0'
											}}
										>
											{statusOptions.map(opt => (
												<div
													key={opt}
													style={labelButtonStyle(statusColors[opt], u.status === opt)}
													onClick={() => handleStatusChange(u.id, opt)}
												>
													{opt}
												</div>
											))}
										</div>
									)}
								</td>
								<td style={{ ...cellStyle, position: 'relative' }}>
									<span
										style={labelButtonStyle(verificationColors[u.verification], !!(verificationDropdown === u.id))}
										title="Change verification"
										onClick={() => setVerificationDropdown(verificationDropdown === u.id ? null : u.id)}
									>
										{u.verification}
									</span>
									{verificationDropdown === u.id && (
										<div
											style={{
												position: 'absolute',
												top: 48,
												left: 0,
												background: '#fff',
												border: `1.5px solid ${verificationColors[u.verification]}33`,
												borderRadius: 8,
												boxShadow: '0 4px 24px #0002',
												zIndex: 20,
												minWidth: 110,
												padding: '6px 0'
											}}
										>
											{verificationOptions.map(opt => (
												<div
													key={opt}
													style={labelButtonStyle(verificationColors[opt], u.verification === opt)}
													onClick={() => handleVerificationChange(u.id, opt)}
												>
													{opt}
												</div>
											))}
										</div>
									)}
								</td>
								<td style={cellStyle}>{u.registered}</td>
							</tr>
						))}
					</tbody>
				</table>
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
					<span>Showing 1 - {filteredUsers.length} of {users.length} users</span>
					<div style={{ display: 'flex', gap: 8 }}>
						<button style={paginationBtnStyle}>Previous</button>
						<button style={paginationBtnStyle}>Next</button>
					</div>
				</div>
			</div>
			{/* Responsive Table Notice */}
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

export default UserManagement;
