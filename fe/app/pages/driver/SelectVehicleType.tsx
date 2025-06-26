import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TopBar from '../../../components/ui/TopBar';
import ProgressBar from '../../../components/ui/ProgressBar';

const SelectVehicleType = () => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [manufacturer, setManufacturer] = useState('');
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  const vehicleTypes = [
    { id: 'Three Wheel', name: 'Three Wheel', icon: 'rickshaw' },
    { id: 'Flex/Mini/Car', name: 'Flex/Mini/Car', icon: 'car-outline' },
    { id: 'Mini Van/ Van', name: 'Mini Van/ Van', icon: 'truck-cargo-container' },
    { id: 'Truck', name: 'Truck', icon: 'truck-outline' },
    { id: 'Bike', name: 'Bike', icon: 'motorbike' }
  ];

  const validateAndContinue = () => {
    if (!selectedVehicleType) {
      Alert.alert('Vehicle Type Required', 'Please select your vehicle type.');
      return;
    }
    // if (isOwner === null) {
    //   Alert.alert('Ownership Required', 'Please specify if you own the vehicle.');
    //   return;
    // }
    if (!manufacturer.trim()) {
      Alert.alert('Missing Information', 'Please enter the vehicle manufacturer.');
      return;
    }
    if (!model.trim()) {
      Alert.alert('Missing Information', 'Please enter the vehicle model.');
      return;
    }
    if (!year.trim()) {
      Alert.alert('Missing Information', 'Please enter the year of manufacture.');
      return;
    }
    if (!color.trim()) {
      Alert.alert('Missing Information', 'Please enter the vehicle color.');
      return;
    }
    if (!licensePlate.trim()) {
      Alert.alert('Missing Information', 'Please enter the license plate number.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(year);
    if (isNaN(vehicleYear) || vehicleYear < 1900 || vehicleYear > currentYear) {
      Alert.alert('Invalid Year', 'Please enter a valid year of manufacture.');
      return;
    }

    router.push('/pages/driver/UploadVehicleDocs');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TopBar title="Select Vehicle Type" />
      <ProgressBar currentStep={3} />

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="text-xl font-bold mb-4">Select Your Vehicle Type</Text>

          <View className="mb-4">
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                className={`flex-row items-center py-3 px-2 rounded-lg mb-2 ${
                  selectedVehicleType === vehicle.id ? 'bg-orange-50 border border-orange-300' : 'border border-transparent'
                }`}
                onPress={() => setSelectedVehicleType(vehicle.id)}
              >
                {vehicle.icon === 'car-outline' ? (
                  <Ionicons name={vehicle.icon as any} size={24} color="black" />
                ) : (
                  <MaterialCommunityIcons name={vehicle.icon as any} size={24} color="black" />
                )}
                <Text className="ml-4 text-lg flex-1">{vehicle.name}</Text>
                <Ionicons
                  name={selectedVehicleType === vehicle.id ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedVehicleType === vehicle.id ? '#F97316' : '#9CA3AF'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-md mb-4">
          <Text className="text-xl font-bold mb-4">Vehicle Information</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3 text-gray-700"
            placeholder="Manufacturer (e.g., Toyota, Honda)"
            placeholderTextColor="#9CA3AF"
            value={manufacturer}
            onChangeText={setManufacturer}
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3 text-gray-700"
            placeholder="Model (e.g., Corolla, Civic)"
            placeholderTextColor="#9CA3AF"
            value={model}
            onChangeText={setModel}
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3 text-gray-700"
            placeholder="Year of Manufacture (e.g., 2020)"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
            maxLength={4}
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3 text-gray-700"
            placeholder="Color (e.g., White, Black)"
            placeholderTextColor="#9CA3AF"
            value={color}
            onChangeText={setColor}
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-gray-700"
            placeholder="License Plate Number (e.g., AAA 1234)"
            placeholderTextColor="#9CA3AF"
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-between p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleBackPress}
          className="flex-1 mr-2 py-3 rounded-lg items-center border border-gray-300"
        >
          <Text className="text-gray-700 text-lg font-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={validateAndContinue}
          className="flex-1 ml-2 bg-orange-500 py-3 rounded-lg items-center"
        >
          <Text className="text-white text-lg font-bold">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelectVehicleType;
