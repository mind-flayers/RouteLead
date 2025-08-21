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

// Interface for payment status
interface PaymentStatus {
  bidId: string;
  paymentStatus: string;
  amount: number;
  transactionId: string;
  orderId: string;
  paid: boolean;
  paymentDate: string;
}

export default function MyBids() {
  const [filter, setFilter] = useState('ALL');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ [id: string]: boolean }>({});
  
  // Payment status state
  const [paymentStatuses, setPaymentStatuses] = useState<{ [requestId: string]: PaymentStatus[] }>({});
  const [paymentLoading, setPaymentLoading] = useState<{ [requestId: string]: boolean }>({});
  
  const router = useRouter();

  // Function to fetch payment status for a request
  const fetchPaymentStatus = async (requestId: string) => {
    try {
      setPaymentLoading(prev => ({ ...prev, [requestId]: true }));
      
      const response = await fetch(`${Config.API_BASE}/payments/request/${requestId}/status`);
      
      if (!response.ok) {
        console.warn(`Failed to fetch payment status for request ${requestId}: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.paymentStatuses) {
        setPaymentStatuses(prev => ({
          ...prev,
          [requestId]: data.paymentStatuses
        }));
      }
    } catch (error) {
      console.error(`Error fetching payment status for request ${requestId}:`, error);
    } finally {
      setPaymentLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Function to get payment status for a request
  const getPaymentStatusForRequest = (requestId: string) => {
    const statuses = paymentStatuses[requestId] || [];
    const paidStatuses = statuses.filter(s => s.paid);
    
    if (statuses.length === 0) {
      return { status: 'unknown', text: 'Unknown', color: '#6B7280', amount: null };
    }
    
    if (paidStatuses.length > 0) {
      const totalPaid = paidStatuses.reduce((sum, s) => sum + s.amount, 0);
      return { 
        status: 'paid', 
        text: `Paid LKR ${totalPaid.toLocaleString()}`, 
        color: '#10B981',
        amount: totalPaid
      };
    }
    
    const totalUnpaid = statuses.reduce((sum, s) => sum + s.amount, 0);
    return { 
      status: 'unpaid', 
      text: `Unpaid LKR ${totalUnpaid.toLocaleString()}`, 
      color: '#EF4444',
      amount: totalUnpaid
    };
  };

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
        const requestsList = Array.isArray(data) ? data : [];
        setRequests(requestsList);
        
        // Fetch payment status for each request
        for (const request of requestsList) {
          if (request.id) {
            fetchPaymentStatus(request.id);
          }
        }
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
          <TouchableOpacity 
            onPress={() => {
              // Refresh payment status for all requests
              requests.forEach(request => {
                if (request.id) {
                  fetchPaymentStatus(request.id);
                }
              });
            }}
            className="p-2"
          >
            <Ionicons name="refresh" size={22} color="#0D47A1" />
          </TouchableOpacity>
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
            .map((r, idx) => {
              const paymentStatus = getPaymentStatusForRequest(r.id);
              const isLoadingPayment = paymentLoading[r.id];
              
              return (
                <View key={r.id || idx} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="location-on" size={18} color="#FFA726" />
                    <Text className="font-semibold ml-1">Pickup</Text>
                    <Ionicons name="arrow-forward" size={16} color="#888" style={{marginHorizontal: 4}} />
                    <Text className="font-semibold ml-1">Dropoff</Text>
                    
                    {/* Payment Status Tag */}
                    <View className="ml-auto flex-row items-center">
                      {isLoadingPayment ? (
                        <ActivityIndicator size="small" color="#6B7280" />
                      ) : (
                        <View 
                          className="px-2 py-1 rounded-full mr-2"
                          style={{ backgroundColor: `${paymentStatus.color}20` }}
                        >
                          <Text 
                            className="text-xs font-semibold"
                            style={{ color: paymentStatus.color }}
                          >
                            {paymentStatus.text}
                          </Text>
                        </View>
                      )}
                      <Text className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</Text>
                    </View>
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
                   
                                      {/* Chat Button - Show only if payment is completed */}
                   {paymentStatus.status === 'paid' && (
                     <TouchableOpacity
                       className="bg-green-600 px-3 py-2 rounded-md mr-2"
                       onPress={() => router.push({
                         pathname: '/pages/customer/ChatList',
                         params: {
                           requestId: r.id,
                           bidId: paymentStatuses[r.id]?.[0]?.bidId || '',
                           driverId: '', // Will be populated from backend
                           requestTitle: `${r.weightKg}kg parcel - ${r.description || 'Delivery'}`
                         }
                       })}
                     >
                       <View className="flex-row items-center">
                         <Ionicons name="chatbubble-ellipses" size={14} color="white" />
                         <Text className="text-white font-semibold text-sm ml-1">Chat</Text>
                       </View>
                     </TouchableOpacity>
                   )}
                   
                   {(r.status === 'OPEN' || r.status === 'MATCHED') && (
                     <TouchableOpacity
                       className={`px-4 py-2 rounded-md flex-1 ${
                         paymentStatus.status === 'paid' ? 'bg-blue-600' : 'bg-[#0D47A1]'
                       }`}
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
            )})}
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