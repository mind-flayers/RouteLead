import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomerFooter from '@/components/navigation/CustomerFooter';

export default function RequestConfirmation() {
  const router = useRouter();
  const [bidPrice, setBidPrice] = useState('');
  const [bidHistory, setBidHistory] = useState<Array<{price: string, time: string}>>([]);

  const handleAddBid = () => {
    if (bidPrice.trim()) {
      const currentTime = new Date().toLocaleTimeString();
      setBidHistory(prev => [...prev, { price: bidPrice, time: currentTime }]);
      setBidPrice('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <Text className="text-2xl font-bold mb-4 text-center text-[#0D47A1]">Parcel Request Submitted Successfully</Text>
        <Text className="text-gray-600 mb-8 text-center text-base leading-6">
          Your parcel request has been successfully submitted. Drivers will be notified and can bid on your request.
        </Text>

        <View className="mb-8 bg-[#F6F6FA] rounded-xl p-6 border border-[#FF8C00]">
          <Text className="font-semibold mb-4 text-lg">Request Details</Text>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Route</Text>
            <Text className="font-semibold text-base">Colombo → Badulla</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Weight</Text>
            <Text className="font-semibold text-base">5 kg</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Volume</Text>
            <Text className="font-semibold text-base">0.125 m³</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500 text-base">Description</Text>
            <Text className="font-semibold text-base">Fragile electronics</Text>
          </View>
        </View>

        <Text className="font-semibold mb-4 text-[#0D47A1] text-lg">Next Steps</Text>
        
        {/* Bid Price Input */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 text-base font-medium">Your Maximum Bid Price (LKR)</Text>
          <View className="flex-row space-x-2">
            <TextInput
              value={bidPrice}
              onChangeText={setBidPrice}
              keyboardType="numeric"
              placeholder="Enter your maximum bid amount"
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            />
            <TouchableOpacity
              onPress={handleAddBid}
              className="bg-[#FF8C00] px-4 py-3 rounded-lg justify-center"
            >
              <Text className="text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bid History */}
        {bidHistory.length > 0 && (
          <View className="mb-4 bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-700 mb-2 text-base font-medium">Bid History</Text>
            {bidHistory.map((bid, index) => (
              <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 text-base">LKR {bid.price}</Text>
                <Text className="text-gray-500 text-sm">{bid.time}</Text>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity
          className="bg-[#0D47A1] py-4 rounded-lg mb-6"
          onPress={() => router.push('/pages/customer/MyBids')}
        >
          <Text className="text-white text-center font-semibold text-lg">View Bids</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Bottom Navigation Footer */}
      <CustomerFooter activeTab="home" />
    </SafeAreaView>
  );
}