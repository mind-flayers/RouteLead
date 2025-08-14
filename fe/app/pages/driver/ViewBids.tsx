import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import SecondaryButton from '../../../components/ui/SecondaryButton';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import IndigoButton from '../../../components/ui/IndigoButton';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useViewBids } from '@/hooks/useViewBids';
import { formatCurrency, formatDate } from '@/services/apiService';
import { calculateCountdown, isBiddingActive } from '@/utils/routeUtils';

const ViewBids = () => {
  const navigation = useNavigation();
  const { routeId } = useLocalSearchParams();
  const actualRouteId = Array.isArray(routeId) ? routeId[0] : routeId || '1cc88146-8e0b-41fa-a81a-17168a1407ec'; // Fallback for testing
  
  // console.log('ViewBids - routeId from params:', routeId);
  // console.log('ViewBids - actualRouteId:', actualRouteId);
  
  const [sortOption, setSortOption] = useState<'price' | 'time' | 'rating'>('price');
  const [filterOption, setFilterOption] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { data, loading, error, refreshing, refresh, updateBidStatus } = useViewBids(actualRouteId, sortOption, filterOption);

  // Update countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate real-time countdown
  const getRealTimeCountdown = () => {
    if (!data?.biddingEndTime) return 'Loading...';
    return calculateCountdown(data.biddingEndTime);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewDetails = () => {
    // Navigate to DeliveryManagement screen
    (navigation as any).navigate('pages/driver/DeliveryManagement');
  };

  const handleAcceptBid = useCallback(async (bidId: string) => {
    Alert.alert(
      'Accept Bid',
      'Are you sure you want to accept this bid?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          style: 'default',
          onPress: async () => {
            const success = await updateBidStatus(bidId, 'ACCEPTED');
            if (success) {
              Alert.alert('Success', 'Bid accepted successfully!');
            }
          }
        }
      ]
    );
  }, [updateBidStatus]);

  const handleRejectBid = useCallback(async (bidId: string) => {
    Alert.alert(
      'Reject Bid',
      'Are you sure you want to reject this bid?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: async () => {
            const success = await updateBidStatus(bidId, 'REJECTED');
            if (success) {
              Alert.alert('Success', 'Bid rejected successfully!');
            }
          }
        }
      ]
    );
  }, [updateBidStatus]);

  const renderBidCard = useCallback((bid: any, showActions = true) => {
    const customerName = `${bid.customerFirstName || ''} ${bid.customerLastName || ''}`.trim();
    
    return (
      <PrimaryCard key={bid.id} style={{ marginBottom: 16 }}>
        {/* Customer Info */}
        <View className="flex-row items-center mb-3">
          <Image 
            source={require('../../../assets/images/profile_placeholder.jpeg')} 
            className="w-12 h-12 rounded-full"
          />
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold">{customerName || 'Unknown Customer'}</Text>
            <Text className="text-gray-500 text-sm">{formatDate(bid.createdAt)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-green-600">
              {formatCurrency(bid.offeredPrice)}
            </Text>
            <Text className="text-xs text-gray-500">
              Status: {bid.status}
            </Text>
          </View>
        </View>

        {/* Parcel Details */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            {bid.weightKg}kg • {bid.volumeM3}m³
          </Text>
          {bid.description && (
            <Text className="text-sm text-gray-600 mb-2">{bid.description}</Text>
          )}
        </View>

        {/* Pickup Location */}
        <View className="flex-row items-start mb-2">
          <Ionicons name="location" size={16} color="#10b981" style={{ marginTop: 2 }} />
          <View className="ml-2 flex-1">
            <Text className="text-sm font-medium text-gray-700">Pickup</Text>
            <Text className="text-sm text-gray-600">
              {bid.pickupLocationName || `${bid.pickupLat}, ${bid.pickupLng}`}
            </Text>
          </View>
        </View>

        {/* Delivery Location */}
        <View className="flex-row items-start mb-3">
          <Ionicons name="location" size={16} color="#ef4444" style={{ marginTop: 2 }} />
          <View className="ml-2 flex-1">
            <Text className="text-sm font-medium text-gray-700">Delivery</Text>
            <Text className="text-sm text-gray-600">
              {bid.dropoffLocationName || `${bid.dropoffLat}, ${bid.dropoffLng}`}
            </Text>
          </View>
        </View>

        {/* Special Instructions */}
        {bid.specialInstructions && (
          <View className="mb-3 p-2 bg-yellow-50 rounded">
            <Text className="text-sm font-medium text-yellow-800">Special Instructions:</Text>
            <Text className="text-sm text-yellow-700">{bid.specialInstructions}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {showActions && bid.status === 'PENDING' && (
          <View className="flex-row justify-between mt-3">
            <TouchableOpacity 
              onPress={() => handleAcceptBid(bid.id)}
              className="flex-1 bg-green-500 py-2 px-4 rounded-lg mr-2"
            >
              <Text className="text-white font-bold text-center">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleRejectBid(bid.id)}
              className="flex-1 bg-red-500 py-2 px-4 rounded-lg ml-2"
            >
              <Text className="text-white font-bold text-center">Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </PrimaryCard>
    );
  }, [handleAcceptBid, handleRejectBid]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold">View Bids</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-2">Loading bids...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">View Bids</Text>
        <View className="w-10" />
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-2">Loading bids...</Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#f97316']} />
          }
        >
          {data && (
          <>
            {/* Route Details Card */}
            <View className="p-4 bg-white mb-4">
              <Text className="text-lg font-bold mb-2">Route ID: {data.routeId.substring(0, 8)}...</Text>
              <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location-sharp" size={20} color="#6B7280" />
                  <Text className="ml-2 text-base font-semibold" numberOfLines={1}>
                    {data.routeOriginLocationName || `${data.routeOriginLat}, ${data.routeOriginLng}`}
                  </Text>
                </View>
                <View className="items-center my-1">
                  <Ionicons name="arrow-down" size={20} color="#6B7280" />
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location-sharp" size={20} color="#6B7280" />
                  <Text className="ml-2 text-base font-semibold" numberOfLines={1}>
                    {data.routeDestinationLocationName || `${data.routeDestinationLat}, ${data.routeDestinationLng}`}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-3">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="ml-1 text-sm text-gray-600">
                      Bidding ends: {getRealTimeCountdown()}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${data.isActive && getRealTimeCountdown() !== 'Ended' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-xs font-bold ${data.isActive && getRealTimeCountdown() !== 'Ended' ? 'text-green-600' : 'text-red-600'}`}>
                      {data.isActive && getRealTimeCountdown() !== 'Ended' ? 'Active' : 'Ended'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Filter and Sort Options */}
            <View className="p-4 bg-white mb-4">
              <Text className="text-lg font-bold mb-3">Filter & Sort</Text>
              
              {/* Sort Options */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">Sort by:</Text>
                <View className="flex-row flex-wrap">
                  {[
                    { key: 'price', label: 'Price' },
                    { key: 'time', label: 'Time' },
                    { key: 'rating', label: 'Rating' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      onPress={() => setSortOption(option.key as any)}
                      className={`mr-2 mb-2 px-3 py-1 rounded-full ${
                        sortOption === option.key ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <Text className={`text-sm ${
                        sortOption === option.key ? 'text-white' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter Options */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Filter by status:</Text>
                <View className="flex-row flex-wrap">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'rejected', label: 'Rejected' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      onPress={() => setFilterOption(option.key as any)}
                      className={`mr-2 mb-2 px-3 py-1 rounded-full ${
                        filterOption === option.key ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <Text className={`text-sm ${
                        filterOption === option.key ? 'text-white' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Bids Section */}
            <View className="p-4">
              <Text className="text-lg font-bold mb-3">
                Bids ({data?.bids?.filter(bid => 
                  filterOption === 'all' || bid.status.toLowerCase() === filterOption
                ).length || 0})
              </Text>
              
              {error ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                  <Text className="text-red-600 text-center mt-2 font-medium">Error loading bids</Text>
                  <Text className="text-gray-600 text-center mt-1">{error}</Text>
                </View>
              ) : (!data?.bids || data.bids.filter(bid => 
                filterOption === 'all' || bid.status.toLowerCase() === filterOption
              ).length === 0) ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Ionicons name="mail-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-600 text-center mt-2 font-medium">No bids found</Text>
                  <Text className="text-gray-500 text-center mt-1">
                    {filterOption === 'all' 
                      ? 'No bids have been placed for this route yet'
                      : `No ${filterOption} bids found`
                    }
                  </Text>
                </View>
              ) : (
                data.bids
                  .filter(bid => filterOption === 'all' || bid.status.toLowerCase() === filterOption)
                  .map(bid => renderBidCard(bid, true))
              )}
            </View>

            {/* Accepted Bids Section */}
            {data?.acceptedBids?.length > 0 && (
              <View className="p-4 border-t border-gray-200">
                <Text className="text-lg font-bold mb-3 text-green-600">
                  Won Bids ({data?.acceptedBids?.length || 0})
                </Text>
                {data?.acceptedBids?.map(bid => renderBidCard(bid, false)) || []}
              </View>
            )}
          </>
        )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ViewBids;
