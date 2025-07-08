import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

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

  // Get the JWT from the Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Initialize Supabase client with the anon key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } }
    }
  );

  // Verify the user is authenticated and is an admin
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }

  // Check if user is an admin (assuming role is stored in user metadata)
  if (user.user_metadata.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // For admin operations, use service role key to bypass RLS
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Update only the status field
  const { data, error } = await adminSupabase
    .from('profiles')
    .update({ is_verified: status === 'verified' })
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ user: data });
} 