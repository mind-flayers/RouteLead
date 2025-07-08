import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function FindRouteScreen() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'pickup' | 'dropoff' | null>(null);

  // Theme colors
  const colors = {
    navyBlue: '#1e3a8a',
    royalOrange: '#ff6b35',
    lightNavy: '#3b82f6',
    lightOrange: '#ff8c42',
    darkNavy: '#1e40af',
    darkOrange: '#e55a2b'
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        getCurrentLocation();
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.log('Error getting current location:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert('Location Permission', 'Please enable location services to use current location');
      return;
    }
    
    if (currentLocation) {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const locationName = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
          setPickup(locationName || 'Current Location');
        } else {
          setPickup('Current Location');
        }
      } catch (error) {
        setPickup('Current Location');
      }
    } else {
      await getCurrentLocation();
    }
  };

  const handleSearchRoutes = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      Alert.alert('Missing Information', 'Please select both pickup and dropoff locations');
      return;
    }
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setShowRoutes(true);
    }, 1500);
  };

  const clearLocations = () => {
    setPickup('');
    setDropoff('');
    setShowRoutes(false);
  };

  const handleLocationSelect = (type: 'pickup' | 'dropoff') => {
    setSelectedLocation(type);
    // This would open a location picker/map modal
    // For now, we'll simulate location selection
    if (type === 'pickup') {
      setPickup('Selected Pickup Location');
    } else {
      setDropoff('Selected Dropoff Location');
    }
    setSelectedLocation(null);
  };

  const mockRoutes = [
    {
      origin: 'Colombo',
      destination: 'Badulla',
      departureDate: '2025-10-26T09:00:00',
      timeline: '02 D | 02:56:48 H',
      driverName: 'John Doe',
      driverRating: '4.8',
      driverPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      origin: 'Galle',
      destination: 'Matara',
      departureDate: '2025-11-02T08:00:00',
      timeline: '01 D | 12:34:56 H',
      driverName: 'Jane Smith',
      driverRating: '4.9',
      driverPhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
  ];

  const renderMap = () => {
    return (
      <View className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 relative">
        {/* Map Background with Grid */}
        <View className="flex-1">
          {/* Map Grid Pattern */}
          <View className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} className="absolute w-full h-px bg-gray-400" style={{ top: i * 40 }} />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <View key={i} className="absolute h-full w-px bg-gray-400" style={{ left: i * 40 }} />
            ))}
          </View>
          
          {/* Route Line */}
          {pickup && dropoff && (
            <View className="absolute w-full h-full justify-center items-center">
              <View className="w-6 h-6 bg-green-500 rounded-full absolute left-8 top-20 shadow-lg" />
              <View className="w-6 h-6 bg-red-500 rounded-full absolute right-8 bottom-20 shadow-lg" />
              <View className="absolute w-48 h-1 bg-gray-400 transform rotate-45 shadow" />
            </View>
          )}
          
          {/* Map Controls */}
          <View className="absolute top-4 right-4">
            <TouchableOpacity 
              className="bg-white p-3 rounded-full shadow-lg"
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="locate" size={24} color={colors.navyBlue} />
            </TouchableOpacity>
          </View>
          
          {/* Center Map Icon */}
          <View className="absolute inset-0 justify-center items-center">
            <Ionicons name="map" size={48} color={colors.navyBlue} />
            <Text className="text-gray-600 mt-4 font-medium text-lg">Interactive Map</Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              {pickup && dropoff ? 'Route preview available' : 'Tap on map to select locations'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLocationCards = () => {
    return (
      <View className="absolute top-4 left-4 right-4">
        {/* Pickup Card */}
        <TouchableOpacity 
          className="bg-white rounded-lg p-4 mb-3 shadow-lg border-l-4"
          style={{ borderLeftColor: colors.royalOrange }}
          onPress={() => handleLocationSelect('pickup')}
        >
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: colors.royalOrange }}></View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700">Pickup Location</Text>
              <Text className="text-sm text-gray-500 mt-1">
                {pickup || 'Tap to select pickup location'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.navyBlue} />
          </View>
        </TouchableOpacity>

        {/* Dropoff Card */}
        <TouchableOpacity 
          className="bg-white rounded-lg p-4 shadow-lg border-l-4"
          style={{ borderLeftColor: colors.royalOrange }}
          onPress={() => handleLocationSelect('dropoff')}
        >
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: colors.royalOrange }}></View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700">Dropoff Location</Text>
              <Text className="text-sm text-gray-500 mt-1">
                {dropoff || 'Tap to select dropoff location'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.navyBlue} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRoutesBottomSheet = () => {
    if (!showRoutes) return null;

    return (
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-96">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-800">Available Routes</Text>
          <TouchableOpacity onPress={() => setShowRoutes(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView className="p-4">
          <Text className="text-sm text-gray-500 mb-4">
            Showing routes to <Text className="font-semibold">{dropoff}</Text>
          </Text>

          {mockRoutes.map((route, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-lg p-4 mb-3 border-l-4"
              style={{ borderLeftColor: '#FFA726' }}
              onPress={() => router.push('/pages/customer/RouteDetails')}
            >
              <View className="flex-row items-center mb-1">
                <Ionicons name="location-outline" size={16} color="#555" />
                <Text className="ml-2 font-semibold">{route.origin}</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Ionicons name="arrow-down" size={16} color="#555" />
                <Text className="ml-2 font-bold">{route.destination}</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Ionicons name="calendar-outline" size={16} color="#555" />
                <Text className="ml-2">{new Date(route.departureDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={16} color="#555" />
                <Text className="ml-2">{route.timeline}</Text>
              </View>
              <View className="flex-row items-center mt-2">
                {route.driverPhoto ? (
                  <Image source={{ uri: route.driverPhoto }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                ) : (
                  <View style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {route.driverName ? route.driverName.split(' ').map(n => n[0]).join('') : '?'}
                    </Text>
                  </View>
                )}
                <Text className="font-medium">{route.driverName}</Text>
                <Ionicons name="star" size={16} color="#FFA500" style={{ marginLeft: 8 }} />
                <Text className="ml-1">{route.driverRating}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
        style={{ backgroundColor: colors.navyBlue }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-white">Find Route</Text>
        <TouchableOpacity onPress={clearLocations}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Map Area */}
      <View className="flex-1 relative">
        {renderMap()}
        {renderLocationCards()}
        
        {/* Search Button - Floating */}
        {pickup && dropoff && !showRoutes && (
          <View className="absolute bottom-6 left-4 right-4">
            <TouchableOpacity
              onPress={handleSearchRoutes}
              disabled={isSearching}
              style={{
                backgroundColor: isSearching ? '#d1d5db' : colors.royalOrange,
                borderRadius: 12,
                paddingVertical: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-center">
                {isSearching ? (
                  <>
                    <Ionicons name="search" size={20} color="#666" />
                    <Text className="text-gray-600 font-semibold ml-2">Searching Routes...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Search Routes</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
        
        {renderRoutesBottomSheet()}
      </View>
    </View>
  );
}
