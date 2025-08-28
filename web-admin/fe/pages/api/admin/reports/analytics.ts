import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Accept optional range param, default last 12 months
    const { range } = req.query;

    // Compute trends similar to /api/admin/trends
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const marchMonth = 2;
    let startYear = currentYear;
    let monthsToFetch = 0;
    if (typeof range === 'string') {
      const map: Record<string, number> = { '30d': 1, '90d': 3, '180d': 6, '1y': 12, 'all': 0 };
      if (range in map && map[range] > 0) {
        monthsToFetch = map[range];
        startYear = currentYear;
      }
    }
    if (monthsToFetch === 0) {
      if (currentMonth >= marchMonth) {
        monthsToFetch = currentMonth - marchMonth + 1;
      } else {
        startYear = currentYear - 1;
        monthsToFetch = (12 - marchMonth) + currentMonth + 1;
      }
    }

    const monthlyData: Array<{ month: string; users: number; routes: number; bids: number; revenue: number } > = [];
    for (let i = 0; i < monthsToFetch; i++) {
      const monthIndex = (marchMonth + i) % 12;
      const year = startYear + Math.floor((marchMonth + i) / 12);
      const startOfMonth = new Date(year, monthIndex, 1);
      const startOfNextMonth = new Date(year, monthIndex + 1, 1);
      const startDate = startOfMonth.toISOString();
      const endDate = startOfNextMonth.toISOString();
      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });

      const [userCount, routeCount, bidCount, revenueTotal] = await Promise.all([
        getUserCountForMonth(startDate, endDate),
        getRouteCountForMonth(startDate, endDate),
        getBidCountForMonth(startDate, endDate),
        getRevenueForMonth(startDate, endDate)
      ]);

      monthlyData.push({ month: monthName, users: userCount, routes: routeCount, bids: bidCount, revenue: revenueTotal });
    }

    // Aggregate headline stats (latest snapshot)
    const [nonAdminCount, verifiedDrivers, pendingVerifications, blockedAccounts, totalRoutes, openDisputes] = await Promise.all([
      getNonAdminUserCount(),
      getVerifiedDriverCount(),
      getPendingVerificationCount(),
      getBlockedAccountCount(),
      getTotalRoutesCount(),
      getOpenDisputesCount()
    ]);

    const latest = monthlyData[monthlyData.length - 1] || { users: 0, revenue: 0 } as any;

    // Prepare PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.pdf"');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .fillColor('#1A237E')
      .text('RouteLead Analytics Report', { align: 'left' });
    doc.moveDown(0.2);
    doc
      .fontSize(10)
      .fillColor('#444444')
      .text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Key stats
    doc.fontSize(14).fillColor('#1A237E').text('Key Metrics', { underline: true });
    doc.moveDown(0.5);
    const stats: Array<[string, string | number]> = [
      ['Total Users', nonAdminCount],
      ['Verified Drivers', verifiedDrivers],
      ['Pending Verifications', pendingVerifications],
      ['Blocked Accounts', blockedAccounts],
      ['Total Routes Posted', totalRoutes],
      ['New Users (This Month)', latest.users || 0],
      ['Revenue (This Month)', `Rs.${latest.revenue || 0}`],
      ['Open Disputes', openDisputes]
    ];

    stats.forEach(([label, value]) => {
      doc.fontSize(11).fillColor('#000000').text(`${label}: ${value}`);
    });
    doc.moveDown();

    // Trends table
    doc.fontSize(14).fillColor('#1A237E').text('Monthly Trends', { underline: true });
    doc.moveDown(0.5);
    const header = ['Month', 'Users', 'Routes', 'Bids', 'Revenue'];
    const colWidths = [90, 90, 90, 90, 90];
    const startX = doc.x;
    const startY = doc.y;

    // Header row
    doc.fontSize(11).fillColor('#000000');
    header.forEach((h, i) => {
      doc.text(h, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, { width: colWidths[i], continued: i < header.length - 1 });
    });
    doc.moveDown(0.5);

    // Rows
    monthlyData.forEach((row) => {
      const values = [row.month, String(row.users), String(row.routes), String(row.bids), `Rs.${row.revenue}`];
      values.forEach((v, i) => {
        doc.text(v, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), doc.y, { width: colWidths[i], continued: i < values.length - 1 });
      });
      doc.moveDown(0.2);
    });

    doc.end();
  } catch (error) {
    console.error('Error generating analytics PDF:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate report' });
    }
    res.end();
  }
}

async function getNonAdminUserCount(): Promise<number> {
  const { count } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'ADMIN');
  return count || 0;
}

async function getVerifiedDriverCount(): Promise<number> {
  const { count } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'ADMIN')
    .eq('role', 'DRIVER')
    .eq('verification_status', 'APPROVED');
  return count || 0;
}

async function getPendingVerificationCount(): Promise<number> {
  // Count PENDING or NULL verification_status among non-admins
  const [{ count: pendingCount }, { count: nullCount }] = await Promise.all([
    adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'ADMIN')
      .eq('verification_status', 'PENDING'),
    adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'ADMIN')
      .is('verification_status', null)
  ]);
  return (pendingCount || 0) + (nullCount || 0);
}

async function getBlockedAccountCount(): Promise<number> {
  const { count } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'ADMIN')
    .eq('verification_status', 'REJECTED');
  return count || 0;
}

async function getTotalRoutesCount(): Promise<number> {
  const { count } = await adminSupabase
    .from('return_routes')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

async function getOpenDisputesCount(): Promise<number> {
  const { count } = await adminSupabase
    .from('disputes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'OPEN');
  return count || 0;
}

async function getUserCountForMonth(startDate: string, endDate: string): Promise<number> {
  const { count } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'ADMIN')
    .gte('created_at', startDate)
    .lt('created_at', endDate);
  return count || 0;
}

async function getRouteCountForMonth(startDate: string, endDate: string): Promise<number> {
  const { count } = await adminSupabase
    .from('return_routes')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lt('created_at', endDate);
  return count || 0;
}

async function getBidCountForMonth(startDate: string, endDate: string): Promise<number> {
  const { count, error } = await adminSupabase
    .from('bids')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lt('created_at', endDate);
  if (error) {
    return 0;
  }
  return count || 0;
}

async function getRevenueForMonth(startDate: string, endDate: string): Promise<number> {
  const { data, error } = await adminSupabase
    .from('earnings')
    .select('app_fee, earned_at')
    .gte('earned_at', startDate)
    .lt('earned_at', endDate);
  if (error) {
    return 0;
  }
  const total = (data || []).reduce((sum: number, row: any) => {
    const v = typeof row.app_fee === 'string' ? parseFloat(row.app_fee) : Number(row.app_fee || 0);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  return Math.round(total);
}


