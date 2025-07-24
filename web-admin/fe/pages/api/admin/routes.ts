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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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