import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SimpleMapLocationSelector from '../../../../components/SimpleMapLocationSelector';
import RouteSelectionMap from '../../../../components/RouteSelectionMap';
import SecondaryButton from '../../../../components/ui/SecondaryButton';
import { useRouteCreation } from '../../../../contexts/RouteCreationContext';

// Define the types here temporarily
interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface RouteData {
  distance: number;
  duration: number;
  overview_path?: any;
  encoded_polyline?: string;
}

interface RouteOption {
  id: number;
  distance: number;
  duration: number;
  description: string;
  polyline: string;
  overview_path: any[];
  segments: RouteSegment[];
}

interface RouteSegment {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  distance_km: number;
  location_name: string;
  segment_index: number;
}

interface RouteSelectionData {
  origin: LocationData;
  destination: LocationData;
  route: RouteData;
}

const SelectLocation = () => {
  const router = useRouter();
  const { routeData, updateRouteData } = useRouteCreation();
  const [selectedOrigin, setSelectedOrigin] = useState<LocationData | null>(routeData.origin || null);
  const [selectedDestination, setSelectedDestination] = useState<LocationData | null>(routeData.destination || null);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [showRouteSelection, setShowRouteSelection] = useState(false);

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  console.log('Google Maps API Key available:', GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

  // Validate API key on component mount
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      Alert.alert(
        'Configuration Error',
        'Google Maps API key is not configured. Please check your environment variables.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [GOOGLE_MAPS_API_KEY, router]);

  // Check if we should show route selection
  useEffect(() => {
    setShowRouteSelection(selectedOrigin !== null && selectedDestination !== null);
  }, [selectedOrigin, selectedDestination]);

  const handleOriginSelected = (location: LocationData) => {
    setSelectedOrigin(location);
    updateRouteData({ origin: location });
    
    // Reset route selection when origin changes
    setSelectedRoute(null);
    updateRouteData({ selectedRoute: undefined });
  };

  const handleDestinationSelected = (location: LocationData) => {
    setSelectedDestination(location);
    updateRouteData({ destination: location });
    
    // Reset route selection when destination changes
    setSelectedRoute(null);
    updateRouteData({ selectedRoute: undefined });
  };

  const handleRouteSelected = (route: RouteData) => {
    // This is for the simple map - convert to legacy format
    setSelectedRoute(null); // Will be replaced by route option selection
    
    // Convert the route data to match the context interface
    const contextRouteData = {
      polyline: route.encoded_polyline || '',
      distance: route.distance,
      duration: route.duration,
      encoded_polyline: route.encoded_polyline || '',
    };
    
    updateRouteData({ selectedRoute: contextRouteData });
  };

  const handleRouteOptionSelected = (routeOption: RouteOption) => {
    console.log('Route option selected:', routeOption);
    setSelectedRoute(routeOption);
    
    // Convert to context format
    const contextRouteData = {
      polyline: routeOption.polyline,
      distance: routeOption.distance,
      duration: routeOption.duration,
      encoded_polyline: routeOption.polyline,
      segments: routeOption.segments // Include segments for backend
    };
    
    updateRouteData({ selectedRoute: contextRouteData });
    
    // Show confirmation
    Alert.alert(
      'Route Selected',
      `${routeOption.description}\n\nDistance: ${routeOption.distance.toFixed(1)} km\nEstimated time: ${Math.round(routeOption.duration)} minutes\n\nSegments: ${routeOption.segments.length} segments through ${routeOption.segments.slice(0, 3).map(s => s.location_name).join(', ')}${routeOption.segments.length > 3 ? '...' : ''}`,
      [
        {
          text: 'Continue',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleError = (error: string) => {
    console.error('Map Error:', error);
    Alert.alert('Map Error', error);
  };

  const canProceed = () => {
    return selectedOrigin && selectedDestination && selectedRoute;
  };

  const handleNext = () => {
    if (canProceed()) {
      // Data is already saved to context in the handlers above
      router.back(); // Go back to CreateRoute
    } else {
      Alert.alert('Incomplete Selection', 'Please select both origin and destination locations, and choose a route.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Select Route Locations',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>
          {!showRouteSelection ? 'Select Your Route Locations' : 'Choose Your Preferred Route'}
        </Text>
        <Text style={styles.instructionText}>
          {!showRouteSelection ? (
            '1. Click on the map to select your origin location\n2. Click to select your destination\n3. Choose from the available route options'
          ) : (
            'Multiple route options are displayed below. Select your preferred route to continue.'
          )}
        </Text>
      </View>

      {/* Map Component */}
      <View style={styles.mapContainer}>
        {GOOGLE_MAPS_API_KEY ? (
          showRouteSelection && selectedOrigin && selectedDestination ? (
            <RouteSelectionMap
              origin={selectedOrigin}
              destination={selectedDestination}
              onRouteSelected={handleRouteOptionSelected}
              onError={handleError}
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            />
          ) : (
            <SimpleMapLocationSelector
              onOriginSelected={handleOriginSelected}
              onDestinationSelected={handleDestinationSelected}
              onRouteSelected={handleRouteSelected}
              onError={handleError}
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            />
          )
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Google Maps API key not found</Text>
            <Text style={styles.errorSubtext}>Please check your configuration</Text>
          </View>
        )}
      </View>

      {/* Status and Navigation */}
      <View style={styles.bottomContainer}>
        {selectedOrigin && (
          <Text style={styles.statusText}>
            Origin: {selectedOrigin.address}
          </Text>
        )}
        {selectedDestination && (
          <Text style={styles.statusText}>
            Destination: {selectedDestination.address}
          </Text>
        )}
        {selectedRoute && (
          <Text style={styles.statusText}>
            Selected Route: {selectedRoute.distance.toFixed(1)} km, {Math.round(selectedRoute.duration)} min
            {selectedRoute.segments && (
              <Text style={styles.segmentText}>
                {'\n'}{selectedRoute.segments.length} segments through {selectedRoute.segments.slice(0, 2).map(s => s.location_name).join(', ')}
                {selectedRoute.segments.length > 2 ? '...' : ''}
              </Text>
            )}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <SecondaryButton
            title="Back"
            onPress={() => router.back()}
            style={[styles.button, styles.backButton]}
          />
          {showRouteSelection ? (
            <SecondaryButton
              title="Edit Locations"
              onPress={() => {
                setSelectedOrigin(null);
                setSelectedDestination(null);
                setSelectedRoute(null);
                updateRouteData({ origin: undefined, destination: undefined, selectedRoute: undefined });
              }}
              style={[styles.button, styles.editButton]}
            />
          ) : (
            <SecondaryButton
              title={canProceed() ? "Continue" : "Select Route"}
              onPress={handleNext}
              style={[styles.button, canProceed() ? styles.continueButton : styles.disabledButton]}
              disabled={!canProceed()}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  instructionsContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  segmentText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  continueButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default SelectLocation;