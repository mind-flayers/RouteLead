// Geocoding Service for converting coordinates to place names
// Uses Google Maps API (primary) with OpenStreetMap Nominatim as fallback

// Configuration
const USE_GOOGLE_MAPS_PRIMARY = true; // Set to false to use Nominatim as primary

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
    
    // Extract place name from address components - prioritize specific areas over cities
    const address = data.address || {};
    let placeName = '';
    let cityName = '';
    let fullAddress = data.display_name || '';
    
    // Store city/town for context
    cityName = address.city || address.town || '';
    
    // Priority order for more precise Sri Lankan place names
    if (address.neighbourhood) {
      // Specific neighbourhoods (highest priority for precision)
      placeName = address.neighbourhood;
    } else if (address.quarter) {
      // Quarters in Sri Lankan addresses (e.g., "Bogambara")
      placeName = address.quarter;
    } else if (address.hamlet) {
      // Hamlets in Sri Lankan addresses (e.g., "Bahirawakanda") 
      placeName = address.hamlet;
    } else if (address.suburb) {
      // Suburban areas
      placeName = address.suburb;
    } else if (address.village) {
      // Villages
      placeName = address.village;
    } else if (address.city) {
      // Fall back to city if no specific area available
      placeName = address.city;
    } else if (address.town) {
      placeName = address.town;
    } else if (address.county) {
      // Districts like "Colombo District", "Kandy District"
      placeName = address.county;
    } else if (address.state) {
      // Provinces like "Western Province", "Central Province"
      placeName = address.state;
    } else {
      // Fallback to first part of display name
      placeName = fullAddress.split(',')[0] || 'Unknown Location';
    }
    
    // Enhance place name with city context for better readability
    let enhancedPlaceName = placeName.trim();
    
    // Add city context if we have a specific area and a different city name
    if (cityName && placeName !== cityName && 
        (address.neighbourhood || address.quarter || address.hamlet || address.suburb || address.village)) {
      enhancedPlaceName = `${placeName}, ${cityName}`;
    }
    
    // For districts, clean up "District" suffix but keep city context
    if (address.county && enhancedPlaceName.includes('District')) {
      const districtName = enhancedPlaceName.replace(' District', '');
      enhancedPlaceName = cityName ? `${districtName}, ${cityName}` : districtName;
    }
    
    return {
      success: true,
      placeName: enhancedPlaceName,
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
 * Google Maps Geocoding API implementation for precise location names
 */
async function reverseGeocodeGoogle(lat: number, lng: number): Promise<GeocodingResult> {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }
    
    console.log(`🗺️ Google Maps reverse geocoding: ${lat}, ${lng}`);
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=en&region=lk`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`🗺️ Google Maps response for ${lat}, ${lng}:`, data);
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Google Geocoding error: ${data.status} - ${data.error_message || 'No results found'}`);
    }
    
    const result = data.results[0];
    const components = result.address_components;
    
    // Extract relevant components with priority for precise locations
    let placeName = '';
    let city = '';
    let area = '';
    let neighborhood = '';
    let sublocality = '';
    let premise = '';
    let establishment = '';
    let route = '';
    let streetNumber = '';
    
    for (const component of components) {
      const types = component.types;
      const longName = component.long_name;
      
      if (types.includes('establishment')) {
        establishment = longName;
      } else if (types.includes('premise')) {
        premise = longName;
      } else if (types.includes('street_number')) {
        streetNumber = longName;
      } else if (types.includes('route')) {
        route = longName;
      } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        sublocality = longName;
      } else if (types.includes('neighborhood')) {
        neighborhood = longName;
      } else if (types.includes('sublocality_level_2')) {
        area = longName;
      } else if (types.includes('locality')) {
        city = longName;
      } else if (types.includes('administrative_area_level_2')) {
        if (!city) city = longName; // Backup for city
      }
    }
    
    // Debug log to see what components we extracted
    console.log(`🗺️ Extracted components for ${lat},${lng}:`, {
      establishment,
      premise,
      streetNumber,
      route,
      sublocality,
      neighborhood,
      area,
      city,
      formattedAddress: result.formatted_address
    });

    // Priority order for most precise location name
    if (establishment) {
      // Named places like "Bogambara Bus Stand", "Department of Education"
      placeName = establishment;
    } else if (premise && route) {
      // Building with street: "Building Name, Street Name"
      placeName = `${premise}, ${route}`;
    } else if (streetNumber && route) {
      // Street address: "123 Main Street"
      placeName = `${streetNumber} ${route}`;
    } else if (route) {
      // Just the street name
      placeName = route;
    } else if (premise) {
      // Building numbers, building names
      placeName = premise;
    } else if (sublocality) {
      // Specific areas within cities (most common for precise locations)
      placeName = sublocality;
    } else if (neighborhood) {
      // Neighborhood names
      placeName = neighborhood;
    } else if (area) {
      // Secondary areas
      placeName = area;
    } else {
      // Try to extract precise location from formatted_address
      // Look for street addresses or specific locations
      const formattedParts = result.formatted_address.split(',');
      if (formattedParts.length >= 2) {
        // Use the first part which is usually the most specific
        const firstPart = formattedParts[0].trim();
        // If it contains numbers or specific identifiers, it's likely a street address
        if (/\d/.test(firstPart) || firstPart.includes('Rd') || firstPart.includes('Street') || firstPart.includes('Avenue') || firstPart.includes('Mawatha')) {
          placeName = firstPart;
        } else {
          // Otherwise use city
          placeName = city || firstPart;
        }
      } else {
        placeName = city || result.formatted_address.split(',')[0] || 'Unknown Location';
      }
    }

    // Add city context for better readability (except for establishments which usually already include context)
    let enhancedPlaceName = placeName.trim();
    if (city && placeName !== city && !establishment && !placeName.toLowerCase().includes(city.toLowerCase())) {
      enhancedPlaceName = `${placeName}, ${city}`;
    }return {
      success: true,
      placeName: enhancedPlaceName,
      fullAddress: result.formatted_address,
      city,
      area: sublocality || neighborhood || area,
      country: 'Sri Lanka', // We're specifically targeting Sri Lankan coordinates
    };
    
  } catch (error) {
    console.error('Google reverse geocoding failed:', error);
    
    // Fallback to Nominatim if Google fails
    console.log('🗺️ Falling back to Nominatim API...');
    return reverseGeocodeNominatim(lat, lng);
  }
}

/**
 * Get fallback location name for invalid coordinates or enhanced fallbacks
 */
function getLocationFallback(lat: number, lng: number): string | null {
  // Check if coordinates are within Sri Lankan bounds
  const isInSriLanka = lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 81.9;
  
  if (isInSriLanka) {
    // For valid Sri Lankan coordinates, provide regional fallbacks
    return getSriLankanRegionalFallback(lat, lng);
  }
  
  // For invalid coordinates, provide a generic fallback
  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Get regional fallback names for Sri Lankan coordinates
 */
function getSriLankanRegionalFallback(lat: number, lng: number): string {
  // Western Province (includes Colombo area)
  if (lat >= 6.7 && lat <= 7.3 && lng >= 79.6 && lng <= 80.3) {
    return 'Western Province, Sri Lanka';
  }
  
  // Central Province (includes Kandy area)
  if (lat >= 6.8 && lat <= 7.5 && lng >= 80.2 && lng <= 81.2) {
    return 'Central Province, Sri Lanka';
  }
  
  // Southern Province (includes Galle area)
  if (lat >= 5.9 && lat <= 6.8 && lng >= 79.8 && lng <= 81.2) {
    return 'Southern Province, Sri Lanka';
  }
  
  // Northern Province
  if (lat >= 8.5 && lat <= 9.9 && lng >= 79.6 && lng <= 81.9) {
    return 'Northern Province, Sri Lanka';
  }
  
  // Eastern Province
  if (lat >= 6.1 && lat <= 8.8 && lng >= 81.0 && lng <= 81.9) {
    return 'Eastern Province, Sri Lanka';
  }
  
  // North Western Province
  if (lat >= 7.1 && lat <= 8.8 && lng >= 79.5 && lng <= 80.5) {
    return 'North Western Province, Sri Lanka';
  }
  
  // North Central Province
  if (lat >= 7.2 && lat <= 9.0 && lng >= 80.1 && lng <= 81.3) {
    return 'North Central Province, Sri Lanka';
  }
  
  // Uva Province
  if (lat >= 6.1 && lat <= 7.3 && lng >= 80.8 && lng <= 81.8) {
    return 'Uva Province, Sri Lanka';
  }
  
  // Sabaragamuwa Province
  if (lat >= 6.2 && lat <= 7.2 && lng >= 79.9 && lng <= 80.9) {
    return 'Sabaragamuwa Province, Sri Lanka';
  }
  
  // Default fallback for Sri Lankan coordinates
  return 'Sri Lanka';
}

/**
 * Main reverse geocoding function with Google Maps primary and Nominatim fallback
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Validate coordinates
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    const fallback = getLocationFallback(lat, lng);
    return fallback || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  
  // Check if coordinates are in Sri Lanka
  const isInSriLanka = lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 81.9;
  if (!isInSriLanka) {
    console.log(`🗺️ Coordinates outside Sri Lanka: ${lat}, ${lng}`);
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
  
  const cacheKey = createCacheKey(lat, lng);
  
  // Check cache first
  const cached = geocodingCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log(`🗺️ Cache hit for ${cacheKey}: ${cached.placeName}`);
    return cached.placeName;
  }
  
  // Try Google Maps first for best accuracy
  try {
    console.log(`🗺️ Attempting Google Maps geocoding for Sri Lankan coordinates: ${lat}, ${lng}`);
    const result = await reverseGeocodeGoogle(lat, lng);
    
    // Cache the result if successful
    if (result.success) {
      geocodingCache.set(cacheKey, {
        placeName: result.placeName,
        fullAddress: result.fullAddress || '',
        timestamp: Date.now(),
      });
      console.log(`🗺️ Google Maps geocoded ${cacheKey} → ${result.placeName}`);
      return result.placeName;
    } else {
      // If Google fails, the function already falls back to Nominatim internally
      return result.placeName;
    }
  } catch (error) {
    console.error(`🗺️ Google Maps geocoding error for ${cacheKey}:`, error);
    
    // Fallback to Nominatim if Google completely fails
    try {
      console.log(`🗺️ Falling back to Nominatim for ${cacheKey}`);
      const nominatimResult = await reverseGeocodeNominatim(lat, lng);
      
      if (nominatimResult.success) {
        geocodingCache.set(cacheKey, {
          placeName: nominatimResult.placeName,
          fullAddress: nominatimResult.fullAddress || '',
          timestamp: Date.now(),
        });
        return nominatimResult.placeName;
      }
      
      // Use enhanced fallback for failed geocoding
      const fallback = getLocationFallback(lat, lng);
      return fallback || nominatimResult.placeName;
    } catch (nominatimError) {
      console.error(`🗺️ Both Google and Nominatim failed for ${cacheKey}:`, nominatimError);
      // Use enhanced fallback for errors
      const fallback = getLocationFallback(lat, lng);
      return fallback || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
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
 * Test if Google Maps API key is properly configured
 */
export async function testGoogleMapsAPIKey(): Promise<boolean> {
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('🗺️ No Google Maps API key found');
    return false;
  }
  
  console.log('🗺️ Testing Google Maps API key...');
  
  try {
    // Test with a simple Colombo coordinate
    const testLat = 6.9271;
    const testLng = 79.8612;
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${testLat},${testLng}&key=${GOOGLE_MAPS_API_KEY}&language=en&region=lk`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ Google Maps API key is working correctly');
      console.log('🗺️ Test result:', data.results[0]?.formatted_address || 'No address found');
      return true;
    } else {
      console.error('❌ Google Maps API error:', data.status, data.error_message);
      console.log('🗺️ Will use Nominatim API as fallback');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing Google Maps API:', error);
    console.log('🗺️ Will use Nominatim API as fallback');
    return false;
  }
}

/**
 * Clear geocoding cache (for testing or memory management)
 */
export function clearGeocodingCache(): void {
  geocodingCache.clear();
  console.log('🗺️ Geocoding cache cleared - will use new precise location logic');
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

/**
 * Test precise location extraction with sample coordinates
 */
export async function testPreciseLocations(): Promise<void> {
  console.log('🗺️ Testing precise location extraction...');
  
  // Clear cache to test fresh results
  clearGeocodingCache();
  
  const testCoords = [
    { lat: 7.2906667, lng: 80.6335482, note: 'Kandy (should show specific area + Kandy)' },
    { lat: 6.9271, lng: 79.8612, note: 'Colombo (should show specific area + Colombo)' },
  ];
  
  for (const coord of testCoords) {
    try {
      const result = await reverseGeocode(coord.lat, coord.lng);
      console.log(`🗺️ ${coord.note}: ${coord.lat}, ${coord.lng} → "${result}"`);
    } catch (error) {
      console.error(`🗺️ Error testing ${coord.note}:`, error);
    }
    
    // Respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
}
