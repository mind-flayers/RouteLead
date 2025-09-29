import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAutomaticBidding from '../../../hooks/useAutomaticBidding';
import { AutomaticBidsView } from '../../../components/automatic-bidding/AutomaticBidsView';
import { formatCurrency, formatDate, ApiService, MyRoute } from '@/services/apiService';

const ViewBids = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { routeId } = useLocalSearchParams();
  const actualRouteId = Array.isArray(routeId) ? routeId[0] : routeId || '1cc88146-8e0b-41fa-a81a-17168a1407ec'; // Fallback for testing
  
  // Component-level error state
  const [componentError, setComponentError] = useState<string | null>(null);
  // Current time for real-time countdown (optimized: updates every 5 seconds)
  const [currentTime, setCurrentTime] = useState(new Date());
  // Route data (fetched separately when needed)
  const [routeData, setRouteData] = useState<MyRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  
  // **PERFORMANCE OPTIMIZATION**: Use only the automatic bidding hook, remove useMyRoutes
  const hookResult = useAutomaticBidding(actualRouteId);
  const {
    biddingStatus = null,
    rankedBids = [],
    optimalBids = [],
    isLoading = false,
    error = null,
    refreshing = false,
    biddingActive = false,
    biddingEnded = false,
    refresh = () => {}
  } = hookResult || {};
  
  // **PERFORMANCE OPTIMIZATION**: Fetch route data only when needed using cached API
  const fetchRouteData = useCallback(async () => {
    if (routeData) return; // Already have data
    
    setRouteLoading(true);
    try {
      const route = await ApiService.getRouteById(actualRouteId, true); // Use cache
      setRouteData(route);
      setComponentError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching route data:', error);
      // Don't set component error if we have bidding data - route info is optional
      if (!biddingStatus) {
        setComponentError(`Route data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      // Set fallback route data from bidding status if available
      if (biddingStatus && !routeData) {
        console.log('🔧 Using fallback route data from bidding status');
        setRouteData({
          id: actualRouteId,
          originLat: 0,
          originLng: 0,
          destinationLat: 0,
          destinationLng: 0,
          departureTime: biddingStatus.departureTime || new Date().toISOString(),
          status: 'OPEN',
          originLocationName: 'Origin',
          destinationLocationName: 'Destination',
          createdAt: new Date().toISOString(),
          biddingEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          bidCount: 0,
          suggestedPriceMin: 0,
          suggestedPriceMax: 0,
          routePolyline: undefined
        });
      }
    } finally {
      setRouteLoading(false);
    }
  }, [actualRouteId, routeData]);
  
  // Fetch route data on mount
  useEffect(() => {
    fetchRouteData();
  }, [fetchRouteData]);
  
  // **PERFORMANCE OPTIMIZATION**: Update time every 5 seconds instead of 1 second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Reduced frequency from 1s to 5s
    
    return () => clearInterval(timer);
  }, []);
  
  // **PERFORMANCE OPTIMIZATION**: Memoize expensive calculations
  const routeInfo = useMemo(() => {
    const route = routeData;
    if (!route) return null;
    
    return {
      originDisplay: route.originLocationName || 
        (route.originLat && route.originLng ? `${route.originLat}, ${route.originLng}` : 'Unknown origin'),
      destinationDisplay: route.destinationLocationName || 
        (route.destinationLat && route.destinationLng ? `${route.destinationLat}, ${route.destinationLng}` : 'Unknown destination')
    };
  }, [routeData]);
  
  // **PERFORMANCE OPTIMIZATION**: Memoized real-time countdown calculation
  const realTimeCountdown = useMemo(() => {
    if (!biddingStatus?.departureTime) {
      return { text: 'No data', isExpired: true };
    }
    
    const endTime = new Date(biddingStatus.departureTime);
    const biddingEndTime = new Date(endTime.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
    const now = currentTime;
    const timeLeft = biddingEndTime.getTime() - now.getTime();
    
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
      return { text: `${hours}h ${minutes}m`, isExpired: false }; // Remove seconds for less frequent updates
    } else if (minutes > 0) {
      return { text: `${minutes}m`, isExpired: false };
    } else {
      return { text: `${Math.max(1, Math.ceil(seconds/5)*5)}s`, isExpired: false }; // Round to 5s increments
    }
  }, [biddingStatus?.departureTime, currentTime]);

  // **PERFORMANCE OPTIMIZATION**: Memoize bid filtering
  const { acceptedBids, pendingBids, rejectedBids } = useMemo(() => ({
    acceptedBids: rankedBids.filter(bid => bid.status === 'ACCEPTED'),
    pendingBids: rankedBids.filter(bid => bid.status === 'PENDING'),
    rejectedBids: rankedBids.filter(bid => bid.status === 'REJECTED')
  }), [rankedBids]);

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

  if ((isLoading && !refreshing) || routeLoading) {
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

  if (error || componentError) {
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
          <Text className="text-gray-600 mt-2 text-center">{error || componentError}</Text>
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
            {/* Route Information Card - Simplified for Performance */}
            <PrimaryCard style={{ marginBottom: 16 }}>
              <Text className="text-lg font-bold mb-2">Bidding Information</Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Route ID</Text>
                <Text className="text-sm font-medium">{actualRouteId.slice(0, 8)}...</Text>
              </View>
              
              {/* Origin Location */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Origin</Text>
                <Text className="text-sm font-medium" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
                  {routeInfo?.originDisplay || 'Loading...'}
                </Text>
              </View>
              
              {/* Destination Location */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Destination</Text>
                <Text className="text-sm font-medium" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
                  {routeInfo?.destinationDisplay || 'Loading...'}
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
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">Total Bids</Text>
                <Text className="text-sm font-medium">{rankedBids?.length || 0}</Text>
              </View>
              
              {/* Price Range from route data */}
              {routeData?.suggestedPriceMin && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600">Price Range (Min)</Text>
                  <Text className="text-sm font-medium">
                    {formatCurrency(routeData.suggestedPriceMin)}
                  </Text>
                </View>
              )}
              {routeData?.suggestedPriceMax && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">Price Range (Max)</Text>
                  <Text className="text-sm font-medium">
                    {formatCurrency(routeData.suggestedPriceMax)}
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

