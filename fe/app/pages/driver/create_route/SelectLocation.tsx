import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import PrimaryButton from '../../../../components/ui/PrimaryButton';

interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coordinate: LocationCoordinate;
  address: string;
}

const SelectLocation = () => {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapCenter, setMapCenter] = useState({
    latitude: -7.6489, // Default to Indonesia (Nganjuk area)
    longitude: 111.9033,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      const formattedAddress = address[0] 
        ? `${address[0].street || ''} ${address[0].streetNumber || ''}, ${address[0].district || ''}, ${address[0].city || ''}`.trim()
        : 'Current Location';

      const locationData: LocationData = {
        coordinate: { latitude, longitude },
        address: formattedAddress
      };

      setCurrentLocation(locationData);
      setSelectedLocation(locationData);
      setMapCenter({ latitude, longitude });
      
      // Update map center
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: 'updateLocation',
            latitude,
            longitude,
            address: formattedAddress
          })
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get current location. Please try again.');
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'locationSelected') {
        const { latitude, longitude } = data;
        
        try {
          // Reverse geocode to get address
          const address = await Location.reverseGeocodeAsync({ latitude, longitude });
          const formattedAddress = address[0] 
            ? `${address[0].street || ''} ${address[0].streetNumber || ''}, ${address[0].district || ''}, ${address[0].city || ''}`.trim()
            : 'Selected Location';

          const locationData: LocationData = {
            coordinate: { latitude, longitude },
            address: formattedAddress
          };

          setSelectedLocation(locationData);
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setSelectedLocation({
            coordinate: { latitude, longitude },
            address: 'Selected Location'
          });
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleLocationSelect = () => {
    if (selectedLocation) {
      // You can pass the selected location data to the next screen
      router.push({
        pathname: '/pages/driver/create_route/CreateRoute',
        params: {
          selectedLocation: JSON.stringify(selectedLocation)
        }
      });
    }
  };

  const getMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          let selectedMarker;
          let currentLocationMarker;
          
          // Initialize map
          function initMap() {
            map = L.map('map').setView([${mapCenter.latitude}, ${mapCenter.longitude}], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Handle map clicks
            map.on('click', function(e) {
              const lat = e.latlng.lat;
              const lng = e.latlng.lng;
              
              // Remove previous selected marker
              if (selectedMarker) {
                map.removeLayer(selectedMarker);
              }
              
              // Add new marker
              selectedMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                  className: 'custom-marker',
                  html: '<div style="background-color: #FF8C00; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
              }).addTo(map);
              
              // Send location to React Native
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'locationSelected',
                  latitude: lat,
                  longitude: lng
                }));
              }
            });
          }
          
          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            
            if (data.type === 'updateLocation') {
              const lat = data.latitude;
              const lng = data.longitude;
              
              // Update map view
              map.setView([lat, lng], 15);
              
              // Remove previous current location marker
              if (currentLocationMarker) {
                map.removeLayer(currentLocationMarker);
              }
              
              // Add current location marker
              currentLocationMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                  className: 'current-location-marker',
                  html: '<div style="background-color: #007AFF; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })
              }).addTo(map);
              
              // Also set as selected location
              if (selectedMarker) {
                map.removeLayer(selectedMarker);
              }
              selectedMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                  className: 'custom-marker',
                  html: '<div style="background-color: #FF8C00; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
              }).addTo(map);
            }
          });
          
          // Initialize when page loads
          initMap();
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Select Location',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: getMapHTML() }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* Selected Location Card */}
      {selectedLocation && (
        <View style={styles.currentLocationCard}>
          <Text style={styles.currentLocationTitle}>Selected Location</Text>
          <View style={styles.locationDetail}>
            <Ionicons name="location" size={20} color="#FF8C00" />
            <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
            <TouchableOpacity 
              onPress={getCurrentLocation}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={20} color="#FF8C00" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Select Location Button */}
      <PrimaryButton 
        onPress={handleLocationSelect} 
        title="Confirm Location" 
        style={styles.selectLocationButton}
        disabled={!selectedLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  currentLocationCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5e6', // Light orange background
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  locationAddress: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  refreshButton: {
    marginLeft: 10,
    padding: 5,
  },
  selectLocationButton: {
    marginTop: 'auto', // Pushes button to the bottom
  },
});

export default SelectLocation;
