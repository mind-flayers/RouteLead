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
    // Get all disputes
    const { data: disputes, error } = await adminSupabase
      .from('disputes')
      .select('*');
    
    if (error) {
      throw error;
    }

    // If dispute type is being removed from admin, return empty categories for now
    return res.status(200).json({ categories: [] });
  } catch (error) {
    console.error('Error fetching dispute categories:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
