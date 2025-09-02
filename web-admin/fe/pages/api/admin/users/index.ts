import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ensureAdmin } from '../../../../lib/serverAuth';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await ensureAdmin(req, res))) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
} 