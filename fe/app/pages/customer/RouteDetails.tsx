import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import { Config } from '@/constants/Config';

export default function RouteDetails() {
  const params = useLocalSearchParams();
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract route data from params (matching MyRoutes structure)
  const routeId = params.id as string || '1cc88146-8e0b-41fa-a81a-17168a1407ec';
  const origin = params.origin as string || 'Colombo';
  const destination = params.destination as string || 'Badulla';
  const status = params.status as string || 'Active';
  const date = params.date as string || 'Oct 26, 2025';
  const timer = params.timer as string || '02 D | 02:56:48 H';
  const bids = params.bids as string || '7';
  const highestBid = params.highestBid as string || 'LKR 250.00';

  useEffect(() => {
    fetchRouteDetails();
  }, []);

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      // Use the mock endpoint for now - replace with real endpoint when available
      const response = await fetch(`${Config.API_BASE}/routes/1cc88146-8e0b-41fa-a81a-17168a1407ec/details`);

      if (!response.ok) {
        throw new Error('Failed to fetch route details');
      }
      const data = await response.json();
      setRouteData(data);
      console.log(data);
    } catch (err) {
      console.error('Error fetching route details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch route details');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Route Details</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className="mt-4 text-gray-600">Loading route details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Route Details</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-800">Error Loading Route</Text>
          <Text className="mt-2 text-gray-600 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={fetchRouteDetails}
            className="mt-4 bg-orange-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Use real data if available, otherwise fall back to params
  const displayData = routeData || {
    originAddress: origin,
    destinationAddress: destination,
    status: status,
    departureTime: date,
    totalBids: parseInt(bids),
    highestBid: highestBid,
    driverName: 'Kasun Perera',
    driverRating: 4.8,
    driverReviewCount: 287,
    totalDistance: '45.2',
    estimatedDuration: '1 hr 45 min',
    routeImage: 'https://via.placeholder.com/300x150',
    routeTags: ['Heavy Cargo', 'Fragile Items', 'Temperature Sensitive']
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Route Details</Text>
        <View className="w-6" /> {/* Spacer for centering */}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Route Image */}
        <View className="mb-4">
          <Image
            source={{ uri: displayData.routeImage || 'https://via.placeholder.com/300x150' }}
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Route Information Card */}
        <PrimaryCard style={{ marginBottom: 16 }}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={20} color="gray" />
            <Text className="text-lg font-semibold ml-2">{displayData.originAddress}</Text>
            <View className={`ml-auto px-3 py-1 rounded-full ${displayData.status === 'INITIATED' ? 'bg-orange-100' : 'bg-red-100'}`}>
              <Text className={`text-xs font-bold ${displayData.status === 'INITIATED' ? 'text-orange-600' : 'text-red-600'}`}>
                {displayData.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="arrow-down" size={20} color="gray" style={{ marginLeft: 2 }} />
            <Text className="text-lg font-semibold ml-2">{displayData.destinationAddress}</Text>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={18} color="gray" />
            <Text className="text-gray-600 ml-2">
              {displayData.departureTime ? new Date(displayData.departureTime).toLocaleDateString() : date}
            </Text>
          </View>
          
          {displayData.status === 'INITIATED' && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={18} color="gray" />
              <Text className="text-gray-600 ml-2">{timer}</Text>
            </View>
          )}
          
          <View className="flex-row items-center mb-4">
            <Ionicons name="people-outline" size={18} color="gray" />
            <Text className="text-gray-600 ml-2">{displayData.totalBids} Bids | Highest: </Text>
            <Text className="text-orange-500 font-bold">LKR {displayData.highestBid}</Text>
          </View>
        </PrimaryCard>

        {/* Route Overview */}
        <PrimaryCard style={{ marginBottom: 16 }}>
          <Text className="text-base font-semibold mb-3">Route Overview</Text>
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-orange-600 font-bold text-lg">LKR {displayData.highestBid}</Text>
              <Text className="text-xs text-gray-500">Highest Bid</Text>
            </View>
            <View>
              <Text className="text-gray-700 font-semibold text-sm">{displayData.estimatedDuration}</Text>
              <Text className="text-xs text-gray-500">{displayData.totalDistance} km</Text>
            </View>
          </View>
          
          {/* Route Tags */}
          <View className="flex-row flex-wrap">
            {displayData.routeTags && displayData.routeTags.map((tag: string, index: number) => (
              <Text key={index} className="text-xs bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">
                {tag}
              </Text>
            ))}
          </View>
        </PrimaryCard>

        {/* Driver Info */}
        <PrimaryCard style={{ marginBottom: 16 }}>
          <Text className="text-base font-semibold mb-3">Driver Information</Text>
          <View className="items-center mb-3">
            <View className="w-16 h-16 bg-blue-500 rounded-full justify-center items-center">
              <Text className="text-white font-bold text-xl">
                {displayData.driverName ? displayData.driverName.split(' ').map((n: string) => n[0]).join('') : 'JD'}
              </Text>
            </View>
            <Text className="mt-2 font-semibold text-base">{displayData.driverName}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color="#FFA500" />
              <Text className="ml-1 text-sm text-gray-700">
                ({displayData.driverRating}) {displayData.driverReviewCount} reviews
              </Text>
            </View>
          </View>
          
        </PrimaryCard>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-10">
          <PrimaryButton
            title="View on Map"
            onPress={() => console.log('View on Map')}
            style={{ flex: 1, marginRight: 8, paddingVertical: 12 }}
            textStyle={{ fontSize: 14 }}
          />
          <PrimaryButton
            title="Request Parcel"
            onPress={() => router.push({
              pathname: '/pages/customer/RequestParcel',
              params: { 
                routeId: routeId,
                origin: origin,
                destination: destination
              }
            })}
            style={{ flex: 1, marginLeft: 8, paddingVertical: 12 }}
            textStyle={{ fontSize: 14 }}
          />
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}
