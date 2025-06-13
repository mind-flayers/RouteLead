import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router'; // Add this impor

export default function PlaceBid() {
  const router = useRouter(); // Add this line

  const handlePlaceBid = () => {
    // You can pass bid details as params if needed
    router.push('/pages/customer/BidConfirmation');
  };

  const [bid, setBid] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [type, setType] = useState('Small Package');

  return (
    <ScrollView className="flex-1 bg-white px-6 py-6">
      {/* Bid Details */}
      <Text className="text-lg font-semibold mb-4">Place Your Bid</Text>

      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Bid Amount</Text>
        <TextInput
          value={bid}
          onChangeText={setBid}
          keyboardType="numeric"
          placeholder="e.g., 500.00"
          className="bg-white border border-gray-300 rounded-md px-4 py-2 mb-2"
        />
      </View>

      {/* Parcel Details */}
      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Weight (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="e.g., 5"
          className="bg-white border border-gray-300 rounded-md px-4 py-2 mb-4"
        />
        <Text className="text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</Text>
        <TextInput
          value={dimensions}
          onChangeText={setDimensions}
          placeholder="e.g., 30×20×15"
          className="bg-white border border-gray-300 rounded-md px-4 py-2 mb-4"
        />
        <Text className="text-sm font-medium text-gray-700 mb-2">Parcel Type</Text>
        <TextInput
          value={type}
          onChangeText={setType}
          placeholder="e.g., Small Package"
          className="bg-white border border-gray-300 rounded-md px-4 py-2"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity className="bg-[#0D47A1] py-4 rounded-md" onPress={handlePlaceBid}>
        <Text className="text-white font-semibold text-center text-base">Place Your Bid</Text>
      </TouchableOpacity>  </ScrollView>
  );
}
