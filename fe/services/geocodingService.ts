// Geocoding Service for converting coordinates to place names
// Uses OpenStreetMap Nominatim API (free) with Google Maps as optional upgrade

interface GeocodingResult {
  success: boolean;
  placeName: string;
  fullAddress?: string;
  city?: string;
  area?: string;
  country?: string;
}

interface CachedLocation {
  placeName: string;
  fullAddress: string;
  timestamp: number;
}

// Cache to store geocoding results (1 hour expiry)
const geocodingCache = new Map<string, CachedLocation>();
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

// Rate limiting for Nominatim API (max 1 request per second)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

/**
 * Create a cache key from coordinates
 */
function createCacheKey(lat: number, lng: number): string {
  // Round to 4 decimal places for caching (~11m accuracy)
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/**
 * Check if cached result is still valid
 */
function isCacheValid(cached: CachedLocation): boolean {
  return Date.now() - cached.timestamp < CACHE_EXPIRY;
}

/**
 * Rate limiting delay for Nominatim API
 */
async function rateLimitDelay(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Reverse geocode using OpenStreetMap Nominatim API
 */
async function reverseGeocodeNominatim(lat: number, lng: number): Promise<GeocodingResult> {
  try {
    await rateLimitDelay();
    
    console.log(`🗺️ Reverse geocoding: ${lat}, ${lng}`);
    
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en&countrycodes=lk`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RouteLead-SriLanka/1.0 (Delivery Service)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`🗺️ Nominatim response:`, data);
    
    if (data.error) {
      throw new Error(`Nominatim error: ${data.error}`);
    }
    
    // Extract place name from address components
    const address = data.address || {};
    let placeName = '';
    let fullAddress = data.display_name || '';
    
    // Priority order for place name
    if (address.neighbourhood) {
      placeName = address.neighbourhood;
    } else if (address.suburb) {
      placeName = address.suburb;
    } else if (address.village) {
      placeName = address.village;
    } else if (address.town) {
      placeName = address.town;
    } else if (address.city) {
      placeName = address.city;
    } else if (address.county) {
      placeName = address.county;
    } else if (address.state) {
      placeName = address.state;
    } else {
      // Fallback to first part of display name
      placeName = fullAddress.split(',')[0] || 'Unknown Location';
    }
    
    // Add city context if place name is not a city
    if (address.city && placeName !== address.city) {
      placeName += `, ${address.city}`;
    }
    
    return {
      success: true,
      placeName: placeName.trim(),
      fullAddress,
      city: address.city,
      area: address.neighbourhood || address.suburb,
      country: address.country,
    };
    
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    
    // Provide meaningful fallback names for invalid coordinates
    const fallbackName = getLocationFallback(lat, lng);
    
    return {
      success: false,
      placeName: fallbackName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, // Fallback to coordinates
    };
  }
}

/**
 * Future: Google Maps Geocoding API implementation
 * Uncomment and configure when ready to use Google Maps
 */
/*
async function reverseGeocodeGoogle(lat: number, lng: number): Promise<GeocodingResult> {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Google Geocoding error: ${data.status}`);
    }
    
    const result = data.results[0];
    const components = result.address_components;
    
    // Extract relevant components
    let placeName = '';
    let city = '';
    let area = '';
    
    for (const component of components) {
      const types = component.types;
      
      if (types.includes('neighborhood') || types.includes('sublocality')) {
        area = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      }
    }
    
    placeName = area || city || result.formatted_address.split(',')[0];
    
    return {
      success: true,
      placeName,
      fullAddress: result.formatted_address,
      city,
      area,
    };
    
  } catch (error) {
    console.error('Google reverse geocoding failed:', error);
    return {
      success: false,
      placeName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
}
*/

/**
 * Get fallback location name for invalid coordinates
 */
function getLocationFallback(lat: number, lng: number): string | null {
  // Check if coordinates are within Sri Lankan bounds
  const isInSriLanka = lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 81.9;
  
  if (isInSriLanka) {
    // For valid Sri Lankan coordinates, let the API handle it
    return null;
  }
  
  // For invalid coordinates, provide a generic fallback
  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Main reverse geocoding function with caching
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Validate coordinates
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    const fallback = getLocationFallback(lat, lng);
    return fallback || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  
  // For invalid coordinates outside Sri Lanka, provide fallback
  const fallback = getLocationFallback(lat, lng);
  if (fallback) {
    return fallback;
  }
  
  const cacheKey = createCacheKey(lat, lng);
  
  // Check cache first
  const cached = geocodingCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return cached.placeName;
  }
  
  // Perform reverse geocoding
  const result = await reverseGeocodeNominatim(lat, lng);
  
  // Cache the result if successful
  if (result.success) {
    geocodingCache.set(cacheKey, {
      placeName: result.placeName,
      fullAddress: result.fullAddress || '',
      timestamp: Date.now(),
    });
  }
  
  return result.placeName;
}

/**
 * Batch reverse geocoding for multiple coordinates
 */
export async function reverseGeocodeMultiple(coordinates: Array<{lat: number, lng: number}>): Promise<string[]> {
  const promises = coordinates.map(coord => reverseGeocode(coord.lat, coord.lng));
  return Promise.all(promises);
}

/**
 * Parse coordinate string and reverse geocode
 */
export async function parseAndGeocode(coordinateString: string): Promise<string> {
  const coordMatch = coordinateString.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  
  if (!coordMatch) {
    return coordinateString; // Return as-is if not coordinates
  }
  
  const lat = parseFloat(coordMatch[1]);
  const lng = parseFloat(coordMatch[2]);
  
  return reverseGeocode(lat, lng);
}

/**
 * Clear geocoding cache (for testing or memory management)
 */
export function clearGeocodingCache(): void {
  geocodingCache.clear();
}

/**
 * Get cache statistics
 */
export function getGeocodingCacheStats(): {size: number, entries: string[]} {
  return {
    size: geocodingCache.size,
    entries: Array.from(geocodingCache.keys()),
  };
}
