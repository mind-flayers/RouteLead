import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active Bids', value: 'active' },
  { label: 'Won Bids', value: 'won' },
  { label: 'Lost Bids', value: 'lost' },
];

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://172.17.67.115:8080/api'; // Replace with your actual API base URL
const CUSTOMER_ID = '70ba4867-edcb-4628-b614-7bb60e935862'; // Replace with actual user id

export default function MyBids() {
  const [filter, setFilter] = useState('all');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [bids, setBids] = useState<any[]>([]);
  const [routes, setRoutes] = useState<{ [routeId: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch bids for the user
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/customer/bids?customerId=${CUSTOMER_ID}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch bids');
        const data = await res.json();
        setBids(data);
        return data;
      })
      .then(async (bids) => {
        // Fetch all unique routes for the bids
        const uniqueRouteIds = Array.from(new Set(bids.map((bid: any) => bid.routeId)));
        const routeMap: { [routeId: string]: any } = {};
        await Promise.all(
          uniqueRouteIds.map(async (routeId) => {
            if (!routeId) return;
            try {
              const res = await fetch(`${API_BASE_URL}/routes/${routeId}`);
              if (res.ok) {
                routeMap[routeId] = await res.json();
              }
            } catch {}
          })
        );
        setRoutes(routeMap);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Optionally filter bids by status
  const filteredBids = bids.filter((bid) => {
    if (filter === 'all') return true;
    if (filter === 'active') return bid.status === 'ACTIVE';
    if (filter === 'won') return bid.status === 'WON';
    if (filter === 'lost') return bid.status === 'LOST';
    return true;
  });

  // Group bids by routeId
  const bidsByRoute: { [routeId: string]: any[] } = {};
  filteredBids.forEach((bid) => {
    if (!bidsByRoute[bid.routeId]) bidsByRoute[bid.routeId] = [];
    bidsByRoute[bid.routeId].push(bid);
  });

  const handleFilterSelect = (value: string) => {
    setFilter(value);
    setDropdownVisible(false);
  };

  const handleDelete = async (bidId: string) => {
    Alert.alert('Delete Bid', 'Are you sure you want to delete this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/bids/${bidId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete bid');
            setBids((prev) => prev.filter((b) => b.id !== bidId));
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete bid');
          }
        }
      }
    ]);
  };

  const handleViewDetails = (bidId: string) => {
    router.push(`/pages/customer/BidDetails?bidId=${bidId}`);
  };

  return (
    <View className="flex-1 bg-[#F6F6FA]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white shadow">
        <Text className="text-lg font-bold">My Bids</Text>
        <View className="flex-row items-center space-x-4">
          <Ionicons name="notifications-outline" size={22} color="#222" />
          <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={20} color="#222" />
          </View>
        </View>
      </View>

      {/* Filter & Add */}
      <View className="flex-row items-center justify-between px-4 mt-4 mb-2">
        <TouchableOpacity
          className="flex-row items-center bg-white px-3 py-2 rounded-md border border-gray-200"
          onPress={() => setDropdownVisible(true)}
        >
          <Text className="mr-1 text-gray-700">
            {FILTERS.find(f => f.value === filter)?.label || 'All'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center bg-[#FFA726] px-4 py-2 rounded-md"
          onPress={() => router.push('/pages/customer/FindRoute')}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-1">Add</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0002' }}
          onPress={() => setDropdownVisible(false)}
        >
          <View className="bg-white rounded-md w-48 shadow p-2">
            {FILTERS.map(option => (
              <TouchableOpacity
                key={option.value}
                className="py-2 px-3"
                onPress={() => handleFilterSelect(option.value)}
              >
                <Text className="text-gray-800">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Bids List */}
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFA726" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text className="text-center text-red-500 mt-8">{error}</Text>
        ) : Object.keys(bidsByRoute).length === 0 ? (
          <Text className="text-center text-gray-400 mt-8">No bids found.</Text>
        ) : (
          Object.entries(bidsByRoute).map(([routeId, bids]) => {
            const route = routes[routeId];
            return (
              <View key={routeId} className="mb-6">
                {/* Route Header */}
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="location-on" size={18} color="#FFA726" />
                  <Text className="font-semibold ml-1">
                    {route?.originLat && route?.originLng ? `(${route.originLat}, ${route.originLng})` : 'Origin'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#888" style={{marginHorizontal: 4}} />
                  <Text className="font-semibold ml-1">
                    {route?.destinationLat && route?.destinationLng ? `(${route.destinationLat}, ${route.destinationLng})` : 'Destination'}
                  </Text>
                  <Text className="ml-auto text-xs text-gray-400">
                    {route?.departureTime ? new Date(route.departureTime).toLocaleString() : ''}
                  </Text>
                </View>
                {/* Bids for this route */}
                {bids.map((bid: any) => (
                  <View key={bid.id} className="bg-white rounded-xl p-4 mb-2 shadow-sm">
                    <View className="flex-row items-center justify-between mt-2">
                      <View>
                        <Text className="text-xs text-gray-400">Your Bid</Text>
                        <Text className="text-xl font-bold text-[#FF9800]">${bid.amount}</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-gray-400 text-right">Status</Text>
                        <Text className="text-lg font-bold text-gray-700">{bid.status}</Text>
                      </View>
                    </View>
                    <View className="flex-row mt-4">
                      <TouchableOpacity
                        className="bg-[#FFF3E0] px-4 py-2 rounded-md mr-2"
                        onPress={() => handleDelete(bid.id)}
                      >
                        <Text className="text-[#FFA726] font-semibold">Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-[#0D47A1] px-4 py-2 rounded-md flex-1"
                        onPress={() => handleViewDetails(bid.id)}
                      >
                        <Text className="text-white text-center font-semibold">View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      {/* <View className="flex-row justify-between items-center px-8 py-3 bg-white border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text className="text-xs text-gray-600 mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="list" size={24} color="#0D47A1" />
          <Text className="text-xs text-[#0D47A1] mt-1 font-semibold">My Bids</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="location-outline" size={24} color="#888" />
          <Text className="text-xs text-gray-600 mt-1">Tracking</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}