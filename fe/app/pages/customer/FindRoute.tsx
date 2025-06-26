import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';


export default function FindRouteScreen() {
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  const renderHeader = () => {
    const title = step === 1 ? 'Set Pickup' : step === 2 ? 'Set Drop-off' : 'Available Routes';
    return (
      <View className="flex-row items-center px-4 py-4 border-b border-gray-200 bg-white">
        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(prev => prev - 1)}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <Text className="text-lg font-semibold ml-3">{title}</Text>
      </View>
    );
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <TextInput
            placeholder="Pickup location"
            value={pickup}
            onChangeText={setPickup}
            className="bg-gray-100 rounded-md px-4 py-3 mx-6 mt-6"
          />
          <View className="bg-gray-200 mx-6 mt-6 h-48 rounded-md justify-center items-center">
            <Text className="text-gray-500">Map Preview</Text>
          </View>
          <Text className="text-center text-gray-500 my-4">1 of 3</Text>
          <TouchableOpacity
            onPress={() => setStep(2)}
            className="bg-[#0D47A1] rounded-md mx-6 py-3"
          >
            <Text className="text-white text-center font-semibold">Set pickup</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <TextInput
            placeholder="Drop-off location"
            value={dropoff}
            onChangeText={setDropoff}
            className="bg-gray-100 rounded-md px-4 py-3 mx-6 mt-6"
          />
          <View className="bg-gray-200 mx-6 mt-6 h-48 rounded-md justify-center items-center">
            <Text className="text-gray-500">Map Preview</Text>
          </View>
          <Text className="text-center text-gray-500 my-4">2 of 3</Text>
          <TouchableOpacity
            onPress={() => setStep(3)}
            className="bg-[#0D47A1] rounded-md mx-6 py-3"
          >
            <Text className="text-white text-center font-semibold">Set drop-off</Text>
          </TouchableOpacity>
        </>
      );
    }

    // Step 3: Display Routes
    return (
      <ScrollView className="px-4 pt-4">
        <Text className="text-sm text-gray-500 mb-3">
          Showing routes from <Text className="font-semibold">{pickup}</Text> to{' '}
          <Text className="font-semibold">{dropoff}</Text>
        </Text>

        {[
          { from: 'Colombo', to: 'Kandy', price: 'Rs 1200', distance: '115 km', time: '3h 15m', size: 'Small Box' },
          { from: 'Galle', to: 'Matara', price: 'Rs 900', distance: '65 km', time: '1h 30m', size: 'Medium Crate' },
        ].map((route, index) => (
          <View key={index} className="bg-white p-4 rounded-lg mb-4 shadow border border-gray-200">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-semibold text-base">{route.from} ➜ {route.to}</Text>
              <Text className="text-[#FF8C00] font-bold">{route.price}</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-1">{route.distance} • {route.time}</Text>
            <Text className="text-xs text-gray-500 mb-2">{route.size}</Text>
            <TouchableOpacity
  onPress={() => router.push('/pages/customer/RouteDetails')}
  className="bg-[#0D47A1] py-2 rounded-md mt-2"
>
  <Text className="text-white text-center font-medium">View Details</Text>
</TouchableOpacity>

          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}
      {renderStep()}
    </View>
  );
}
