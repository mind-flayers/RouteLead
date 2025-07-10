import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body: updateData
  } = req;

  console.log('ID:', id);
  console.log('Method:', method);

  if (method === 'GET') {
    // Fetch user by ID using service role
    try {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.status(200).json({ user: data });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  if (method === 'DELETE') {
    // Delete user by ID using service role
    try {
      const { data, error } = await adminSupabase
        .from('profiles')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'User not found or already deleted.' });
      }
      return res.status(200).json({ message: 'User deleted successfully.', user: data[0] });
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  if (method !== 'PUT') {
    res.setHeader('Allow', ['PUT', 'GET', 'DELETE']);
    return res.status(405).json({ error: `Method ${method} Not Allowed. Use PUT, GET, or DELETE method.` });
  }

  if (!id) {
    return res.status(400).json({ error: 'User id is required in the URL.' });
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'Update data is required in the request body.' });
  }

  // Robust mapping: support both camelCase and snake_case
  const mappedUpdateData: Record<string, any> = { ...updateData };
  if (updateData.verificationStatus) {
    mappedUpdateData.verification_status = updateData.verificationStatus;
    delete mappedUpdateData.verificationStatus;
  }
  if (updateData.verification_status) {
    mappedUpdateData.verification_status = updateData.verification_status;
  }

  try {
    const { data, error } = await adminSupabase
      .from('profiles')
      .update(mappedUpdateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ user: data && data.length > 0 ? data[0] : null, message: 'Update attempted.' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}