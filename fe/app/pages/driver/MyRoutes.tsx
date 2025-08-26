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
import { useDriverInfo } from '@/hooks/useEarningsData';
import { formatCurrency, formatDate } from '@/services/apiService';
import { calculateCountdown, formatRouteStatus, isBiddingActive } from '@/utils/routeUtils';

const MyRoutes = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'active' | 'past'>('active');
  
  // Get authenticated driver ID
  const { driverId } = useDriverInfo();
  
  // Fetch all routes and filter on frontend
  const { routes: allRoutes, loading, error, refreshing, refresh } = useMyRoutes(driverId);
  
  // Filter routes based on active filter
  const routes = allRoutes.filter(route => {
    if (activeFilter === 'active') {
      return ['INITIATED', 'OPEN'].includes(route.status);
    } else {
      return ['BOOKED', 'COMPLETED', 'CANCELLED'].includes(route.status);
    }
  });

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
    
    // Use location names from API response (already geocoded by the API)
    const originDisplay = route.originLocationName || `${route.originLat}, ${route.originLng}`;
    const destinationDisplay = route.destinationLocationName || `${route.destinationLat}, ${route.destinationLng}`;

    // Format departure time
    const departureDate = new Date(route.departureTime);
    const formattedDepartureTime = departureDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric'
    });
    const formattedDepartureHour = departureDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <PrimaryCard key={route.id} style={{ marginBottom: 16 }}>
        {/* Header with origin and status */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={18} color="gray" />
          <Text className="text-lg font-semibold ml-2 flex-1" numberOfLines={1}>
            {originDisplay}
          </Text>
          <View className={`ml-2 px-3 py-1 rounded-full ${statusFormat.bgColor}`}>
            <Text className={`text-xs font-bold ${statusFormat.color}`}>
              {statusFormat.label}
            </Text>
          </View>
        </View>
        
        {/* Destination */}
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="arrow-down" size={18} color="gray" style={{ marginLeft: 2 }} />
          <Text className="text-lg font-semibold ml-2 flex-1" numberOfLines={1}>
            {destinationDisplay}
          </Text>
        </View>

        {/* Route Details */}
        <View className="flex-row items-center mb-2 flex-wrap">
          {route.totalDistanceKm && (
            <View className="flex-row items-center mr-4 mb-1">
              <Ionicons name="location" size={14} color="#555" />
              <Text className="text-gray-600 ml-1 text-sm">{route.totalDistanceKm.toFixed(1)} km</Text>
            </View>
          )}
          {route.estimatedDurationMinutes && (
            <View className="flex-row items-center mr-4 mb-1">
              <Ionicons name="time" size={14} color="#555" />
              <Text className="text-gray-600 ml-1 text-sm">{Math.round(route.estimatedDurationMinutes)} min</Text>
            </View>
          )}
          {route.detourToleranceKm && (
            <View className="flex-row items-center mb-1">
              <Ionicons name="swap-horizontal" size={14} color="#555" />
              <Text className="text-gray-600 ml-1 text-sm">±{route.detourToleranceKm} km</Text>
            </View>
          )}
        </View>
        
        {/* Departure Time */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={18} color="gray" />
          <Text className="text-gray-600 ml-2">
            {formattedDepartureTime} at {formattedDepartureHour}
          </Text>
        </View>
        
        {/* Bidding Information */}
        {isActive && countdown !== 'Ended' && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={18} color="#ff6b35" />
            <Text className="text-orange-600 ml-2 font-medium">
              Bidding ends: {countdown}
            </Text>
          </View>
        )}
        
        {/* Price Range */}
        {route.suggestedPriceMin && route.suggestedPriceMax && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="cash-outline" size={18} color="gray" />
            <Text className="text-gray-600 ml-2">
              Suggested: {formatCurrency(route.suggestedPriceMin)} - {formatCurrency(route.suggestedPriceMax)}
            </Text>
          </View>
        )}
        
        {/* Bids Summary */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="people-outline" size={18} color="gray" />
          <Text className="text-gray-600 ml-2">
            {route.bidCount} Bids
            {route.highestBidAmount && (
              <Text className="text-gray-600"> | Highest: </Text>
            )}
            {route.highestBidAmount && (
              <Text className="text-orange-500 font-bold">
                {formatCurrency(route.highestBidAmount)}
              </Text>
            )}
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row justify-between">
          {route.status === 'INITIATED' || route.status === 'OPEN' ? (
            <>
              <PrimaryButton
                title="View Bids"
                onPress={() => router.push(`/pages/driver/ViewBids?routeId=${route.id}`)}
                style={{ flex: 1, marginRight: 4 }}
                textStyle={{ fontSize: 12 }}
              />
              <EditButton
                title="Edit"
                onPress={() => router.push('/pages/driver/create_route/CreateRoute')}
                style={{ flex: 1, marginHorizontal: 4 }}
                textStyle={{ fontSize: 12 }}
              />
              <DeleteButton
                title="Delete"
                onPress={() => handleDeleteRoute(route.id)}
                style={{ flex: 1, marginLeft: 4 }}
                textStyle={{ fontSize: 12 }}
              />
            </>
          ) : route.status === 'BOOKED' ? (
            <>
              <PrimaryButton
                title="View Details"
                onPress={() => router.push(`/pages/driver/ViewBids?routeId=${route.id}`)}
                style={{ flex: 1, marginRight: 8 }}
                textStyle={{ fontSize: 12 }}
              />
              <SecondaryButton
                title="Track Delivery"
                onPress={() => {
                  // TODO: Navigate to delivery tracking
                  Alert.alert('Track Delivery', 'Delivery tracking feature coming soon!');
                }}
                style={{ flex: 1, marginLeft: 8 }}
                textStyle={{ fontSize: 12 }}
              />
            </>
          ) : (
            <PrimaryButton
              title="View Details"
              onPress={() => router.push(`/pages/driver/ViewBids?routeId=${route.id}`)}
              style={{ flex: 1 }}
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
