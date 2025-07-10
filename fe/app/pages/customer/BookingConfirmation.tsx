import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BookingConfirmation() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#F6F6FA] px-4 pt-10">
      {/* Header */}
      <View className="flex-row justify-center items-center mb-6">
        <Text className="text-base font-semibold">Booking Confirmation</Text>
      </View>

      {/* Success Icon */}
      <View className="items-center mb-4">
        <Ionicons name="checkmark-circle" size={72} color="#4CAF50" />
      </View>

      {/* Title & Subtitle */}
      <Text className="text-2xl font-bold text-center mb-2">Booking Confirmed!</Text>
      <Text className="text-gray-600 text-center mb-6">
        Your RouteLead delivery booking has been successfully placed and confirmed. Get ready for a smooth journey.
      </Text>

      {/* Booking Summary */}
      <View className="bg-white rounded-xl p-4 mb-4 border border-[#E0E0E0]">
        <Text className="font-semibold mb-3">Booking Summary</Text>
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="location-on" size={18} color="#0D47A1" />
          <Text className="ml-2 text-gray-700">Pickup:</Text>
          <Text className="ml-1 font-semibold">Kandy</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="flag" size={18} color="#FFA726" />
          <Text className="ml-2 text-gray-700">Dropoff:</Text>
          <Text className="ml-1 font-semibold">Badulle</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={18} color="#0D47A1" />
          <Text className="ml-2 text-gray-700">Date & Time:</Text>
          <Text className="ml-1 font-semibold">July 15, 2025 at 10:00 AM</Text>
        </View>
        <View className="border-t border-gray-200 my-3" />
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Subtotal</Text>
          <Text className="font-semibold">LKR 3,000</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Tax (10%)</Text>
          <Text className="font-semibold">LKR 300</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Fees</Text>
          <Text className="font-semibold">LKR 2000</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="font-semibold text-[#FFA726]">Total Paid</Text>
          <Text className="font-bold text-[#FFA726]">LKR 3,300</Text>
        </View>
        <View className="flex-row items-center mt-3">
          <MaterialCommunityIcons name="credit-card-outline" size={22} color="#7C3AED" />
          <Text className="ml-2 text-gray-700">Payment Method</Text>
          <Text className="ml-2 font-semibold">**** 2334</Text>
        </View>
      </View>

      {/* Driver Details */}
      <View className="bg-white rounded-xl p-4 mb-6 border border-[#E0E0E0]">
        <Text className="font-semibold mb-3">Driver Details</Text>
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
            {/* Replace with Image if you have driver photo */}
            <MaterialCommunityIcons name="account-circle" size={40} color="#B39DDB" />
          </View>
          <View>
            <Text className="font-semibold">Amal Fernando</Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#FFD600" />
              <Text className="ml-1 text-xs text-gray-600">(4.8)</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="border border-[#E0E0E0] rounded-md py-2 px-4 mt-2 flex-row items-center justify-center"
          onPress={() => router.push('/pages/customer/Chat')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#0D47A1" />
          <Text className="ml-2 text-[#0D47A1] font-semibold">Contact Driver</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        className="bg-[#FFA726] py-4 rounded-md mb-3"
        onPress={() => router.push('/pages/customer/TrackingDelivery')}
      >
        <Text className="text-white text-center font-semibold text-base">Track My Delivery</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-white border border-gray-200 py-4 rounded-md mb-3"
        onPress={() => router.push('/pages/customer/MyBids')}
      >
        <Text className="text-[#0D47A1] text-center font-semibold text-base">View All Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-white border border-gray-200 py-4 rounded-md mb-8"
        onPress={() => router.push('/pages/customer/Dashboard')}
      >
        <Text className="text-gray-700 text-center font-semibold text-base">Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}