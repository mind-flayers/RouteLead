import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import CustomerFooter from '../../../components/navigation/CustomerFooter';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDj2o9cWpgCtIM2hUP938Ppo31-gvap1ig'; // Replace with your real key

interface LatLng {
  latitude: number;
  longitude: number;
}

interface Route {
  id: string;
  origin: string;
  destination: string;
  driverName: string;
  departureTime: string;
  // Add other fields as needed
}

const SRI_LANKA_BOUNDS = {
  minLat: 5.9167,
  maxLat: 9.8500,
  minLng: 79.6500,
  maxLng: 81.9000,
};
function isInSriLanka(lat: number, lng: number) {
  return (
    lat >= SRI_LANKA_BOUNDS.minLat &&
    lat <= SRI_LANKA_BOUNDS.maxLat &&
    lng >= SRI_LANKA_BOUNDS.minLng &&
    lng <= SRI_LANKA_BOUNDS.maxLng
  );
}

const getMapHtml = (
  pickup: LatLng | null,
  dropoff: LatLng | null,
  step: 'pickup' | 'dropoff' | 'done'
): string => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
      <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_APIKEY}"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 6.9271, lng: 79.8612 },
          zoom: 8,
        });
        ${pickup ? `var pickupMarker = new google.maps.Marker({ position: { lat: ${pickup.latitude}, lng: ${pickup.longitude} }, map: map, label: 'P' });` : ''}
        ${dropoff ? `var dropoffMarker = new google.maps.Marker({ position: { lat: ${dropoff.latitude}, lng: ${dropoff.longitude} }, map: map, label: 'D' });` : ''}
        map.addListener('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
        });
      </script>
    </body>
  </html>
`;

// Dummy data for available routes - using real UUID for testing
const dummyRoutes = [
  {
    id: '1cc88146-8e0b-41fa-a81a-17168a1407ec', // Real test route ID from backend
    origin: 'Colombo',
    destination: 'Badulla',
    departureDate: '2025-10-26T09:00:00',
    timeline: '02 D | 02:56:48 H',
    bids: 7,
    highestBid: 250.0,
    driverName: 'Kasun Perera',
    driverPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '72ca2953-8f62-40c0-b107-0c89be2e7209', // Another real route ID from Postman collection
    origin: 'Galle',
    destination: 'Matara',
    departureDate: '2025-11-02T08:00:00',
    timeline: '01 D | 12:34:56 H',
    bids: 5,
    highestBid: 180.0,
    driverName: 'Nimal Perera',
    driverPhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
];

export default function FindRouteScreen() {
  const [step, setStep] = useState<'pickup' | 'dropoff' | 'done'>('pickup');
  const [pickupCoord, setPickupCoord] = useState<LatLng | null>(null);
  const [dropoffCoord, setDropoffCoord] = useState<LatLng | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [showRegionWarning, setShowRegionWarning] = useState(false);
  const [pickupAddress, setPickupAddress] = useState<string | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState<string | null>(null);

  async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  const handleMapMessage = async (event: any) => {
    const { lat, lng } = JSON.parse(event.nativeEvent.data);
    if (!isInSriLanka(lat, lng)) {
      setShowRegionWarning(true);
      return;
    }
    if (step === 'pickup') {
      setPickupCoord({ latitude: lat, longitude: lng });
      setPickupAddress(await reverseGeocode(lat, lng));
      setStep('dropoff');
    } else if (step === 'dropoff') {
      setDropoffCoord({ latitude: lat, longitude: lng });
      setDropoffAddress(await reverseGeocode(lat, lng));
      setStep('done');
    }
  };

  const handleReset = () => {
    setPickupCoord(null);
    setDropoffCoord(null);
    setPickupAddress(null);
    setDropoffAddress(null);
    setStep('pickup');
    setShowRoutes(false);
  };

  const handleClearPickup = () => {
    setPickupCoord(null);
    setPickupAddress(null);
    setStep('pickup');
    setShowRoutes(false);
  };

  const handleClearDropoff = () => {
    setDropoffCoord(null);
    setDropoffAddress(null);
    setStep('dropoff');
    setShowRoutes(false);
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const getCurrentLocation = async () => {
    try {
      // First check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings to use this feature.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: openSettings }
          ]
        );
        return;
      }

      // Check and request permission if needed
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        status = (await Location.requestForegroundPermissionsAsync()).status;
        if (status !== 'granted') {
          Alert.alert(
            "Permission Denied",
            "We need location access to get your current position. Please enable it in settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: openSettings }
            ]
          );
          return;
        }
      }

      // Get current position with a timeout
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10 // Update every 10 meters
      });
      
      const { latitude, longitude } = location.coords;
      
      if (!isInSriLanka(latitude, longitude)) {
        setShowRegionWarning(true);
        return;
      }

      setPickupCoord({ latitude, longitude });
      const address = await reverseGeocode(latitude, longitude);
      setPickupAddress(address);
      setStep('dropoff');
      setLocationPermission(true);
    } catch (error) {
      Alert.alert(
        "Location Error",
        "Could not get your current location. Please check if your GPS is enabled and try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: getCurrentLocation }
        ]
      );
    }
  };

  const handleSearch = async () => {
    setShowRoutes(true);
    setLoadingRoutes(true);
    try {
      // Replace with your real API endpoint and parameters
      const response = await fetch(
        `https://your-api.com/routes?pickupLat=${pickupCoord?.latitude}&pickupLng=${pickupCoord?.longitude}&dropoffLat=${dropoffCoord?.latitude}&dropoffLng=${dropoffCoord?.longitude}`
      );
      const data = await response.json();
      setRoutes(data.routes); // Adjust according to your API response
    } catch (error) {
      // Handle error
      setRoutes([]);
    }
    setLoadingRoutes(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e3a8a' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Find Route</Text>
        <TouchableOpacity onPress={handleReset}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={{ padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: step === 'pickup' ? 8 : 0 }}>
          {step === 'pickup' && 'Tap on the map to select Pickup location'}
          {step === 'dropoff' && 'Tap on the map to select Dropoff location'}
          {step === 'done' && 'Pickup and Dropoff selected'}
        </Text>
        {step === 'pickup' && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1e3a8a',
              padding: 8,
              borderRadius: 8,
              alignSelf: 'flex-start'
            }}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={18} color="white" />
            <Text style={{ color: 'white', marginLeft: 8, fontWeight: '500' }}>
              Use Current Location
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map WebView */}
      <WebView
        source={{ html: getMapHtml(pickupCoord, dropoffCoord, step) }}
        style={{ flex: 1 }}
        onMessage={handleMapMessage}
      />

      {/* Action Buttons */}
      {step === 'done' && !showRoutes && (
        <View style={{ padding: 12 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#ff6b35', borderRadius: 8, padding: 16, alignItems: 'center' }}
            onPress={handleSearch}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Search Routes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Address display */}
      <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
            Pickup: <Text style={{ color: '#333' }}>
              {pickupAddress
                ? pickupAddress
                : pickupCoord
                ? `${pickupCoord.latitude}, ${pickupCoord.longitude}`
                : 'Select on map'}
            </Text>
          </Text>
          {pickupCoord && (
            <TouchableOpacity onPress={handleClearPickup} style={{ marginLeft: 8 }}>
              <Ionicons name="close-circle" size={20} color="#ff6b35" />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', color: '#ff6b35' }}>
            Dropoff: <Text style={{ color: '#333' }}>
              {dropoffAddress
                ? dropoffAddress
                : dropoffCoord
                ? `${dropoffCoord.latitude}, ${dropoffCoord.longitude}`
                : 'Select on map'}
            </Text>
          </Text>
          {dropoffCoord && (
            <TouchableOpacity onPress={handleClearDropoff} style={{ marginLeft: 8 }}>
              <Ionicons name="close-circle" size={20} color="#1e3a8a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Available Routes */}
      {showRoutes && (
        <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: 8 }}>Available Routes:</Text>
          {dummyRoutes.map(route => (
            <TouchableOpacity
              key={route.id}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 }}
              onPress={() => router.push({
                pathname: '/pages/customer/RequestParcel',
                params: {
                  routeId: route.id,
                  origin: pickupAddress || `${pickupCoord?.latitude}, ${pickupCoord?.longitude}`,
                  destination: dropoffAddress || `${dropoffCoord?.latitude}, ${dropoffCoord?.longitude}`,
                  pickupLat: pickupCoord?.latitude?.toString() || '',
                  pickupLng: pickupCoord?.longitude?.toString() || '',
                  dropoffLat: dropoffCoord?.latitude?.toString() || '',
                  dropoffLng: dropoffCoord?.longitude?.toString() || ''
                }
              })}
            >
              <Image source={{ uri: route.driverPhoto }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Ionicons name="location-outline" size={14} color="#555" />
                  <Text style={{ marginLeft: 4, fontWeight: 'bold', color: '#222' }}>{route.origin}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Ionicons name="arrow-down" size={14} color="#555" />
                  <Text style={{ marginLeft: 4, fontWeight: 'bold', color: '#222' }}>{route.destination}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Ionicons name="calendar-outline" size={14} color="#555" />
                  <Text style={{ marginLeft: 4, color: '#444' }}>{new Date(route.departureDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Ionicons name="time-outline" size={14} color="#555" />
                  <Text style={{ marginLeft: 4, color: '#444' }}>{route.timeline}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="person" size={14} color="#555" />
                  <Text style={{ marginLeft: 4, color: '#444' }}>{route.driverName}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="pricetag" size={14} color="#555" />
                  <Text style={{ marginLeft: 4, color: '#444' }}>{route.bids} Bids | Highest: <Text style={{ color: '#ff6b35', fontWeight: 'bold' }}>LKR {route.highestBid.toFixed(2)}</Text></Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showRegionWarning && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 10
        }}>
          <View style={{
            backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', width: '80%'
          }}>
            <Ionicons name="warning" size={48} color="#ff6b35" style={{ marginBottom: 12 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center', marginBottom: 8 }}>
              Sorry we can’t provide services for the selected region
            </Text>
            <Text style={{ color: '#888', textAlign: 'center', marginBottom: 20 }}>
              Please select a serviceable region
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#1e3a8a', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32 }}
              onPress={() => setShowRegionWarning(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <CustomerFooter activeTab="home" />
    </View>
  );
}
