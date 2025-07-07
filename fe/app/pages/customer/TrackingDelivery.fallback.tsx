import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TrackingDelivery() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-10 pb-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center -ml-6">Real-Time Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map Image */}
      <View className="w-full h-44 bg-gray-200 mb-4">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' }}
          className="w-full h-full rounded-b-2xl"
          resizeMode="cover"
        />
      </View>

      {/* Driver arrives soon */}
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text className="font-semibold text-base">Driver arrives soon</Text>
        <View className="bg-[#1565C0] px-3 py-1 rounded-full">
          <Text className="text-white font-semibold text-xs">2 mins</Text>
        </View>
      </View>

      {/* Driver Card */}
      <View className="flex-row items-center bg-white px-4 py-3 rounded-xl mx-4 mb-3 shadow-sm border border-gray-100">
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          className="w-12 h-12 rounded-full"
        />
        <View className="ml-3 flex-1">
          <Text className="font-semibold">Joshua</Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FFD600" />
            <Text className="ml-1 text-xs text-gray-600">4.9</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500">382-50D23</Text>
          <Text className="text-xs text-gray-500">BMW-R2</Text>
        </View>
      </View>

      {/* Chat and Call Buttons */}
      <View className="flex-row px-4 mb-4 space-x-3">
        <TouchableOpacity
          className="flex-1 bg-[#FFF3E0] py-3 rounded-md flex-row items-center justify-center"
          onPress={() => router.push('/pages/customer/Chat')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFA726" />
          <Text className="ml-2 text-[#FFA726] font-semibold">Chat with driver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#E3F2FD] py-3 rounded-md flex-row items-center justify-center"
          onPress={() => {/* Call driver logic */}}
        >
          <Ionicons name="call-outline" size={18} color="#1565C0" />
          <Text className="ml-2 text-[#1565C0] font-semibold">Call driver</Text>
        </TouchableOpacity>
      </View>

      {/* Add stops banner */}
      <View className="flex-row items-center bg-[#FFF8E1] rounded-xl mx-4 mb-4 p-3">
        <View className="flex-1">
          <Text className="font-semibold text-[#FFA726] mb-1">Add up to 5 stops to your ride.</Text>
          <Text className="text-xs text-gray-600">Planning a quick errand? No problem, add multiple destinations with ease.</Text>
        </View>
        <TouchableOpacity
          className="ml-2"
          onPress={() => {/* Learn more logic */}}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=100&q=80' }}
            className="w-16 h-12 rounded-lg"
          />
        </TouchableOpacity>
      </View>

      {/* Trip Details */}
      <View className="bg-white rounded-xl mx-4 mb-4 p-4 border border-gray-100">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="home" size={20} color="#FFA726" />
          <Text className="ml-2 font-semibold">Home 4.3km</Text>
        </View>
        <Text className="text-xs text-gray-500 ml-7 mb-2">
          3342 Hill Street, Jacksonville, FL 32202
          <Text className="text-[#FFA726] font-semibold">, Change or Add</Text>
        </Text>
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
          <Text className="ml-2 font-semibold">$12.32</Text>
          <Text className="ml-2 text-xs text-gray-500">MasterCard 2321</Text>
          <Text className="ml-2 text-[#FFA726] font-semibold">Change</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="share-social-outline" size={18} color="#0D47A1" />
          <Text className="ml-2 text-xs text-gray-600">Share this trip status</Text>
          <Text className="ml-2 text-[#0D47A1] font-semibold">Share</Text>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View className="flex-row justify-between items-center px-4 pb-6">
        <TouchableOpacity
          className="flex-1 bg-white border border-[#E53935] py-3 rounded-md flex-row items-center justify-center mr-2"
          onPress={() => {/* Cancel trip logic */}}
        >
          <Ionicons name="close-circle-outline" size={20} color="#E53935" />
          <Text className="ml-2 text-[#E53935] font-semibold">Cancel trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#FFF3E0] py-3 rounded-md flex-row items-center justify-center ml-2"
          onPress={() => {/* Safety tools logic */}}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#FFA726" />
          <Text className="ml-2 text-[#FFA726] font-semibold">Safety tools</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
