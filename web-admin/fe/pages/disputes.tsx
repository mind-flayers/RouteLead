'use client';

import React, { useState, useEffect } from 'react';

const NAVY_BLUE = '#1A237E';
const ROYAL_ORANGE = '#FF8C00';

const statusColors: { [key: string]: string } = {
	Open: '#EF4444', // Red for Open
	Pending: ROYAL_ORANGE, // Orange for Pending
	Closed: '#22C55E', // Green for Closed
	Resolved: NAVY_BLUE, // Navy for Resolved (if exists)
};

const statusBgColors: { [key: string]: string } = {
	Open: '#EF444422', // Red bg for Open
	Pending: '#FF8C0022', // Orange bg for Pending
	Closed: '#22C55E22', // Green bg for Closed
	Resolved: '#1A237E22', // Navy bg for Resolved (if exists)
};

const labelButtonStyle = (color: string, active: boolean = false, bgColor?: string): React.CSSProperties => ({
	background: bgColor || color + '22',
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

const DisputePage: React.FC = () => {
	const [disputes, setDisputes] = useState<any[]>([]);
	const [selected, setSelected] = useState<any | null>(null);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState('All');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDisputes() {
			setLoading(true);
			try {
				const res = await fetch('/api/admin/disputes');
				const data = await res.json();
				setDisputes(data.disputes || []);
				setSelected((data.disputes && data.disputes[0]) || null);
			} catch (err) {
				console.error('Error fetching disputes:', err);
			}
			setLoading(false);
		}
		fetchDisputes();
	}, []);

	// Metrics - properly count statuses regardless of case
	const openCount = disputes.filter((d) => d.status && d.status.toUpperCase() === 'OPEN').length;
	const pendingCount = disputes.filter((d) => d.status && d.status.toUpperCase() === 'PENDING').length;
	const closedCount = disputes.filter((d) => d.status && d.status.toUpperCase() === 'CLOSED').length;
	const valueImpact = disputes.reduce(
		(sum, d) => sum + (d.valueImpact || 0),
		0
	);

	const filteredDisputes = disputes.filter((d) => {
		const statusMatch = filter === 'All' || (d.status && d.status.toUpperCase() === filter.toUpperCase());
		return statusMatch && (
			d.id.toLowerCase().includes(search.toLowerCase()) ||
			(d.claimant_profile?.first_name?.toLowerCase().includes(search.toLowerCase())) ||
			(d.return_routes?.driver_profile?.first_name?.toLowerCase().includes(search.toLowerCase())) ||
			(d.type?.toLowerCase().includes(search.toLowerCase()))
		);
	});

	if (loading) {
		return <div style={{ padding: '2rem', textAlign: 'center', color: NAVY_BLUE }}>Loading disputes...</div>;
	}

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
				Disputes Management
			</h1>
			<div style={{ color: '#7B7B93', fontSize: 16, marginBottom: 18 }}>
				View, filter, and resolve all platform disputes efficiently.
			</div>
			{/* Add space above disputes content */}
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
						padding: '1.5rem 1.5rem 1rem 1.5rem',
						minWidth: 320,
						flex: 1,
						maxWidth: 1000,
						width: '100%',
						minHeight: 420,
						marginBottom: 24,
						overflowX: 'auto',
					}}
				>
					<div
						style={{
							display: 'flex',
							gap: 16,
							alignItems: 'center',
							marginBottom: 18,
							flexWrap: 'wrap',
						}}
					>
						<div style={{ display: 'flex', gap: 16, flex: 1, minWidth: 0, flexWrap: 'wrap', alignItems: 'center' }}>
							<input
								type="text"
								placeholder="Search disputes..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
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
							<select style={filterSelectStyle} value={filter} onChange={(e) => setFilter(e.target.value)}>
								<option value="All">Filter by Status</option>
								<option value="Open">Open</option>
								<option value="Pending">Pending</option>
								<option value="Closed">Closed</option>
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
								onClick={() => {
									setSearch('');
									setFilter('All');
								}}
							>
								Reset Filters
							</button>
						</div>
					</div>
					<table
						style={{
							width: '100%',
							minWidth: 600,
							borderCollapse: 'separate',
							borderSpacing: 0,
							fontFamily: 'Montserrat, sans-serif'
						}}
					>
						<thead>
							<tr style={{ color: '#7B7B93', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
								<th style={thStyle}>Claimant</th>
								<th style={thStyle}>Respondent</th>
								<th style={thStyle}>Type</th>
								<th style={thStyle}>Status</th>
								<th style={thStyle}>Date Filed</th>
							</tr>
						</thead>
						<tbody>
							{filteredDisputes.map((d) => {
								const statusKey = (d.status || '').charAt(0).toUpperCase() + (d.status || '').slice(1).toLowerCase();
								return (
									<tr
										key={d.id}
										style={{
											...rowStyle,
											cursor: 'pointer',
											background: selected.id === d.id ? '#F8F6F4' : '#fff',
											transition: 'background 0.2s',
										}}
										onClick={() => setSelected(d)}
									>
										<td style={{ ...cellStyle, fontWeight: 700, color: NAVY_BLUE }}>
											{d.claimant_profile?.first_name || d.user_id}
										</td>
										<td style={{ ...cellStyle, fontWeight: 600, color: '#444' }}>
											{d.return_routes?.driver_profile?.first_name || 'No Driver'}
										</td>
										<td style={cellStyle}>{d.type}</td>
										<td style={{ ...cellStyle, textAlign: 'center', verticalAlign: 'middle' }}>
											<span style={{
												background: statusBgColors[statusKey] || '#eee',
												color: statusColors[statusKey] || '#222',
												borderRadius: 8,
												padding: '4px 0',
												width: 110,
												display: 'inline-block',
												textAlign: 'center',
												fontWeight: 600,
												fontSize: 14,
												userSelect: 'none',
												border: '2px solid transparent',
												transition: 'background 0.2s, color 0.2s, border 0.2s',
												margin: '0 auto',
											}}>
												{d.status}
											</span>
										</td>
										<td style={cellStyle}>
										{d.created_at ? new Date(d.created_at).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										}) : 'N/A'}
									</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginTop: 16,
							color: '#7B7B93',
							fontSize: 14,
							flexWrap: 'wrap',
							gap: 8,
						}}
					>
						<span>Showing 1 - {filteredDisputes.length} of {disputes.length} disputes</span>
						<div style={{ display: 'flex', gap: 8 }}>
							<button style={{
								background: '#fff',
								border: `1px solid ${NAVY_BLUE}22`,
								borderRadius: 8,
								padding: '4px 18px',
								fontWeight: 600,
								fontSize: 15,
								color: NAVY_BLUE,
								marginLeft: 8,
								cursor: 'pointer',
							}}>Previous</button>
							<button style={{
								background: '#fff',
								border: `1px solid ${NAVY_BLUE}22`,
								borderRadius: 8,
								padding: '4px 18px',
								fontWeight: 600,
								fontSize: 15,
								color: NAVY_BLUE,
								marginLeft: 8,
								cursor: 'pointer',
							}}>Next</button>
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
				{/* Right: Metrics and Details */}
				<div
					style={{
						flex: 1,
						minWidth: 300,
						maxWidth: 420,
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
						width: '100%',
					}}
				>
					{/* Metrics */}
					<div
						style={{
							background: '#fff',
							borderRadius: 14,
							boxShadow: '0 2px 12px #0001',
							padding: 16,
							marginBottom: 0,
							display: 'flex',
							gap: 10,
							justifyContent: 'space-between',
							flexWrap: 'wrap',
						}}
					>
						<MetricCard
							label="Open Disputes"
							value={openCount}
							icon="🟢"
						/>
						<MetricCard
							label="Pending Resolution"
							value={pendingCount}
							icon="🟠"
						/>
						<MetricCard
							label="Resolved Disputes"
							value={closedCount}
							icon="🔵"
						/>
						<MetricCard
							label="Value Impact"
							value={`$${valueImpact.toFixed(2)}`}
							icon="💲"
						/>
					</div>
					{/* Details */}
					{selected && (
						<div
							style={{
								background: '#fff',
								borderRadius: 14,
								boxShadow: '0 2px 12px #0001',
								padding: 16,
								minWidth: 0,
							}}
						>
							<div
								style={{
									fontWeight: 800,
									fontSize: 17,
									color: NAVY_BLUE,
									marginBottom: 8,
								}}
							>
								Dispute #{selected.id} Details
							</div>
							<div
								style={{
									color: '#7B7B93',
									fontSize: 14,
									marginBottom: 18,
								}}
							>
								Comprehensive view of the selected dispute.
							</div>
							{/* Tabs */}
							<div
								style={{
									display: 'flex',
									gap: 0,
									borderBottom: '2px solid #F3EDE7',
									marginBottom: 18,
									flexWrap: 'wrap',
								}}
							>
								<div
									style={{
										padding: '8px 18px',
										fontWeight: 700,
										color: NAVY_BLUE,
										borderBottom: `3px solid ${NAVY_BLUE}`,
										background: '#fff',
										cursor: 'pointer',
									}}
								>
									Claim Details
								</div>
								<div
									style={{
										padding: '8px 18px',
										fontWeight: 600,
										color: '#A1A1AA',
										background: '#fff',
										cursor: 'not-allowed',
									}}
								>
									Evidence
								</div>
								<div
									style={{
										padding: '8px 18px',
										fontWeight: 600,
										color: '#A1A1AA',
										background: '#fff',
										cursor: 'not-allowed',
									}}
								>
									Communication Log
								</div>
								<div
									style={{
										padding: '8px 18px',
										fontWeight: 600,
										color: '#A1A1AA',
										background: '#fff',
										cursor: 'not-allowed',
									}}
								>
									Resolution
								</div>
							</div>
							{/* Claim Details from table data */}
							<div
								style={{
									display: 'flex',
									gap: 24,
									marginBottom: 18,
									flexWrap: 'wrap',
								}}
							>
								<div style={{ minWidth: 120, flex: 1 }}>
									<div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>
										Claimant
									</div>
									<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										<img
											src={selected.claimantAvatar}
											alt={selected.profiles?.first_name || selected.user_id}
											style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F3EDE7' }}
										/>						<div>
							<div style={{ fontWeight: 600 }}>
								{selected.claimant_profile?.first_name || selected.user_id}
							</div>
											<span
												style={{
													background: selected.claimantRole === 'Customer' ? ROYAL_ORANGE + '22' : NAVY_BLUE + '22',
													color: selected.claimantRole === 'Customer' ? ROYAL_ORANGE : NAVY_BLUE,
													borderRadius: 8,
													padding: '2px 10px',
													fontWeight: 600,
													fontSize: 13,
													marginTop: 2,
													display: 'inline-block',
												}}
											>
												{selected.claimantRole}
											</span>
										</div>
									</div>
								</div>
				<div style={{ minWidth: 120, flex: 1 }}>
					<div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>
						Respondent
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<img
							src={selected.respondentAvatar}
							alt={selected.return_routes?.driver_profile?.first_name || 'No Driver'}
							style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F3EDE7' }}
						/>
						<div>
							<div style={{ fontWeight: 600 }}>
								{selected.return_routes?.driver_profile?.first_name || 'No Driver'}
							</div>
							<span
								style={{
									background: NAVY_BLUE + '22',
									color: NAVY_BLUE,
									borderRadius: 8,
									padding: '2px 10px',
									fontWeight: 600,
									fontSize: 13,
									marginTop: 2,
									display: 'inline-block',
								}}
							>
								Driver
							</span>
						</div>
					</div>
				</div>
							</div>
							<div
								style={{
									display: 'flex',
									gap: 24,
									marginBottom: 12,
									flexWrap: 'wrap',
								}}
							>
								<div style={{ flex: 1, minWidth: 120 }}>
									<div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>
										Dispute Type
									</div>
									<div style={{ fontWeight: 600, color: NAVY_BLUE }}>
										{selected.type}
									</div>
								</div>
								<div style={{ flex: 1, minWidth: 120 }}>
									<div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>
										Date Filed
									</div>								<div style={{ fontWeight: 600, color: NAVY_BLUE }}>
									{selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									}) : 'N/A'}
								</div>
								</div>
							</div>
							<div style={{ marginBottom: 16 }}>
								<div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>
									Description
								</div>
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
										resize: 'none',
									}}
								/>
							</div>
							<div>
								<div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 4 }}>
									Current Status
								</div>
								<span
									style={{
										display: 'inline-block',
										minWidth: 70,
										textAlign: 'center',
										background: statusBgColors[selected.status],
										color: statusColors[selected.status],
										borderRadius: 16,
										fontWeight: 600,
										fontSize: 14,
										padding: '2px 16px',
									}}
								>
									{selected.status}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const MetricCard: React.FC<{
	label: string;
	value: string | number;
	icon: string;
}> = ({ label, value, icon }) => (
	<div
		style={{
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
		}}
	>
		<div style={{ fontSize: 22 }}>{icon}</div>
		<div
			style={{
				fontWeight: 800,
				fontSize: 20,
				color: NAVY_BLUE,
			}}
		>
			{value}
		</div>
		<div
			style={{
				fontSize: 13,
				color: '#7B7B93',
				textAlign: 'center',
			}}
		>
			{label}
		</div>
	</div>
);

export default DisputePage;