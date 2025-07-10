import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Join return_routes with profiles to get driver name
  const { data, error } = await supabase
    .from('return_routes')
    .select(`
      *,
      driver:driver_id (
        first_name,
        last_name
      )
    `)
    .eq('status', 'OPEN');

  console.log(JSON.stringify(data, null, 2)); // <-- Add this line

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ routes: data });
} 