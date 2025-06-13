import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PastDeliveries() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#F6F6FA] px-4 pt-10">
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#0D47A1" />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1 text-center -ml-6 text-[#0D47A1]">
          Past Deliveries
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Example Past Delivery Card */}
      <View className="bg-white rounded-2xl p-6 mb-6 border border-[#FF8C00] shadow-sm">
        <Text className="font-bold text-lg mb-1 text-[#0D47A1]">Order #123456</Text>
        <Text className="text-gray-600 mb-1">Delivered: <Text className="text-[#FF8C00]">July 20, 2024</Text></Text>
        <Text className="text-gray-600 mb-4">
          Driver: <Text className="font-semibold text-[#0D47A1]">Evelyn Reed</Text>
        </Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="bg-[#0D47A1] px-5 py-2 rounded-md"
            onPress={() => {/* Complaints logic or navigation */}}
          >
            <Text className="text-white font-semibold">Complaints</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#FF8C00] px-5 py-2 rounded-md"
            onPress={() => router.push('/pages/customer/Rating')}
          >
            <Text className="text-white font-semibold">Rating</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}