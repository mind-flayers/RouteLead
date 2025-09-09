import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';
import { VerificationGuard } from '@/components/guards/VerificationGuard';
import { ApiService, DriverConversation, AvailableCustomer } from '@/services/apiService';
import { useDriverInfo } from '@/hooks/useEarningsData';

const ChatList = () => {
  const router = useRouter();
  const { driverId } = useDriverInfo();
  const [conversations, setConversations] = useState<DriverConversation[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'conversations' | 'available'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (driverId) {
        loadDriverData();
      }
    }, [driverId])
  );

  useEffect(() => {
    if (driverId) {
      loadDriverData();
    }
  }, [driverId]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      if (!driverId) {
        Alert.alert('Error', 'Driver ID not found. Please log in again.');
        return;
      }

      // Load both conversations and available customers
      const [conversationsData, availableData] = await Promise.all([
        ApiService.getDriverConversations(driverId),
        ApiService.getAvailableCustomers(driverId)
      ]);

      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
      setAvailableCustomers(Array.isArray(availableData) ? availableData : []);
    } catch (error) {
      console.error('Error loading driver chat data:', error);
      Alert.alert('Error', 'Failed to load chat data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!driverId) {
        Alert.alert('Error', 'Driver ID not found. Please log in again.');
        return;
      }

      // Load both conversations and available customers
      const [conversationsData, availableData] = await Promise.all([
        ApiService.getDriverConversations(driverId),
        ApiService.getAvailableCustomers(driverId)
      ]);

      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
      setAvailableCustomers(Array.isArray(availableData) ? availableData : []);
    } catch (error) {
      console.error('Error refreshing chat data:', error);
      Alert.alert('Error', 'Failed to refresh chat data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 2880) return 'Yesterday';
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredConversations = (conversations || []).filter(conv =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.routeDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableCustomers = (availableCustomers || []).filter(customer =>
    customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.routeDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total unread messages
  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  const totalNewCustomers = availableCustomers.length;

  const renderConversationItem = (conversation: DriverConversation) => (
    <View
      key={conversation.conversationId}
      className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 mb-3"
    >
      <TouchableOpacity
        className="flex-row items-center"
        onPress={() => router.push({ 
          pathname: '/pages/driver/ChatScreen', 
          params: { 
            conversationId: conversation.conversationId,
            customerName: conversation.customerName,
            customerId: conversation.customerId,
            profileImage: conversation.customerProfileImage || 'profile_placeholder',
            customerPhone: conversation.customerPhone || ''
          } as any 
        })}
      >
        <Image
          source={conversation.customerProfileImage ? 
            { uri: conversation.customerProfileImage } : 
            require('../../../assets/images/profile_placeholder.jpeg')
          }
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="font-bold text-base">{conversation.customerName}</Text>
          <Text className="text-gray-600 text-sm" numberOfLines={1}>
            {conversation.lastMessage || conversation.routeDescription}
          </Text>
          <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
            {conversation.routeDescription}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-500 text-xs mb-1">
            {formatTimeAgo(conversation.lastMessageTime)}
          </Text>
          {conversation.unreadCount > 0 && (
            <View className="bg-orange-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">{conversation.unreadCount}</Text>
            </View>
          )}
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-500">{conversation.deliveryStatus}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Manage Delivery Button */}
      <View className="mt-3 pt-3 border-t border-gray-100">
        <TouchableOpacity
          className="bg-blue-50 py-2 px-3 rounded-lg flex-row items-center justify-center"
          onPress={() => router.push({ 
            pathname: '/pages/driver/DeliveryManagement', 
            params: { bidId: conversation.bidId }
          })}
        >
          <MaterialCommunityIcons name="truck-delivery" size={16} color="#2563eb" />
          <Text className="text-blue-600 font-semibold ml-2 text-sm">Manage Delivery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAvailableCustomerItem = (customer: AvailableCustomer) => (
    <TouchableOpacity
      key={customer.customerId + customer.bidId}
      className="flex-row items-center p-3 bg-white rounded-xl shadow-sm border border-gray-200 mb-3"
      onPress={() => router.push({ 
        pathname: '/pages/driver/ChatScreen', 
        params: { 
          customerId: customer.customerId,
          customerName: customer.customerName,
          bidId: customer.bidId,
          profileImage: customer.customerProfileImage || 'profile_placeholder',
          customerPhone: customer.customerPhone || '',
          isNewConversation: 'true'
        } as any 
      })}
    >
      <Image
        source={customer.customerProfileImage ? 
          { uri: customer.customerProfileImage } : 
          require('../../../assets/images/profile_placeholder.jpeg')
        }
        className="w-12 h-12 rounded-full mr-3"
      />
      <View className="flex-1">
        <Text className="font-bold text-base">{customer.customerName}</Text>
        <Text className="text-gray-600 text-sm" numberOfLines={1}>
          Start conversation
        </Text>
        <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
          {customer.routeDescription}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-gray-500 text-xs mb-1">
          {formatTimeAgo(customer.createdAt)}
        </Text>
        <View className="bg-green-500 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-bold">New</Text>
        </View>
        <Text className="text-xs text-orange-600 font-semibold mt-1">
          LKR {customer.amount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <VerificationGuard 
      featureName="Chat"
      description="Communicate with customers about deliveries and routes"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link href="/pages/driver/Notifications" className="items-center">
            <Ionicons name="notifications-outline" size={24} color="black" />
          </Link>
          <Text className="text-xl font-bold">Chat</Text>
          <Link href="/pages/driver/Profile" className="items-center">
            <View className="flex-row items-center">
              <Image
                source={require('../../../assets/images/profile_placeholder.jpeg')}
                className="w-8 h-8 rounded-full mr-2"
              />
            </View>
          </Link>
        </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F97316']} // Orange color for Android
            tintColor="#F97316" // Orange color for iOS
          />
        }
      >
        {/* Search Input */}
        <View className="mb-4 flex-row items-center bg-gray-100 rounded-xl px-3">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            className="flex-1 p-2 text-base ml-2"
            placeholder="Search conversations..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Conversations/Available Tabs */}
        <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg ${selectedTab === 'conversations' ? 'bg-white shadow-sm' : ''} relative`}
            onPress={() => setSelectedTab('conversations')}
          >
            <View className="flex-row items-center justify-center">
              <Text className={`text-center font-semibold ${selectedTab === 'conversations' ? 'text-orange-500' : 'text-gray-600'}`}>
                Active Chats
              </Text>
              {totalUnreadMessages > 0 && (
                <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                  <Text className="text-white text-xs font-bold">{totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 rounded-lg ${selectedTab === 'available' ? 'bg-white shadow-sm' : ''} relative`}
            onPress={() => setSelectedTab('available')}
          >
            <View className="flex-row items-center justify-center">
              <Text className={`text-center font-semibold ${selectedTab === 'available' ? 'text-orange-500' : 'text-gray-600'}`}>
                New Customers
              </Text>
              {totalNewCustomers > 0 && (
                <View className="bg-green-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                  <Text className="text-white text-xs font-bold">{totalNewCustomers > 99 ? '99+' : totalNewCustomers}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500">Loading conversations...</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {selectedTab === 'conversations' ? (
              filteredConversations.length > 0 ? (
                filteredConversations.map(renderConversationItem)
              ) : (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-gray-500 text-center">
                    {searchQuery ? 'No conversations match your search' : 'No active conversations yet'}
                  </Text>
                </View>
              )
            ) : (
              filteredAvailableCustomers.length > 0 ? (
                filteredAvailableCustomers.map(renderAvailableCustomerItem)
              ) : (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-gray-500 text-center">
                    {searchQuery ? 'No customers match your search' : 'No new customers available'}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <DriverBottomNavigation />
    </SafeAreaView>
    </VerificationGuard>
  );
};

export default ChatList;
