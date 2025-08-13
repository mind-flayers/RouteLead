import { testRouteApiConnection, createRoute, CreateRouteRequest } from '../services/routeService';

// Test script to verify route creation functionality
export const testRouteCreation = async () => {
  try {
    console.log('=== Testing Route Creation API ===');
    
    // 1. Test API connection
    console.log('1. Testing API connection...');
    const connectionTest = await testRouteApiConnection();
    console.log('Connection test result:', connectionTest);
    
    if (!connectionTest.success) {
      console.error('API connection failed. Cannot proceed with route creation test.');
      return;
    }
    
    // 2. Test route creation with sample data
    console.log('2. Testing route creation...');
    
    const sampleRouteData: CreateRouteRequest = {
      driverId: '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27',
      originLat: 6.9271,
      originLng: 79.8612,
      destinationLat: 6.9934,
      destinationLng: 81.0550,
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      biddingStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      detourToleranceKm: 5,
      suggestedPriceMin: 1500,
      suggestedPriceMax: 2500,
      routePolyline: 'sample_encoded_polyline_string',
      totalDistanceKm: 45.2,
      estimatedDurationMinutes: 90,
      segments: [
        {
          segmentIndex: 0,
          startLat: 6.9271,
          startLng: 79.8612,
          endLat: 6.9500,
          endLng: 79.9500,
          distanceKm: 15.5,
          townName: 'Colombo',
        },
        {
          segmentIndex: 1,
          startLat: 6.9500,
          startLng: 79.9500,
          endLat: 6.9934,
          endLng: 81.0550,
          distanceKm: 29.7,
          townName: 'Kandy',
        },
      ],
    };
    
    console.log('Sample route data:', sampleRouteData);
    
    const result = await createRoute(sampleRouteData);
    console.log('Route creation result:', result);
    
    if (result.routeId) {
      console.log('✅ Route created successfully!');
      console.log(`Route ID: ${result.routeId}`);
      console.log(`Segments created: ${result.segmentsCount}`);
      console.log(`Status: ${result.status}`);
    } else {
      console.error('❌ Route creation failed - no route ID returned');
    }
    
  } catch (error) {
    console.error('❌ Route creation test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
};

// Test Google Maps route selection functionality
export const testGoogleMapsIntegration = () => {
  console.log('=== Testing Google Maps Integration ===');
  
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ Google Maps API key not found in environment variables');
    console.log('Please ensure EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is set in your .env file');
    return false;
  }
  
  console.log('✅ Google Maps API key found:', GOOGLE_MAPS_API_KEY.substring(0, 10) + '...');
  
  // Test typical Sri Lankan coordinates
  const testCoordinates = [
    { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
    { name: 'Galle', lat: 6.0535, lng: 80.2210 },
  ];
  
  console.log('Test coordinates for Sri Lanka:');
  testCoordinates.forEach(coord => {
    console.log(`${coord.name}: ${coord.lat}, ${coord.lng}`);
  });
  
  return true;
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting Route Creation Feature Tests');
  
  // Test Google Maps integration
  const mapsTest = testGoogleMapsIntegration();
  
  if (mapsTest) {
    // Test route creation API
    await testRouteCreation();
  }
  
  console.log('✅ All tests completed');
};
