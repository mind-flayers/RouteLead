import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../components/ui/SecondaryButton';

const DeliveryManagement = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [deliveryStatus, setDeliveryStatus] = useState('Picked Up');
  const webViewRef = useRef<WebView>(null);

  // Mock delivery data - in real app, this would come from props or state management
  const deliveryData = {
    pickupLocation: {
      latitude: -7.6489,
      longitude: 111.9033,
      address: "123 Elm Street, Apartment 4B, Badulla"
    },
    dropoffLocation: {
      latitude: -7.6580,
      longitude: 111.9150,
      address: "21/A, Colombo"
    },
    currentLocation: {
      latitude: -7.6530,
      longitude: 111.9090
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallCustomer = () => {
    // Placeholder values for phone number and customer name
    const phoneNumber = '123-456-7890'; 
    const customerName = 'Chris';
    router.push(`/pages/driver/CallScreen?phoneNumber=${phoneNumber}&customerName=${customerName}`);
  };

  const getStatusButtonClass = (status: string) => {
    return deliveryStatus === status ? 'bg-orange-500' : 'bg-white';
  };

  const getStatusTextClass = (status: string) => {
    return deliveryStatus === status ? 'text-white' : 'text-gray-700';
  };

  const handleStartNavigation = () => {
    // Open navigation to the dropoff location
    const { latitude, longitude } = deliveryData.dropoffLocation;
    const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    
    // In real app, you might use Linking.openURL(navigationUrl) or integrated navigation
    console.log('Starting navigation to:', navigationUrl);
  };

  const updateDeliveryStatus = (status: string) => {
    setDeliveryStatus(status);
    
    // Update map markers based on status
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'updateStatus',
          status: status,
          currentLocation: deliveryData.currentLocation
        })
      );
    }
    
    // Navigate to delivery summary if delivered
    if (status === 'Delivered') {
      setTimeout(() => {
        (navigation as any).navigate('pages/driver/DeliverySummary');
      }, 1000);
    }
  };

  const getDeliveryMapHTML = () => {
    const { pickupLocation, dropoffLocation, currentLocation } = deliveryData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .legend {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: white;
            padding: 8px;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            font-size: 12px;
            z-index: 1000;
          }
          .legend-item {
            display: flex;
            align-items: center;
            margin: 2px 0;
          }
          .legend-marker {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 6px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-marker" style="background-color: #10B981;"></div>
            <span>Pickup (P)</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker" style="background-color: #EF4444;"></div>
            <span>Dropoff (D)</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker" style="background-color: #3B82F6;"></div>
            <span>Your Location</span>
          </div>
        </div>
        <script>
          let map;
          
          // Initialize map
          function initMap() {
            // Calculate center point between pickup and dropoff
            const centerLat = (${pickupLocation.latitude} + ${dropoffLocation.latitude}) / 2;
            const centerLng = (${pickupLocation.longitude} + ${dropoffLocation.longitude}) / 2;
            
            map = L.map('map').setView([centerLat, centerLng], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Pickup marker (green)
            const pickupMarker = L.marker([${pickupLocation.latitude}, ${pickupLocation.longitude}], {
              icon: L.divIcon({
                className: 'pickup-marker',
                html: '<div style="background-color: #10B981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 12px; font-weight: bold;">P</div></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).addTo(map);
            pickupMarker.bindPopup('<b>Pickup Location</b><br>${pickupLocation.address}');
            
            // Dropoff marker (red)
            const dropoffMarker = L.marker([${dropoffLocation.latitude}, ${dropoffLocation.longitude}], {
              icon: L.divIcon({
                className: 'dropoff-marker',
                html: '<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 12px; font-weight: bold;">D</div></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).addTo(map);
            dropoffMarker.bindPopup('<b>Dropoff Location</b><br>${dropoffLocation.address}');
            
            // Current location marker (blue, pulsing)
            const currentMarker = L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], {
              icon: L.divIcon({
                className: 'current-marker',
                html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div><style>@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }</style>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(map);
            currentMarker.bindPopup('<b>Your Current Location</b>');
            
            // Draw route line
            const routePoints = [
              [${pickupLocation.latitude}, ${pickupLocation.longitude}],
              [${currentLocation.latitude}, ${currentLocation.longitude}],
              [${dropoffLocation.latitude}, ${dropoffLocation.longitude}]
            ];
            
            const routeLine = L.polyline(routePoints, {
              color: '#FF8C00',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 5'
            }).addTo(map);
            
            // Fit map to show all markers
            const group = new L.featureGroup([pickupMarker, dropoffMarker, currentMarker]);
            map.fitBounds(group.getBounds().pad(0.1));
            
            // Add click handler for navigation
            map.on('click', function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapClicked',
                  latitude: e.latlng.lat,
                  longitude: e.latlng.lng
                }));
              }
            });
          }
          
          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'updateStatus') {
                // Update current location marker based on status
                if (currentMarker) {
                  map.removeLayer(currentMarker);
                }
                
                let markerColor = '#3B82F6'; // default blue
                let statusText = 'Your Current Location';
                
                switch(data.status) {
                  case 'Picked Up':
                    markerColor = '#10B981'; // green
                    statusText = 'Package Picked Up';
                    break;
                  case 'In Transit':
                    markerColor = '#F59E0B'; // yellow/orange
                    statusText = 'In Transit to Destination';
                    break;
                  case 'Delivered':
                    markerColor = '#EF4444'; // red
                    statusText = 'Package Delivered';
                    break;
                }
                
                currentMarker = L.marker([data.currentLocation.latitude, data.currentLocation.longitude], {
                  icon: L.divIcon({
                    className: 'current-marker',
                    html: '<div style="background-color: ' + markerColor + '; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div><style>@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }</style>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })
                }).addTo(map);
                currentMarker.bindPopup('<b>' + statusText + '</b>');
              }
            } catch (error) {
              console.error('Error handling message:', error);
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
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Delivery Management</Text>
        <View className="w-10" />{/* Placeholder for alignment */}
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Map Card */}
        <PrimaryCard className="mb-4 p-0 overflow-hidden">
          <View className="w-full h-48 relative">
            <WebView
              ref={webViewRef}
              style={{ flex: 1 }}
              source={{ html: getDeliveryMapHTML() }}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'mapClicked') {
                    console.log('Map clicked at:', data.latitude, data.longitude);
                  }
                } catch (error) {
                  console.error('Error parsing WebView message:', error);
                }
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              mixedContentMode="compatibility"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
            />
            <PrimaryButton
              title="Start Navigation"
              onPress={handleStartNavigation}
              className="absolute bottom-4 self-center w-10/12"
              icon={<MaterialCommunityIcons name="navigation" size={20} color="white" />}
            />
          </View>
        </PrimaryCard>

        {/* Cancel Trip Button */}
        <TouchableOpacity
          onPress={() => console.log('Cancel Trip')}
          className="w-full bg-white border-2 border-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row mb-4"
        >
          <Ionicons name="close-circle-outline" size={20} color="#FF8C00" />
          <Text className="text-red-500 text-base font-bold ml-2">Cancel Trip</Text>
        </TouchableOpacity>

        {/* Bidder and Bid Details Card */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-3">
            <FontAwesome name="user-circle-o" size={20} color="#6B7280" />
            <Text className="ml-2 text-lg font-bold">Chris C</Text>
            <View className="ml-auto bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-700 text-xs font-semibold">Pending Payment</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-2">
            {/* <MaterialCommunityIcons name="currency-usd" size={20} color="#FF8C00" /> */}
            <Text className="ml-2 text-orange-500 text-2xl font-bold">LKR 450.00</Text>
          </View>
          <Text>From: </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-sharp" size={18} color="#6B7280" />
            <Text className="ml-2 text-gray-700">123 Elm Street, Apartment 4B, Badulla</Text>
          </View>
          <Text>To: </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-sharp" size={18} color="#6B7280" />
            <Text className="ml-2 text-gray-700">21/A, Colombo</Text>
          </View>
          <Text>Receiver PhoneNo: </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="call-sharp" size={18} color="#6B7280" />
            <Text className="ml-2 text-gray-700">+94 123 456 7890</Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome name="check-circle-o" size={18} color="#6B7280" />
            <Text className="ml-2 to-blue-500">"Leave parcel at front door, no signature required."</Text>
          </View>
        </PrimaryCard>

        {/* Delivery Status Buttons */}
        <View className="flex-row justify-around mb-4 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('Picked Up')}`}
            onPress={() => updateDeliveryStatus('Picked Up')}
          >
            <Text className={`font-semibold ${getStatusTextClass('Picked Up')}`}>Picked Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('In Transit')}`}
            onPress={() => updateDeliveryStatus('In Transit')}
          >
            <Text className={`font-semibold ${getStatusTextClass('In Transit')}`}>In Transit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('Delivered')}`}
            onPress={() => updateDeliveryStatus('Delivered')}
          >
            <Text className={`font-semibold ${getStatusTextClass('Delivered')}`}>Delivered</Text>
          </TouchableOpacity>
        </View>

        {/* Parcel Details Card */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
            <Text className="ml-2 text-lg font-bold">Parcel Details</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">2x Small Packages</Text>
            <Text className="text-gray-500">Est. 5 kg</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">1x Medium Box</Text>
            <Text className="text-gray-500">Est. 12 kg</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Dimensions: </Text>
            <Text className="text-gray-500">25×20×10 cm</Text>
          </View>

          <Text className="text-gray-500 italic">Special handling: Fragile items.</Text>
        </PrimaryCard>

        {/* Action Buttons */}
        <View className="flex-col mb-8">
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 mr-2 bg-white border-2 border-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
            >
              <Ionicons name="call" size={20} color="#FF8C00" />
              <Text className="text-orange-500 text-base font-bold ml-2">Call Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log('Chat Customer')}
              className="flex-1 ml-2 bg-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
            >
              <Ionicons name="chatbox" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Chat Customer</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => console.log('Report User')}
            className="w-full bg-white border-2 border-red-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
          >
            <MaterialCommunityIcons name="flag" size={20} color="red" />
            <Text className="text-red-500 text-base font-bold ml-2">Report User</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryManagement;
