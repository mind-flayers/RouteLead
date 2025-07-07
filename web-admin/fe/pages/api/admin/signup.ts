import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password, ...profileData } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: profileData
    }
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ user: data.user });
} 