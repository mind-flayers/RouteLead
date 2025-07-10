import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WonBids() {
     const router = useRouter();
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
        {/* Example Won Bid Card */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="location-on" size={18} color="#4CAF50" />
            <Text className="font-semibold ml-1">Kandy</Text>
            <Ionicons name="arrow-forward" size={16} color="#888" style={{marginHorizontal: 4}} />
            <Text className="font-semibold ml-1">Badulle</Text>
            <Text className="ml-auto text-xs text-gray-400">3h 30m</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-xs text-gray-400">Your Bid</Text>
              <Text className="text-xl font-bold text-[#4CAF50]">LKR 2220</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400 text-right">Est. Route Price</Text>
              <Text className="text-lg font-bold text-gray-700">LKR 2250</Text>
            </View>
          </View>
           <TouchableOpacity
      className="bg-[#0D47A1] px-4 py-3 rounded-md mt-4"
      onPress={() => router.push('/pages/customer/Payment')}
    >
      <Text className="text-white text-center font-semibold">Proceed to Payment</Text>
    </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}