import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAutomaticBidding from '../../../hooks/useAutomaticBidding';
import { AutomaticBidsView } from '../../../components/automatic-bidding/AutomaticBidsView';
import { formatCurrency, formatDate } from '@/services/apiService';
import { useMyRoutes } from '@/hooks/useMyRoutes';
import { useDriverInfo } from '@/hooks/useEarningsData';

const ViewBids = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { routeId } = useLocalSearchParams();
  const actualRouteId = Array.isArray(routeId) ? routeId[0] : routeId || '1cc88146-8e0b-41fa-a81a-17168a1407ec'; // Fallback for testing
  
  // Component-level error state
  const [componentError, setComponentError] = useState<string | null>(null);
  // Current time for real-time countdown
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get authenticated driver ID
  const { driverId } = useDriverInfo();
  
  // Fetch all routes using the same safe method as MyRoutes
  const { routes: allRoutes, loading: routesLoading, error: routesError } = useMyRoutes(driverId);
  
  // Find the specific route by ID
  const currentRoute = allRoutes.find(route => route.id === actualRouteId) || null;
  
  // Extract location names using the same logic as MyRoutes
  const originDisplay = currentRoute?.originLocationName || 
    (currentRoute?.originLat && currentRoute?.originLng ? `${currentRoute.originLat}, ${currentRoute.originLng}` : 'Unknown origin');
  const destinationDisplay = currentRoute?.destinationLocationName || 
    (currentRoute?.destinationLat && currentRoute?.destinationLng ? `${currentRoute.destinationLat}, ${currentRoute.destinationLng}` : 'Unknown destination');
  
  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Enhanced real-time countdown function (copied from MyRoutes)
  const calculateRealTimeCountdown = (biddingEndTime: string) => {
    const endTime = new Date(biddingEndTime);
    const now = currentTime;
    const timeLeft = endTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return { text: 'Ended', isExpired: true };
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return { text: `${days}d ${hours}h ${minutes}m`, isExpired: false };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m ${seconds}s`, isExpired: false };
    } else if (minutes > 0) {
      return { text: `${minutes}m ${seconds}s`, isExpired: false };
    } else {
      return { text: `${seconds}s`, isExpired: false };
    }
  };
  
  // Calculate bidding end time (2 hours before departure)
  const getBiddingEndTime = (departureTime: string) => {
    const departure = new Date(departureTime);
    const biddingEnd = new Date(departure.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
    return biddingEnd.toISOString();
  };
  
  // Use the new automatic bidding hook instead of manual bidding with safe fallbacks
  const hookResult = useAutomaticBidding(actualRouteId);
  const {
    biddingStatus = null,
    rankedBids = [],
    // We no longer use optimalBids, but keep it for compatibility
    optimalBids = [],
    isLoading = false,
    error = null,
    refreshing = false,
    biddingActive = false,
    biddingEnded = false,
    refresh = () => {}
  } = hookResult || {};
  
  // Get real-time countdown using our improved function
  const realTimeCountdown = biddingStatus?.departureTime 
    ? calculateRealTimeCountdown(getBiddingEndTime(biddingStatus.departureTime))
    : { text: 'No data', isExpired: true };

  // Filter bids by status (status-based logic instead of optimalBids)
  const acceptedBids = rankedBids.filter(bid => bid.status === 'ACCEPTED');
  const pendingBids = rankedBids.filter(bid => bid.status === 'PENDING');
  const rejectedBids = rankedBids.filter(bid => bid.status === 'REJECTED');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewDeliveryManagement = () => {
    if (acceptedBids?.length > 0 && acceptedBids[0]?.id) {
      // Navigate to DeliveryManagement with the winning bid
      const winningBid = acceptedBids[0];
      router.push({ 
        pathname: '/pages/driver/DeliveryManagement', 
        params: { bidId: winningBid.id } 
      });
    } else {
      Alert.alert('No Winners Yet', 'No bids have been accepted yet.');
    }
  };

  if ((isLoading && !refreshing) || (routesLoading && !currentRoute)) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold text-gray-900">View Bids</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-2">Loading route and bidding data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || componentError || routesError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold text-gray-900">View Bids</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text className="text-lg font-semibold text-gray-800 mt-4 text-center">Error Loading Data</Text>
          <Text className="text-gray-600 mt-2 text-center">{error || componentError || routesError}</Text>
          <TouchableOpacity 
            onPress={() => {
              setComponentError(null);
              refresh();
            }}
            className="mt-6 bg-orange-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-gray-900">View Bids</Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#f97316']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {biddingStatus ? (
          <>
            {/* Route Information Card */}
            <PrimaryCard style={{ marginBottom: 16 }}>
              <Text className="text-lg font-bold mb-2">Route Information</Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Route ID</Text>
                <Text className="text-sm font-medium">{actualRouteId.slice(0, 8)}...</Text>
              </View>
              
              {/* Origin Location */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Origin</Text>
                <Text className="text-sm font-medium" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
                  {originDisplay}
                </Text>
              </View>
              
              {/* Destination Location */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Destination</Text>
                <Text className="text-sm font-medium" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
                  {destinationDisplay}
                </Text>
              </View>
              
              {/* Departure time */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Departure</Text>
                <Text className="text-sm font-medium">
                  {new Date(biddingStatus.departureTime).toLocaleString()}
                </Text>
              </View>
              
              {/* Bidding countdown */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Bidding Status</Text>
                <Text className={`text-sm font-medium ${realTimeCountdown.isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {realTimeCountdown.isExpired ? 'Ended' : `Ends in: ${realTimeCountdown.text}`}
                </Text>
              </View>
              
              {/* Total Bids */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Total Bids</Text>
                <Text className="text-sm font-medium">{rankedBids?.length || 0}</Text>
              </View>
              
              {/* Price Range from route data */}
              {currentRoute?.suggestedPriceMin && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600">Price Range (Min)</Text>
                  <Text className="text-sm font-medium">
                    {formatCurrency(currentRoute.suggestedPriceMin)}
                  </Text>
                </View>
              )}
              {currentRoute?.suggestedPriceMax && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">Price Range (Max)</Text>
                  <Text className="text-sm font-medium">
                    {formatCurrency(currentRoute.suggestedPriceMax)}
                  </Text>
                </View>
              )}
            </PrimaryCard>

            {/* Action Button for Winners */}
            {acceptedBids?.length > 0 && (
              <PrimaryCard style={{ marginBottom: 16 }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-green-600">
                      🎉 Winners Selected!
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {acceptedBids?.length || 0} bid(s) have been accepted
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleViewDeliveryManagement}
                    className="bg-green-500 px-4 py-2 rounded-lg ml-3"
                  >
                    <Text className="text-white font-semibold">Manage Delivery</Text>
                  </TouchableOpacity>
                </View>
              </PrimaryCard>
            )}

            {/* Empty State for No Bids */}
            {(!rankedBids || rankedBids.length === 0) && (
              <PrimaryCard style={{ marginBottom: 16 }}>
                <View className="items-center py-8">
                  <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
                  <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
                    No Bids Yet
                  </Text>
                  <Text className="text-gray-600 mt-2 text-center">
                    {biddingActive 
                      ? 'Bidding is still active. Customers will submit bids soon.'
                      : biddingEnded 
                        ? 'Bidding has ended but no bids were received for this route.'
                        : 'Waiting for bidding to begin.'
                    }
                  </Text>
                  {biddingActive && !realTimeCountdown.isExpired && (
                    <View className="mt-4 bg-orange-50 p-3 rounded-lg">
                      <Text className="text-orange-700 text-center font-medium">
                        ⏰ Ends in: {realTimeCountdown.text}
                      </Text>
                    </View>
                  )}
                </View>
              </PrimaryCard>
            )}

            {/* Automatic Bidding View - only show when there are bids */}
            {rankedBids?.length > 0 && (
              <AutomaticBidsView 
                rankedBids={rankedBids || []}
                acceptedBids={acceptedBids || []}
                biddingActive={biddingActive || false}
                biddingEnded={biddingEnded || false}
                onRefresh={refresh}
              />
            )}
          </>
        ) : (
          /* Empty State for No Route Data */
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="car-outline" size={64} color="#9ca3af" />
            <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
              Route Not Found
            </Text>
            <Text className="text-gray-600 mt-2 text-center">
              Unable to load route information. The route may not exist or there may be a connection issue.
            </Text>
            <TouchableOpacity 
              onPress={refresh}
              className="mt-6 bg-orange-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewBids;

