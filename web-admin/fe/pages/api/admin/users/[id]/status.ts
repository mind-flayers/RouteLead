import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body: { status }
  } = req;

  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!id) {
    return res.status(400).json({ error: 'User id is required in the URL.' });
  }

  if (!status) {
    return res.status(400).json({ error: 'Status is required in the request body.' });
  }

  // For testing: skip authentication and admin check
  try {
  const { data, error } = await adminSupabase
    .from('profiles')
    .update({ is_verified: status === 'verified' })
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ user: data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
} 