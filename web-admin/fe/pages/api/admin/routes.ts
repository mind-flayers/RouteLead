import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

async function reverseGeocode(lat: number, lng: number) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Geocoding failed:', res.status, res.statusText);
      return '';
    }
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return '';
  } catch (e) {
    console.error('Geocoding error:', e);
    return '';
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
    const origin_name = await reverseGeocode(data.origin_lat, data.origin_lng);
    const destination_name = await reverseGeocode(data.destination_lat, data.destination_lng);
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
    const origin_name = await reverseGeocode(data.origin_lat, data.origin_lng);
    const destination_name = await reverseGeocode(data.destination_lat, data.destination_lng);
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
    const origin_name = await reverseGeocode(route.origin_lat, route.origin_lng);
    const destination_name = await reverseGeocode(route.destination_lat, route.destination_lng);
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