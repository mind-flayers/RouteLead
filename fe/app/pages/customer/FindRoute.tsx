import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';

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

// Dummy data for available routes
const dummyRoutes = [
  {
    id: '1',
    origin: 'Colombo',
    destination: 'Badulla',
    departureDate: '2025-10-26T09:00:00',
    timeline: '02 D | 02:56:48 H',
    bids: 7,
    highestBid: 250.0,
    driverName: 'John Doe',
    driverPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    origin: 'Galle',
    destination: 'Matara',
    departureDate: '2025-11-02T08:00:00',
    timeline: '01 D | 12:34:56 H',
    bids: 5,
    highestBid: 180.0,
    driverName: 'Jane Smith',
    driverPhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
];

export default function FindRouteScreen() {
  const [step, setStep] = useState<'pickup' | 'dropoff' | 'done'>('pickup');
  const [pickupCoord, setPickupCoord] = useState<LatLng | null>(null);
  const [dropoffCoord, setDropoffCoord] = useState<LatLng | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const handleMapMessage = (event: any) => {
    const { lat, lng } = JSON.parse(event.nativeEvent.data);
    if (step === 'pickup') {
      setPickupCoord({ latitude: lat, longitude: lng });
      setStep('dropoff');
    } else if (step === 'dropoff') {
      setDropoffCoord({ latitude: lat, longitude: lng });
      setStep('done');
    }
  };

  const handleReset = () => {
    setPickupCoord(null);
    setDropoffCoord(null);
    setStep('pickup');
    setShowRoutes(false);
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
        <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
          {step === 'pickup' && 'Tap on the map to select Pickup location'}
          {step === 'dropoff' && 'Tap on the map to select Dropoff location'}
          {step === 'done' && 'Pickup and Dropoff selected'}
        </Text>
      </View>

      {/* Map WebView */}
      <WebView
        source={{ html: getMapHtml(pickupCoord, dropoffCoord, step) }}
        style={{ flex: 1 }}
        onMessage={handleMapMessage}
      />

      {/* Search Button */}
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
        <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
          Pickup: <Text style={{ color: '#333' }}>{pickupCoord ? `${pickupCoord.latitude}, ${pickupCoord.longitude}` : 'Select on map'}</Text>
        </Text>
        <Text style={{ fontWeight: 'bold', color: '#ff6b35', marginTop: 4 }}>
          Dropoff: <Text style={{ color: '#333' }}>{dropoffCoord ? `${dropoffCoord.latitude}, ${dropoffCoord.longitude}` : 'Select on map'}</Text>
        </Text>
      </View>

      {/* Available Routes */}
      {showRoutes && (
        <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: 8 }}>Available Routes:</Text>
          {dummyRoutes.map(route => (
            <TouchableOpacity
              key={route.id}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 }}
              onPress={() => router.push('/pages/customer/RouteDetails')}
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
    </View>
  );
}
