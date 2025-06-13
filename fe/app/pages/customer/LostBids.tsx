import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function LostBids() {
  return (
    <View className="flex-1 bg-[#F6F6FA]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white shadow">
        <Text className="text-lg font-bold">Lost Bids</Text>
        <View className="flex-row items-center space-x-4">
          <Ionicons name="notifications-outline" size={22} color="#222" />
          <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={20} color="#222" />
          </View>
        </View>
      </View>

      {/* Lost Bids List */}
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {/* Example Lost Bid Card */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="location-on" size={18} color="#E53935" />
            <Text className="font-semibold ml-1">Chicago, IL</Text>
            <Ionicons name="arrow-forward" size={16} color="#888" style={{marginHorizontal: 4}} />
            <Text className="font-semibold ml-1">Detroit, MI</Text>
            <Text className="ml-auto text-xs text-gray-400">5h 10m</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-xs text-gray-400">Your Bid</Text>
              <Text className="text-xl font-bold text-[#E53935]">$120</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400 text-right">Est. Route Price</Text>
              <Text className="text-lg font-bold text-gray-700">$140</Text>
            </View>
          </View>
          <View className="bg-[#FFEBEE] px-4 py-2 rounded-md mt-4 w-24">
            <Text className="text-[#E53935] font-semibold text-center">Lost</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}