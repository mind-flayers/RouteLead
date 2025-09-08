import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../../../components/ui/TopBar';
import ProgressBar from '../../../components/ui/ProgressBar';
import { supabase } from '@/lib/supabase';

const SelectVehicleType = () => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [manufacturer, setManufacturer] = useState('');
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const vehicleTypes = [
    { id: 'Three Wheel', name: 'Three Wheel', icon: 'rickshaw' },
    { id: 'Flex/Mini/Car', name: 'Flex/Mini/Car', icon: 'car-outline' },
    { id: 'Mini Van/ Van', name: 'Mini Van/ Van', icon: 'truck-cargo-container' },
    { id: 'Truck', name: 'Truck', icon: 'truck-outline' },
    { id: 'Bike', name: 'Bike', icon: 'motorbike' }
  ];

  const validateAndContinue = async () => {
    // Validation checks
    if (!selectedVehicleType) {
      Alert.alert('Vehicle Type Required', 'Please select your vehicle type.');
      return;
    }
    if (isOwner === null) {
      Alert.alert('Ownership Required', 'Please specify if you own the vehicle.');
      return;
    }
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

    // Validate year
    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(year);
    if (isNaN(vehicleYear) || vehicleYear < 1900 || vehicleYear > currentYear) {
      Alert.alert('Invalid Year', 'Please enter a valid year of manufacture.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);

      // Store vehicle data locally (similar to UploadPersonalDocs approach)
      const vehicleData = {
        vehicleType: selectedVehicleType,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        year: vehicleYear.toString(),
        color: color.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        isOwner: isOwner,
        maxWeightKg: getDefaultMaxWeight(selectedVehicleType),
        maxVolumeM3: getDefaultMaxVolume(selectedVehicleType),
      };

      // Store in AsyncStorage temporarily (like UploadPersonalDocs does)
      await AsyncStorage.setItem('vehicleData', JSON.stringify(vehicleData));
      
      console.log('✅ Vehicle data stored locally:', vehicleData);

      Alert.alert(
        'Vehicle Information Saved!',
        'Your vehicle details have been saved successfully.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/pages/driver/UploadVehicleDocs')
          }
        ]
      );

    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert(
        'Save Failed',
        'Failed to save vehicle information. Please try again.',
        [
          { text: 'Retry', onPress: validateAndContinue },
          { text: 'Skip for now', onPress: () => router.push('/pages/driver/UploadVehicleDocs') }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get default max weight based on vehicle type
  const getDefaultMaxWeight = (vehicleType: string): number => {
    switch (vehicleType) {
      case 'Bike': return 50;
      case 'Three Wheel': return 300;
      case 'Flex/Mini/Car': return 500;
      case 'Mini Van/ Van': return 1000;
      case 'Truck': return 3000;
      default: return 100;
    }
  };

  // Helper function to get default max volume based on vehicle type
  const getDefaultMaxVolume = (vehicleType: string): number => {
    switch (vehicleType) {
      case 'Bike': return 0.1;
      case 'Three Wheel': return 1.0;
      case 'Flex/Mini/Car': return 1.5;
      case 'Mini Van/ Van': return 3.0;
      case 'Truck': return 10.0;
      default: return 0.5;
    }
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
          <Text className="text-xl font-bold mb-4">Vehicle Ownership</Text>
          <Text className="text-gray-600 mb-4">Do you own this vehicle?</Text>
          
          <View className="flex-row gap-4">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border ${
                isOwner === true ? 'bg-green-50 border-green-500' : 'border-gray-300'
              }`}
              onPress={() => setIsOwner(true)}
            >
              <Ionicons
                name={isOwner === true ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isOwner === true ? '#22C55E' : '#9CA3AF'}
              />
              <Text className={`ml-2 font-medium ${
                isOwner === true ? 'text-green-600' : 'text-gray-600'
              }`}>Yes, I own it</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border ${
                isOwner === false ? 'bg-orange-50 border-orange-500' : 'border-gray-300'
              }`}
              onPress={() => setIsOwner(false)}
            >
              <Ionicons
                name={isOwner === false ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isOwner === false ? '#F97316' : '#9CA3AF'}
              />
              <Text className={`ml-2 font-medium ${
                isOwner === false ? 'text-orange-600' : 'text-gray-600'
              }`}>No, it's rented</Text>
            </TouchableOpacity>
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
          disabled={isLoading}
          className={`flex-1 ml-2 py-3 rounded-lg items-center ${
            isLoading ? 'bg-gray-400' : 'bg-orange-500'
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelectVehicleType;
