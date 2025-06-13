import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BidConfirmation() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <Text className="text-xl font-bold mb-2 text-center">Bid Placed Successfully</Text>
      <Text className="text-gray-600 mb-6 text-center">
        Your bid has been successfully placed. You will be notified if your bid is accepted.
      </Text>

      <View className="mb-8">
        <Text className="font-semibold mb-2">Bid Details</Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Bid Amount</Text>
          <Text className="font-semibold">$150</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Route</Text>
          <Text className="font-semibold">New York to Boston</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Reference</Text>
          <Text className="font-semibold">REF-12345</Text>
        </View>
      </View>

      <Text className="font-semibold mb-3">Next Steps</Text>
      <TouchableOpacity
        className="bg-black py-4 rounded-md mb-3"
        onPress={() => router.push('/pages/customer/MyBids')}
      >
        <Text className="text-white text-center font-semibold">View Bid Status</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-gray-200 py-4 rounded-md"
        onPress={() => {/* Add manage bid logic here */}}
      >
        <Text className="text-black text-center font-semibold">Manage Bid</Text>
      </TouchableOpacity>
    </View>
  );
}