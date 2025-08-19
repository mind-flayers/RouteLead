import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import EditButton from '@/components/ui/EditButton';
import DeleteButton from '@/components/ui/DeleteButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import IndigoButton from '@/components/ui/IndigoButton';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';
import { useMyRoutes } from '@/hooks/useMyRoutes';
import { formatCurrency, formatDate } from '@/services/apiService';
import { calculateCountdown, formatRouteStatus, isBiddingActive } from '@/utils/routeUtils';

const MyRoutes = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'active' | 'past'>('active');
  
  // Mock driver ID - in real app, get from auth context
  const driverId = '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27';
  
  // Determine status filter based on active filter
  const statusFilter = activeFilter === 'active' ? 'OPEN' : undefined;
  
  const { routes, loading, error, refreshing, refresh } = useMyRoutes(driverId, statusFilter);

  const handleFilterChange = (filter: 'active' | 'past') => {
    setActiveFilter(filter);
  };

  const handleDeleteRoute = (routeId: string) => {
    Alert.alert(
      'Delete Route',
      'Are you sure you want to delete this route?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete route API call
            console.log('Delete route:', routeId);
          }
        }
      ]
    );
  };

  const renderRouteCard = useCallback((route: any) => {
    const statusFormat = formatRouteStatus(route.status);
    const countdown = calculateCountdown(route.biddingEndTime);
    const isActive = isBiddingActive(route.biddingEndTime);

    return (
      <PrimaryCard key={route.id} style={{ marginBottom: 16 }}>
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={18} color="gray" />
          <Text className="text-lg font-semibold ml-2" numberOfLines={1}>
            {route.originLocationName || `${route.originLat}, ${route.originLng}`}
          </Text>
          <View className={`ml-auto px-3 py-1 rounded-full ${statusFormat.bgColor}`}>
            <Text className={`text-xs font-bold ${statusFormat.color}`}>
              {statusFormat.label}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="arrow-down" size={18} color="gray" style={{ marginLeft: 2 }} />
          <Text className="text-lg font-semibold ml-2" numberOfLines={1}>
            {route.destinationLocationName || `${route.destinationLat}, ${route.destinationLng}`}
          </Text>
        </View>
        
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={18} color="gray" />
          <Text className="text-gray-600 ml-2">{formatDate(route.createdAt)}</Text>
        </View>
        
        {isActive && countdown !== 'Ended' && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={18} color="gray" />
            <Text className="text-gray-600 ml-2">{countdown}</Text>
          </View>
        )}
        
        <View className="flex-row items-center mb-4">
          <Ionicons name="people-outline" size={18} color="gray" />
          <Text className="text-gray-600 ml-2">{route.bidCount} Bids | Highest: </Text>
          <Text className="text-orange-500 font-bold">
            {route.highestBidAmount ? formatCurrency(route.highestBidAmount) : 'N/A'}
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          {statusFormat.label === 'Active' ? (
            <>
              <PrimaryButton
                title="View Bids"
                onPress={() => router.push(`/pages/driver/ViewBids?routeId=${route.id}`)}
                textStyle={{ fontSize: 12 }}
              />
              <EditButton
                title="Edit"
                onPress={() => router.push('/pages/driver/create_route/CreateRoute')}
                textStyle={{ fontSize: 12 }}
              />
              <DeleteButton
                title="Delete"
                onPress={() => handleDeleteRoute(route.id)}
                textStyle={{ fontSize: 12 }}
              />
            </>
          ) : (
            <PrimaryButton
              title="View Bids"
              onPress={() => router.push(`/pages/driver/ViewBids?routeId=${route.id}`)}
              style={{ flex: 1, paddingVertical: 6, paddingHorizontal: 10 }}
              textStyle={{ fontSize: 12 }}
            />
          )}
        </View>
      </PrimaryCard>
    );
  }, [router]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link href="/pages/driver/Notifications" className="items-center">
            <Ionicons name="notifications-outline" size={24} color="black" />
          </Link>
          <Text className="text-xl font-bold">My Routes</Text>
          <Link href="/pages/driver/Profile" className="items-center">
            <View className="flex-row items-center">
              <Image
                source={require('../../../assets/images/profile_placeholder.jpeg')}
                className="w-8 h-8 rounded-full mr-2"
              />
            </View>
          </Link>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-2">Loading routes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">My Routes</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-8 h-8 rounded-full mr-2"
            />
          </View>
        </Link>
      </View>

      {/* Filter Buttons Section */}
      <View className="flex-row justify-around p-4 bg-white border-b border-gray-200">
        <IndigoButton
          title="Active Routes"
          onPress={() => handleFilterChange('active')}
          style={{ 
            flex: 1, 
            marginRight: 8, 
            paddingVertical: 10, 
            paddingHorizontal: 16,
            backgroundColor: activeFilter === 'active' ? '#4f46e5' : '#e5e7eb'
          }}
          textStyle={{ 
            fontSize: 16,
            color: activeFilter === 'active' ? 'white' : '#6b7280'
          }}
        />
        <SecondaryButton
          title="Past Routes"
          onPress={() => handleFilterChange('past')}
          style={{ 
            flex: 1, 
            marginLeft: 8, 
            paddingVertical: 10, 
            paddingHorizontal: 16,
            backgroundColor: activeFilter === 'past' ? '#4f46e5' : '#e5e7eb'
          }}
          textStyle={{ 
            fontSize: 16,
            color: activeFilter === 'past' ? 'white' : '#6b7280'
          }}
        />
      </View>

      {/* Scrollable Content Section */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#f97316']} />
        }
      >
        {error ? (
          <View className="flex-1 justify-center items-center py-10">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="text-red-600 text-center mt-2 font-medium">Error loading routes</Text>
            <Text className="text-gray-600 text-center mt-1">{error}</Text>
            <TouchableOpacity 
              onPress={refresh}
              className="mt-4 bg-orange-500 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : routes.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <Ionicons name="car-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-600 text-center mt-2 font-medium">
              No {activeFilter} routes found
            </Text>
            <Text className="text-gray-500 text-center mt-1">
              {activeFilter === 'active' 
                ? 'Create your first route to start receiving bids'
                : 'Your completed routes will appear here'
              }
            </Text>
          </View>
        ) : (
          routes.map(renderRouteCard)
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <DriverBottomNavigation />
    </SafeAreaView>
  );
};

export default MyRoutes;
