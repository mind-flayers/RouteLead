import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export async function ensureAdmin(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  try {
    const auth = req.headers['authorization'] || req.headers['Authorization' as any];
    if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }
    const token = auth.substring(7);

    // Validate user session using anon key with provided token
    const userScoped = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userScoped.auth.getUser();
    if (userErr || !userData?.user) {
      res.status(401).json({ error: 'Invalid session' });
      return false;
    }

    // Fetch role securely using service role key
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile, error: profErr } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    if (profErr) {
      res.status(403).json({ error: 'Profile not found' });
      return false;
    }
    if ((profile?.role || '').toUpperCase() !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return false;
    }
    return true;
  } catch (e) {
    res.status(500).json({ error: 'Auth validation failed' });
    return false;
  }
}


