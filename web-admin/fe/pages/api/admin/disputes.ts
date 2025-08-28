import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ensureAdmin } from '../../../lib/serverAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await ensureAdmin(req, res))) return;
  // GET /api/admin/disputes/:id
  if (req.method === 'GET' && req.query.id) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid dispute id' });
    }
    const { data, error } = await adminSupabase
      .from('disputes')
      .select(`
        *, 
        claimant_profile:profiles!user_id(first_name),
        return_routes!related_route_id(
          driver_id,
          driver_profile:profiles!driver_id(first_name)
        )
      `)
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return res.status(404).json({ error: 'Dispute not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ dispute: data });
  }

  // GET /api/admin/disputes
  if (req.method === 'GET') {
    // Get all disputes with claimant first name and respondent driver info
    const { data, error } = await adminSupabase
      .from('disputes')
      .select(`
        *, 
        claimant_profile:profiles!user_id(first_name),
        return_routes!related_route_id(
          driver_id,
          driver_profile:profiles!driver_id(first_name)
        )
      `);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ disputes: data });
  }

  // POST /api/admin/disputes
  if (req.method === 'POST') {
    // Create a new dispute
    const { user_id, related_bid_id, related_route_id, description, status, resolved_at } = req.body;
    if (!user_id || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await adminSupabase
      .from('disputes')
      .insert([
        {
          user_id,
          related_bid_id: related_bid_id || null,
          related_route_id: related_route_id || null,
          description,
          status: status || 'OPEN',
          resolved_at: resolved_at || null,
          // created_at is handled by DB default
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ dispute: data[0] });
  }

  // DELETE /api/admin/disputes?id=DISPUTE_ID
  if (req.method === 'DELETE' && req.query.id) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid dispute id' });
    }
    const { error } = await adminSupabase
      .from('disputes')
      .delete()
      .eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(204).end();
  }

  // PATCH /api/admin/disputes?id=DISPUTE_ID&status=NEW_STATUS
  if (req.method === 'PATCH' && req.query.id && req.body.status) {
    const { id } = req.query;
    const { status } = req.body;
    if (!id || typeof id !== 'string' || !status) {
      return res.status(400).json({ error: 'Missing or invalid dispute id or status' });
    }
    const { data, error } = await adminSupabase
      .from('disputes')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Dispute not found' });
    }
    return res.status(200).json({ dispute: data[0] });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
