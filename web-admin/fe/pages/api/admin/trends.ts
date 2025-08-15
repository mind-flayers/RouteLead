import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get data starting from March to current month
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-based (0 = January, 1 = February, etc.)
    const currentYear = now.getFullYear();
    
    // Calculate how many months to go back to reach March
    // If current month is before March, go back to March of previous year
    const marchMonth = 2; // 0-based (2 = March)
    
    let startYear = currentYear;
    let monthsToFetch = 0;
    
    if (currentMonth >= marchMonth) {
      // Current month is March or later in the same year
      monthsToFetch = currentMonth - marchMonth + 1; // +1 to include current month
    } else {
      // Current month is before March, so go back to March of previous year
      startYear = currentYear - 1;
      monthsToFetch = (12 - marchMonth) + currentMonth + 1;
    }
    
    const monthlyData: any[] = [];

    // Generate dates starting from March
    for (let i = 0; i < monthsToFetch; i++) {
      // Calculate the month index (0-11) for the current iteration
      const monthIndex = (marchMonth + i) % 12;
      const year = startYear + Math.floor((marchMonth + i) / 12);
      
      const startOfMonth = new Date(year, monthIndex, 1);
      // Use FIRST DAY OF NEXT MONTH as exclusive upper bound to include full current month
      const startOfNextMonth = new Date(year, monthIndex + 1, 1);

      const startDate = startOfMonth.toISOString();
      const endDate = startOfNextMonth.toISOString();
      
      // Month name (Mar, Apr, etc.)
      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });
      
      // Fetch data for this month
      const [userCount, routeCount, bidCount, revenueTotal] = await Promise.all([
        getUserCountForMonth(startDate, endDate),
        getRouteCountForMonth(startDate, endDate),
        getBidCountForMonth(startDate, endDate),
        getRevenueForMonth(startDate, endDate)
      ]);
      
      monthlyData.push({
        month: monthName,
        users: userCount,
        routes: routeCount,
        bids: bidCount,
        revenue: revenueTotal
      });
    }

    return res.status(200).json({ trends: monthlyData });
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

async function getUserCountForMonth(startDate: string, endDate: string): Promise<number> {
  const { count, error } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'ADMIN')
    .gte('created_at', startDate)
    .lt('created_at', endDate);
  
  if (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
  
  return count || 0;
}

async function getRouteCountForMonth(startDate: string, endDate: string): Promise<number> {
  // Use the 'return_routes' table which is the correct table based on the routes API
  try {
    const { count, error } = await adminSupabase
      .from('return_routes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lt('created_at', endDate);
    
    if (error) {
      console.error('Error getting return_routes count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Unexpected error in getRouteCountForMonth:', error);
    return 0;
  }
}

async function getBidCountForMonth(startDate: string, endDate: string): Promise<number> {
  const { count, error } = await adminSupabase
    .from('bids')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lt('created_at', endDate);
  
  if (error) {
    console.error('Error getting bid count:', error);
    return 0;
  }
  
  return count || 0;
}

async function getRevenueForMonth(startDate: string, endDate: string): Promise<number> {
  try {
    const { data, error } = await adminSupabase
      .from('earnings')
      .select('app_fee, earned_at')
      .gte('earned_at', startDate)
      .lt('earned_at', endDate);
    if (error) {
      console.error('Error getting revenue for month:', error);
      return 0;
    }
    const total = (data || []).reduce((sum: number, row: any) => {
      const v = typeof row.app_fee === 'string' ? parseFloat(row.app_fee) : Number(row.app_fee || 0);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
    return Math.round(total);
  } catch (e) {
    console.error('Unexpected error in getRevenueForMonth:', e);
    return 0;
  }
}
