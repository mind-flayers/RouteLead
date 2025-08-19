import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllBids, BidDto } from '../../../services/apiService';
import { supabase } from '../../../lib/supabase';

// Mock data for won bids with payment status (fallback)
const mockWonBids: BidDto[] = [
  {
    id: 'bid-1',
    routeId: 'route-1',
    requestId: 'request-1',
    startIndex: 0,
    endIndex: 0,
    offeredPrice: 2220.00,
    status: 'ACCEPTED',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
    isPaid: false, // Unpaid
    fromLocation: 'Kandy',
    toLocation: 'Badulle',
    estimatedTime: '3h 30m',
    estimatedPrice: 2250.00
  },
  {
    id: 'bid-2',
    routeId: 'route-2',
    requestId: 'request-2',
    startIndex: 0,
    endIndex: 0,
    offeredPrice: 1850.00,
    status: 'ACCEPTED',
    createdAt: '2025-01-14T14:20:00Z',
    updatedAt: '2025-01-14T14:20:00Z',
    isPaid: true, // Paid
    fromLocation: 'Colombo',
    toLocation: 'Galle',
    estimatedTime: '2h 45m',
    estimatedPrice: 1900.00
  },
  {
    id: 'bid-3',
    routeId: 'route-3',
    requestId: 'request-3',
    startIndex: 0,
    endIndex: 0,
    offeredPrice: 3200.00,
    status: 'ACCEPTED',
    createdAt: '2025-01-13T09:15:00Z',
    updatedAt: '2025-01-13T09:15:00Z',
    isPaid: false, // Unpaid
    fromLocation: 'Jaffna',
    toLocation: 'Trincomalee',
    estimatedTime: '4h 15m',
    estimatedPrice: 3300.00
  }
];

export default function WonBids() {
  const router = useRouter();
  const [wonBids, setWonBids] = useState<BidDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWonBids();
  }, []);

  const fetchWonBids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching won bids...');
      
      // Try to fetch real data from API
      try {
        const allBids = await getAllBids();
        console.log('All bids fetched:', allBids);
        
        // Filter for accepted bids (won bids)
        const acceptedBids = allBids.filter(bid => bid.status === 'ACCEPTED');
        console.log('Accepted bids:', acceptedBids);
        
        // Add mock payment status for now (you can integrate with real payment API later)
        const wonBidsWithPaymentStatus: BidDto[] = acceptedBids.map(bid => ({
          ...bid,
          isPaid: Math.random() > 0.5, // Random payment status for demo
          fromLocation: 'Route Origin', // You can get this from route data
          toLocation: 'Route Destination',
          estimatedTime: '2h 30m',
          estimatedPrice: bid.offeredPrice * 1.1 // 10% higher than bid
        }));
        
        setWonBids(wonBidsWithPaymentStatus);
      } catch (apiError) {
        console.log('API fetch failed, using mock data:', apiError);
        // Fallback to mock data if API fails
        setWonBids(mockWonBids);
      }
      
    } catch (err) {
      console.error('Error fetching won bids:', err);
      setError('Failed to load won bids');
      // Fallback to mock data
      setWonBids(mockWonBids);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid ? { bg: '#E8F5E8', text: '#4CAF50' } : { bg: '#FFF3E0', text: '#FF9800' };
  };

  const handleProceedToPayment = (bidId: string) => {
    console.log('Proceeding to payment for bid:', bidId);
    router.push('/pages/customer/Payment');
  };

  const handleViewDetails = (bidId: string) => {
    console.log('Viewing details for bid:', bidId);
    Alert.alert('Bid Details', `Viewing details for bid: ${bidId}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="mt-4 text-gray-600">Loading won bids...</Text>
      </View>
    );
  }

  if (error && wonBids.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text className="mt-4 text-lg font-semibold text-gray-800">Error Loading Won Bids</Text>
        <Text className="mt-2 text-gray-600 text-center">{error}</Text>
        <TouchableOpacity 
          className="mt-4 bg-[#4CAF50] px-6 py-3 rounded-md"
          onPress={fetchWonBids}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F6F6FA]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white shadow">
        <Text className="text-lg font-bold">Won Bids</Text>
        <View className="flex-row items-center space-x-4">
          <Ionicons name="notifications-outline" size={22} color="#222" />
          <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={20} color="#222" />
          </View>
        </View>
      </View>

      {/* Won Bids List */}
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {wonBids.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="trophy-outline" size={64} color="#CCC" />
            <Text className="mt-4 text-lg font-semibold text-gray-600">No Won Bids</Text>
            <Text className="mt-2 text-gray-500 text-center">You haven't won any bids yet.</Text>
          </View>
        ) : (
          wonBids.map((bid) => {
            const paymentStatusStyle = getPaymentStatusColor(bid.isPaid || false);
            return (
              <View key={bid.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                {/* Route Info */}
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="location-on" size={18} color="#4CAF50" />
                  <Text className="font-semibold ml-1">Route #{bid.routeId?.slice(0, 8)}</Text>
                  <Text className="ml-auto text-xs text-gray-400">{formatDate(bid.createdAt)}</Text>
                </View>

                {/* Payment Status Badge */}
                <View className="flex-row items-center justify-between mb-3">
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: paymentStatusStyle.bg }}
                  >
                    <Text style={{ color: paymentStatusStyle.text }} className="text-xs font-semibold">
                      {bid.isPaid ? 'PAID' : 'UNPAID'}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400">Bid ID: #{bid.id?.slice(0, 8)}</Text>
                </View>

                {/* Bid Details */}
                <View className="flex-row items-center justify-between mt-2">
                  <View>
                    <Text className="text-xs text-gray-400">Your Winning Bid</Text>
                    <Text className="text-xl font-bold text-[#4CAF50]">{formatPrice(bid.offeredPrice)}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-400 text-right">Status</Text>
                    <Text className="text-lg font-bold text-gray-700">{bid.status}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-4">
                  <TouchableOpacity 
                    className="bg-gray-100 px-4 py-2 rounded-md mr-2"
                    onPress={() => handleViewDetails(bid.id)}
                  >
                    <Text className="text-gray-700 font-semibold">View Details</Text>
                  </TouchableOpacity>
                  
                  {/* Show payment button only for unpaid bids */}
                  {!bid.isPaid && (
                    <TouchableOpacity
                      className="bg-[#0D47A1] px-4 py-2 rounded-md flex-1"
                      onPress={() => handleProceedToPayment(bid.id)}
                    >
                      <Text className="text-white text-center font-semibold">Proceed to Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}