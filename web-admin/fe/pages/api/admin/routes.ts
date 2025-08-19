import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

// Prefer backend API for place names; fallback to Google if needed
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

async function fetchPlaceNames(originLat: number, originLng: number, destLat: number, destLng: number) {
  try {
    const url = `${BACKEND_BASE_URL}/api/routes/directions?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { origin_name: '', destination_name: '' };
    }
    const data = await res.json();
    const first = Array.isArray(data.routes) && data.routes.length > 0 ? data.routes[0] : null;
    return {
      origin_name: first?.start_address || '',
      destination_name: first?.end_address || ''
    };
  } catch (e) {
    return { origin_name: '', destination_name: '' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // POST /api/admin/routes - create a new route
    const {
      driver_id,
      origin_lat,
      origin_lng,
      destination_lat,
      destination_lng,
      departure_time,
      detour_tolerance_km,
      suggested_price_min,
      suggested_price_max,
      status
    } = req.body;

    // Basic validation
    if (!driver_id || !origin_lat || !origin_lng || !destination_lat || !destination_lng || !departure_time || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await adminSupabase
      .from('return_routes')
      .insert([
        {
          driver_id,
          origin_lat,
          origin_lng,
          destination_lat,
          destination_lng,
          departure_time,
          detour_tolerance_km: detour_tolerance_km ?? 0,
          suggested_price_min: suggested_price_min ?? 0,
          suggested_price_max: suggested_price_max ?? 0,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Optionally reverse geocode for the response
    const { origin_name, destination_name } = await fetchPlaceNames(data.origin_lat, data.origin_lng, data.destination_lat, data.destination_lng);
    const route = {
      ...data,
      origin_name,
      destination_name,
    };
    return res.status(201).json({ route });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  if (id) {
    // GET /api/admin/routes?id=... (single route)
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Route ID must be a string' });
    }
    const { data, error } = await adminSupabase
      .from('return_routes')
      .select(`*, profiles:driver_id (first_name, last_name)`)
      .eq('id', id)
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: 'Route not found' });
    }
    const { origin_name, destination_name } = await fetchPlaceNames(data.origin_lat, data.origin_lng, data.destination_lat, data.destination_lng);
    const route = {
      ...data,
      driver: data.profiles,
      profiles: undefined,
      origin_name,
      destination_name,
    };
    return res.status(200).json({ route });
  }

  // GET /api/admin/routes (all routes)
  const { data, error } = await adminSupabase
    .from('return_routes')
    .select(`
      *,
      profiles:driver_id (
        first_name,
        last_name
      )
    `);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Reverse geocode origin and destination for each route
  const routes = await Promise.all((data || []).map(async (route) => {
    const { origin_name, destination_name } = await fetchPlaceNames(route.origin_lat, route.origin_lng, route.destination_lat, route.destination_lng);
    return {
      ...route,
      driver: route.profiles,
      profiles: undefined,
      origin_name,
      destination_name,
    };
  }));

  return res.status(200).json({ routes });
} 