import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RouteSelectionMap from '../../components/RouteSelectionMap';

// Test data for Sri Lankan coordinates
const testOrigin = {
  lat: 6.9271,
  lng: 79.8612,
  address: 'Colombo, Western Province, Sri Lanka'
};

const testDestination = {
  lat: 7.2906,
  lng: 80.6337,
  address: 'Kandy, Central Province, Sri Lanka'
};

const RouteSelectionTest = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const handleRouteSelected = (route) => {
    console.log('Route selected in test:', route);
    setSelectedRoute(route);
    
    Alert.alert(
      'Route Selected!',
      `${route.description}\n\nDistance: ${route.distance.toFixed(1)} km\nTime: ${Math.round(route.duration)} min\nSegments: ${route.segments.length}\n\nTowns: ${route.segments.slice(0, 3).map(s => s.town_name).join(', ')}`,
      [{ text: 'OK' }]
    );
  };

  const handleError = (error) => {
    console.error('Route selection error:', error);
    Alert.alert('Error', error);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Test Route Selection',
          headerStyle: { backgroundColor: '#007bff' },
          headerTintColor: 'white',
        }}
      />

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>Origin: {testOrigin.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#F44336" />
          <Text style={styles.infoText}>Destination: {testDestination.address}</Text>
        </View>
        {selectedRoute && (
          <View style={styles.selectedRouteInfo}>
            <Text style={styles.selectedRouteTitle}>Selected Route:</Text>
            <Text style={styles.selectedRouteText}>{selectedRoute.description}</Text>
            <Text style={styles.selectedRouteText}>
              {selectedRoute.distance.toFixed(1)} km • {Math.round(selectedRoute.duration)} min • {selectedRoute.segments.length} segments
            </Text>
          </View>
        )}
      </View>

      <View style={styles.mapContainer}>
        {GOOGLE_MAPS_API_KEY ? (
          <RouteSelectionMap
            origin={testOrigin}
            destination={testDestination}
            onRouteSelected={handleRouteSelected}
            onError={handleError}
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color="#FF9800" />
            <Text style={styles.errorTitle}>Google Maps API Key Missing</Text>
            <Text style={styles.errorText}>
              Please configure EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {selectedRoute ? 'Route selected ✅' : 'Select a route from the options above'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  selectedRouteInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedRouteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  selectedRouteText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusBar: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RouteSelectionTest;
