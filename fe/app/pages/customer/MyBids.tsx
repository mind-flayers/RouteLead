import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView , Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomerFooter from '../../../components/navigation/CustomerFooter';
import { Config } from '@/constants/Config';
import { supabase } from '@/lib/supabase';

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function MyBids() {
  const [filter, setFilter] = useState('ALL');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ [id: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setError('Please log in to view your requests.');
          return;
        }
        setCustomerId(user.id);
        const url = `${Config.API_BASE}/parcel-requests/by-customer?customerId=${user.id}`;
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load requests (${res.status})`);
        }
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFilterSelect = (value: string) => {
    setFilter(value);
    setDropdownVisible(false);
  };

  const deleteRequest = async (id: string) => {
    setDeleting(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${Config.API_BASE}/parcel-requests/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to delete (${res.status})`);
      }
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      Alert.alert('Delete failed', e?.message || 'Unable to delete this request.');
    } finally {
      setDeleting(prev => {
        const next = { ...prev } as any;
        delete next[id];
        return next;
      });
    }
  };

  const confirmAndDelete = (id: string) => {
    Alert.alert(
      'Delete request?',
      'This will permanently remove the parcel request.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteRequest(id) }
      ]
    );
  };
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white shadow">
        <Text className="text-lg font-bold">My Parcel Requests</Text>
        <View className="flex-row items-center space-x-4">
          <Ionicons name="notifications-outline" size={22} color="#222" />
          <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={20} color="#222" />
          </View>
        </View>
      </View>

      {/* Filter & Add */}
      {/* Filter Dropdown */}
      <View className="flex-row items-center justify-between px-4 mt-4 mb-2">
        <TouchableOpacity
          className="flex-row items-center bg-white px-3 py-2 rounded-md border border-gray-200"
          onPress={() => setDropdownVisible(true)}
        >
          <Text className="mr-1 text-gray-700">{FILTERS.find(f => f.value === filter)?.label || 'All'}</Text>
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
       

      {/* Requests List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text className="mt-2 text-gray-600">Loading your requests...</Text>
        </View>
      ) : error ? (
        <View className="px-4 mt-6">
          <Text className="text-red-500">{error}</Text>
        </View>
      ) : (
        <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
          {requests
            .filter(r => filter === 'ALL' ? true : (r.status === filter))
            .map((r, idx) => (
              <View key={r.id || idx} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="location-on" size={18} color="#FFA726" />
                  <Text className="font-semibold ml-1">Pickup</Text>
                  <Ionicons name="arrow-forward" size={16} color="#888" style={{marginHorizontal: 4}} />
                  <Text className="font-semibold ml-1">Dropoff</Text>
                  <Text className="ml-auto text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <View>
                    <Text className="text-xs text-gray-400">Status</Text>
                    <Text className="text-base font-semibold">{r.status}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-400 text-right">Weight / Volume</Text>
                    <Text className="text-base font-semibold text-gray-700">{r.weightKg} kg / {r.volumeM3} m³</Text>
                  </View>
                </View>
                {r.description ? (
                  <Text className="text-gray-600 mt-3">{r.description}</Text>
                ) : null}
                <View className="flex-row mt-4">
                  <TouchableOpacity className="bg-[#FFF3E0] px-4 py-2 rounded-md mr-2" onPress={() => confirmAndDelete(r.id)} disabled={!!deleting[r.id]}>
                    <Text className="text-[#FFA726] font-semibold">{deleting[r.id] ? 'Deleting...' : 'Delete'}</Text>
                  </TouchableOpacity>
                  {(r.status === 'OPEN' || r.status === 'MATCHED') && (
                    <TouchableOpacity
                      className="bg-[#0D47A1] px-4 py-2 rounded-md flex-1"
                      onPress={() => router.push({
                        pathname: '/pages/customer/RequestConfirmation',
                        params: {
                          requestId: r.id,
                          weight: `${r.weightKg} kg`,
                          volume: `${r.volumeM3} m³`,
                          description: r.description || '',
                          maxBudget: r.maxBudget ? r.maxBudget.toString() : '1000.00',
                          pickupContactName: r.pickupContactName || '',
                          pickupContactPhone: r.pickupContactPhone || '',
                          deliveryContactName: r.deliveryContactName || '',
                          deliveryContactPhone: r.deliveryContactPhone || ''
                        }
                      })}
                    >
                      <Text className="text-white text-center font-semibold">View Details</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          {requests.length === 0 && (
            <Text className="text-gray-600 mt-6">No parcel requests yet.</Text>
          )}
        </ScrollView>
      )}

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
      <CustomerFooter activeTab="home" />
    </View>
  );
}