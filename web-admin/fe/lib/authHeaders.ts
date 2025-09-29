import { supabase } from './supabaseClient';
// Helper to decode JWT and log user id
function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    console.log('[authHeaders] Decoded JWT payload:', decoded);
    return decoded;
  } catch (e) {
    console.log('[authHeaders] Failed to decode JWT:', e);
    return null;
  }
}

export async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  console.log('[authHeaders] Supabase access token:', token);
  if (token) decodeJwt(token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}


