import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView , Modal, Pressable } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active Bids', value: 'active' },
  { label: 'Won Bids', value: 'won' },
  { label: 'Lost Bids', value: 'lost' },
];

export default function MyBids() {const [filter, setFilter] = useState('all');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();

  const handleFilterSelect = (value: string) => {
  setFilter(value);
  setDropdownVisible(false);
  if (value === 'won') {
    router.push('/pages/customer/WonBids');
  } else if (value === 'active') {
    router.push('/pages/customer/ActiveBids');
  } else if (value === 'lost') {
    router.push('/pages/customer/LostBids');
  }
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
      {/* Filter Dropdown */}
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
        {/* Bid Card 1 */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="location-on" size={18} color="#FFA726" />
            <Text className="font-semibold ml-1">New York, NY</Text>
            <Ionicons name="arrow-forward" size={16} color="#888" style={{marginHorizontal: 4}} />
            <Text className="font-semibold ml-1">Boston, MA</Text>
            <Text className="ml-auto text-xs text-gray-400">3h 30m</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-xs text-gray-400">Your Bid</Text>
              <Text className="text-xl font-bold text-[#FF9800]">$220</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400 text-right">Est. Route Price</Text>
              <Text className="text-lg font-bold text-gray-700">$250</Text>
            </View>
          </View>
          <View className="flex-row mt-4">
            <TouchableOpacity className="bg-[#FFF3E0] px-4 py-2 rounded-md mr-2">
              <Text className="text-[#FFA726] font-semibold">Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#222] px-4 py-2 rounded-md flex-1">
              <Text className="text-white text-center font-semibold">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bid Card 2 */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="location-on" size={18} color="#FFA726" />
            <Text className="font-semibold ml-1">Houston, TX</Text>
            <Ionicons name="arrow-forward" size={16} color="#888" style={{marginHorizontal: 4}} />
            <Text className="font-semibold ml-1">Dallas, TX</Text>
            <Text className="ml-auto text-xs text-gray-400">4h 00m</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-xs text-gray-400">Your Bid</Text>
              <Text className="text-xl font-bold text-[#FF9800]">$175</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400 text-right">Est. Route Price</Text>
              <Text className="text-lg font-bold text-gray-700">$180</Text>
            </View>
          </View>
          <View className="flex-row mt-4">
            <View className="bg-[#FFFDE7] px-4 py-2 rounded-md mr-2">
              <Text className="text-[#FBC02D] font-semibold">Active</Text>
            </View>
            <TouchableOpacity className="bg-[#222] px-4 py-2 rounded-md flex-1">
              <Text className="text-white text-center font-semibold">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-between items-center px-8 py-3 bg-white border-t border-gray-200">
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
      </View>
    </View>
  );
}