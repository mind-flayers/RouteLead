import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CustomerFooter({ activeTab }: { activeTab?: string }) {
  return (
    <View className="flex-row justify-around items-center h-16 border-t border-gray-200 bg-white">
      <TouchableOpacity className="items-center" onPress={() => router.push('/pages/customer/Dashboard')}>
        <Ionicons name="home" size={22} color={activeTab === 'home' ? "#FF6600" : "#888"} />
        <Text className={`text-xs mt-1 ${activeTab === 'home' ? 'font-semibold text-black' : 'text-gray-500'}`}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity className="items-center" onPress={() => router.push('/pages/customer/ChatList')}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color={activeTab === 'messages' ? "#FF6600" : "#888"} />
        <Text className={`text-xs mt-1 ${activeTab === 'messages' ? 'font-semibold text-black' : 'text-gray-500'}`}>Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity className="items-center" onPress={() => router.push('/pages/customer/Profile')}>
        <Ionicons name="person-circle-outline" size={22} color={activeTab === 'profile' ? "#FF6600" : "#888"} />
        <Text className={`text-xs mt-1 ${activeTab === 'profile' ? 'font-semibold text-black' : 'text-gray-500'}`}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
} 