import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BidConfirmation() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <Text className="text-xl font-bold mb-2 text-center text-[#0D47A1]">Bid Placed Successfully</Text>
      <Text className="text-gray-600 mb-6 text-center">
        Your bid has been successfully placed. You will be notified if your bid is accepted.
      </Text>

      <View className="mb-8 bg-[#F6F6FA] rounded-xl p-4 border border-[#FF8C00]">
        <Text className="font-semibold mb-2">Bid Details</Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Bid Amount</Text>
          <Text className="font-semibold">LKR 1500</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Route</Text>
          <Text className="font-semibold">Badulla</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Reference</Text>
          <Text className="font-semibold">REF-12345</Text>
        </View>
      </View>

      <Text className="font-semibold mb-3 text-[#0D47A1]">Next Steps</Text>
      <TouchableOpacity
        className="bg-[#0D47A1] py-4 rounded-md mb-3"
        onPress={() => router.push('/pages/customer/MyBids')}
      >
        <Text className="text-white text-center font-semibold">View Bid Status</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-[#0D47A1] py-4 rounded-md"
        onPress={() => {/* Add manage bid logic here */}}
      >
        <Text className="text-white text-center font-semibold">Manage Bid</Text>
      </TouchableOpacity>
    </View>
  );
}