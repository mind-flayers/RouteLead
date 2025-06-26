import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../components/ui/SecondaryButton';
import BottomNavigationBar from '../../../components/ui/BottomNavigationBar';

const DeliveryManagement = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [deliveryStatus, setDeliveryStatus] = useState('Picked Up');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallCustomer = () => {
    // Placeholder values for phone number and customer name
    const phoneNumber = '123-456-7890'; 
    const customerName = 'Mishaf Hasan';
    router.push(`/pages/driver/CallScreen?phoneNumber=${phoneNumber}&customerName=${customerName}`);
  };

  const getStatusButtonClass = (status: string) => {
    return deliveryStatus === status ? 'bg-orange-500' : 'bg-white';
  };

  const getStatusTextClass = (status: string) => {
    return deliveryStatus === status ? 'text-white' : 'text-gray-700';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Delivery Management</Text>
        <View className="w-10" />{/* Placeholder for alignment */}
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Map Card */}
        <PrimaryCard className="mb-4 p-0 overflow-hidden">
          <View className="w-full h-48 bg-gray-300 justify-center items-center">
            {/* Placeholder for Map Image */}
            {/* Map Placeholder */}
            <View className="w-full h-full bg-gray-300 justify-center items-center">
              <Text className="text-gray-500">Map Placeholder</Text>
            </View>
            <PrimaryButton
              title="Start Navigation"
              onPress={() => console.log('Start Navigation')}
              className="absolute bottom-4 w-10/12"
              icon={<MaterialCommunityIcons name="map-marker-radius" size={20} color="white" />}
            />
          </View>
        </PrimaryCard>

        {/* Cancel Trip Button */}
        <TouchableOpacity
          onPress={() => console.log('Cancel Trip')}
          className="w-full bg-white border-2 border-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row mb-4"
        >
          <Ionicons name="close-circle-outline" size={20} color="#FF8C00" />
          <Text className="text-red-500 text-base font-bold ml-2">Cancel Trip</Text>
        </TouchableOpacity>

        {/* Bidder and Bid Details Card */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-3">
            <FontAwesome name="user-circle-o" size={20} color="#6B7280" />
            <Text className="ml-2 text-lg font-bold">Sarah Johnson</Text>
            <View className="ml-auto bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-700 text-xs font-semibold">Pending Payment</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="currency-usd" size={20} color="#FF8C00" />
            <Text className="ml-2 text-orange-500 text-2xl font-bold">LKR 45.00</Text>
          </View>
          <Text>From: </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-sharp" size={18} color="#6B7280" />
            <Text className="ml-2 text-gray-700">123 Elm Street, Apartment 4B, Springfield, IL 62704</Text>
          </View>
          <Text>To: </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-sharp" size={18} color="#6B7280" />
            <Text className="ml-2 text-gray-700">123 Elm Street, Apartment 4B, Springfield, IL 62704</Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome name="check-circle-o" size={18} color="#6B7280" />
            <Text className="ml-2 to-blue-500">"Leave parcel at front door, no signature required."</Text>
          </View>
        </PrimaryCard>

        {/* Delivery Status Buttons */}
        <View className="flex-row justify-around mb-4 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('Picked Up')}`}
            onPress={() => setDeliveryStatus('Picked Up')}
          >
            <Text className={`font-semibold ${getStatusTextClass('Picked Up')}`}>Picked Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('In Transit')}`}
            onPress={() => setDeliveryStatus('In Transit')}
          >
            <Text className={`font-semibold ${getStatusTextClass('In Transit')}`}>In Transit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-md mx-1 ${getStatusButtonClass('Delivered')}`}
            onPress={() => {
              setDeliveryStatus('Delivered');
              (navigation as any).navigate('pages/driver/DeliverySummary');
            }}
          >
            <Text className={`font-semibold ${getStatusTextClass('Delivered')}`}>Delivered</Text>
          </TouchableOpacity>
        </View>

        {/* Parcel Details Card */}
        <PrimaryCard className="mb-4 p-4">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
            <Text className="ml-2 text-lg font-bold">Parcel Details</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">2x Small Packages</Text>
            <Text className="text-gray-500">Est. 5 kg</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">1x Medium Box</Text>
            <Text className="text-gray-500">Est. 12 kg</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Dimensions: </Text>
            <Text className="text-gray-500">25×20×10 cm</Text>
          </View>

          <Text className="text-gray-500 italic">Special handling: Fragile items.</Text>
        </PrimaryCard>

        {/* Action Buttons */}
        <View className="flex-col mb-8">
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 mr-2 bg-white border-2 border-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
            >
              <Ionicons name="call" size={20} color="#FF8C00" />
              <Text className="text-orange-500 text-base font-bold ml-2">Call Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log('Chat Customer')}
              className="flex-1 ml-2 bg-orange-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
            >
              <Ionicons name="chatbox" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Chat Customer</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => console.log('Report User')}
            className="w-full bg-white border-2 border-red-500 py-3 px-6 rounded-lg items-center justify-center flex-row"
          >
            <MaterialCommunityIcons name="flag" size={20} color="red" />
            <Text className="text-red-500 text-base font-bold ml-2">Report User</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Bar */}
      <BottomNavigationBar activeTab="routes" />
    </SafeAreaView>
  );
};

export default DeliveryManagement;
