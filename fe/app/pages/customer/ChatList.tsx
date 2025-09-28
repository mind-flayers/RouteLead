import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import CustomerFooter from '@/components/navigation/CustomerFooter';
import { Config } from '@/constants/Config';
import { supabase } from '@/lib/supabase';

// Interface for driver data
interface Driver {
  bidId: string;
  requestId: string;
  requestDescription: string;
  weightKg: number;
  volumeM3: number;
  driverId: string;
  driverName: string;
  driverPhoto: string;
  driverPhone?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  offeredPrice: number;
  bidCreatedAt: string;
  conversationId: string | null;
  hasConversation: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const ChatList = () => {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archives'>('active');

  useEffect(() => {
    loadAvailableDrivers();
  }, []);

  const loadAvailableDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Please log in to view drivers.');
        return;
      }

      setCustomerId(user.id);

      // Fetch available drivers from API
      const response = await fetch(`${Config.API_BASE}/chat/customer/${user.id}/available-drivers`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to load drivers (${response.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDrivers(data.drivers || []);
      } else {
        throw new Error(data.message || 'Failed to load drivers');
      }

    } catch (err: any) {
      console.error('Error loading drivers:', err);
      setError(err?.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (driver: Driver) => {
    try {
      if (!customerId) {
        setError('Please log in to start a conversation.');
        return;
      }

      // If conversation already exists, navigate to it
      if (driver.hasConversation && driver.conversationId) {
        router.push({ 
          pathname: '/pages/customer/Chat', 
          params: { 
            conversationId: driver.conversationId,
            driverName: driver.driverName,
            driverPhoto: driver.driverPhoto || '',
            driverPhone: driver.driverPhone || '',
            driverId: driver.driverId,
            bidId: driver.bidId,
            requestId: driver.requestId
          } 
        });
        return;
      }

      // Create new conversation
      const response = await fetch(`${Config.API_BASE}/chat/conversation/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidId: driver.bidId,
          customerId: customerId,
          driverId: driver.driverId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to create conversation (${response.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Navigate to the new conversation
        router.push({ 
          pathname: '/pages/customer/Chat', 
          params: { 
            conversationId: data.conversationId,
            driverName: driver.driverName,
            driverPhoto: driver.driverPhoto || '',
            driverPhone: driver.driverPhone || '',
            driverId: driver.driverId,
            bidId: driver.bidId,
            requestId: driver.requestId
          } 
        });
      } else {
        throw new Error(data.message || 'Failed to create conversation');
      }

    } catch (err: any) {
      console.error('Error starting conversation:', err);
      setError(err?.message || 'Failed to start conversation');
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getDriverInitials = (driverName: string) => {
    if (!driverName) return 'D';
    return driverName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
  };

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  const filteredDrivers = activeTab === 'active' ? drivers : [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="items-center">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Chat</Text>
        <TouchableOpacity onPress={loadAvailableDrivers} className="items-center">
          <Ionicons name="refresh" size={24} color="#0D47A1" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Search Input */}
        <View className="mb-4 flex-row items-center bg-gray-100 rounded-xl px-3">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            className="flex-1 p-2 text-base ml-2"
            placeholder="Search drivers..."
            placeholderTextColor="#888"
          />
        </View>

        {/* Active/Archives Tabs */}
        <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg ${activeTab === 'active' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('active')}
          >
            <Text className={`text-center font-semibold ${activeTab === 'active' ? 'text-orange-500' : 'text-gray-600'}`}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg ${activeTab === 'archives' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('archives')}
          >
            <Text className={`text-center font-semibold ${activeTab === 'archives' ? 'text-orange-500' : 'text-gray-600'}`}>
              Archives
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#0D47A1" />
            <Text className="mt-2 text-gray-600">Loading drivers...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-red-500 text-center mb-4">{error}</Text>
            <TouchableOpacity 
              className="bg-[#0D47A1] px-4 py-2 rounded-lg"
              onPress={loadAvailableDrivers}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Driver List */
        <View className="space-y-3">
            {filteredDrivers.length === 0 ? (
              <View className="flex-1 items-center justify-center py-8">
                <Ionicons name="car-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-center mt-4 text-lg font-medium">
                  {activeTab === 'active' ? 'No Active Drivers' : 'No Archived Drivers'}
                </Text>
                <Text className="text-gray-400 text-center mt-2 text-sm">
                  {activeTab === 'active' 
                    ? 'You\'ll see drivers here once you have matched and paid requests'
                    : 'Completed deliveries will appear here'
                  }
                </Text>
              </View>
            ) : (
              filteredDrivers.map((driver) => (
            <TouchableOpacity
                  key={driver.bidId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                  onPress={() => handleStartConversation(driver)}
                >
                  {/* Driver Info */}
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 rounded-full mr-3 bg-orange-100 items-center justify-center">
                      {driver.driverPhoto ? (
              <Image
                          source={{ uri: driver.driverPhoto }}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <Text className="text-orange-600 font-bold text-lg">
                          {getDriverInitials(driver.driverName)}
                        </Text>
                      )}
                    </View>
              <View className="flex-1">
                      <Text className="font-bold text-base">{driver.driverName}</Text>
                      <Text className="text-gray-600 text-sm">
                        {driver.vehicleMake} {driver.vehicleModel} • {driver.vehiclePlate}
                      </Text>
              </View>
              <View className="items-end">
                      <Text className="text-green-600 font-bold">{formatPrice(driver.offeredPrice)}</Text>
                      {driver.hasConversation && driver.unreadCount && driver.unreadCount > 0 && (
                        <View className="bg-orange-500 rounded-full w-5 h-5 items-center justify-center mt-1">
                          <Text className="text-white text-xs font-bold">
                            {driver.unreadCount > 99 ? '99+' : driver.unreadCount}
                          </Text>
                  </View>
                )}
              </View>
                  </View>

                  {/* Request Details */}
                  <View className="bg-gray-50 rounded-lg p-3 mb-3">
                    <Text className="font-semibold text-gray-800 mb-1">
                      {driver.requestDescription || 'Parcel Delivery'}
                    </Text>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600 text-sm">
                        {driver.weightKg}kg • {driver.volumeM3}m³
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {formatTime(driver.bidCreatedAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Last Message or Start Chat */}
                  {driver.hasConversation && driver.lastMessage ? (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600 text-sm flex-1 mr-2" numberOfLines={1}>
                        {driver.lastMessage}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {formatTime(driver.lastMessageTime || '')}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center py-2">
                      <Ionicons name="chatbubble-ellipses-outline" size={16} color="#0D47A1" />
                      <Text className="text-[#0D47A1] font-semibold ml-2">Start Conversation</Text>
                    </View>
                  )}
            </TouchableOpacity>
              ))
            )}
        </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <CustomerFooter activeTab="messages" />
    </SafeAreaView>
  );
};

export default ChatList;
