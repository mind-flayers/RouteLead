import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FindRoute() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState(50);
  const [vehicleType, setVehicleType] = useState('All');

  const vehicleTypes = ['All Vehicle Types', 'Truck', 'Van'];

  return (
    <View className="flex-1 bg-white px-5 pt-12">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1 text-center mr-8">Find a Route</Text>
      </View>

      {/* Input Fields */}
      <View className="mb-4">
        <TextInput
          className="bg-gray-100 rounded-xl p-4 text-base mb-3"
          placeholder="Pickup Address"
          value={pickup}
          onChangeText={setPickup}
        />
        <TextInput
          className="bg-gray-100 rounded-xl p-4 text-base mb-3"
          placeholder="Drop-off Address"
          value={dropoff}
          onChangeText={setDropoff}
        />
        <TextInput
          className="bg-gray-100 rounded-xl p-4 text-base"
          placeholder="Date"
          value={date}
          onChangeText={setDate}
        />
      </View>

      {/* Filters */}
      <Text className="text-lg font-bold mb-2">Filters</Text>
      <Text className="text-base mb-1">Price Range</Text>
      <View className="mb-4">
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={100}
          value={price}
          onValueChange={setPrice}
          minimumTrackTintColor="#222"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={Platform.OS === 'android' ? '#222' : undefined}
        />
      </View>

      {/* Vehicle Type Buttons */}
      <View className="flex-row mb-8">
        {vehicleTypes.map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-4 py-2 rounded-lg mr-3 ${vehicleType === type ? 'bg-black' : 'bg-gray-100'}`}
            onPress={() => setVehicleType(type)}
          >
            <Text className={`${vehicleType === type ? 'text-white' : 'text-gray-800'} font-medium`}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Search Button */}
      <TouchableOpacity className="bg-black rounded-xl p-4 mb-8" onPress={() => {}}>
        <Text className="text-white text-lg font-bold text-center">Search</Text>
      </TouchableOpacity>
    </View>
  );
}
