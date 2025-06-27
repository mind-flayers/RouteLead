import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import BannerCard from '@/components/ui/BannerCard';

const WithdrawalDetails = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Withdrawal Details</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Amount Banner Card */}
        <BannerCard className="mb-5 bg-orange-500 p-4 rounded-2xl flex-row items-center justify-between">
          <View>
            <Text className="text-white text-base font-medium">Amount</Text>
            <Text className="text-white text-4xl font-bold mt-2">LKR 1500.00</Text>
          </View>
          <FontAwesome5 name="trophy" size={40} color="white" />
        </BannerCard>

        {/* Modified Transaction Details Card */}
        <View className="bg-white p-0 rounded-2xl border border-gray-200 overflow-hidden mb-24">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 pt-4">
            <Text className="text-lg font-semibold">Transaction Details</Text>
            <View className="bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-700 text-sm font-semibold">Pending Payment</Text>
            </View>
          </View>

          {/* Divider */}
          <View className="border-b border-gray-200 mt-3" />

          {/* Content */}
          <View className="px-4 py-3 space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Transaction ID:</Text>
              <Text className="font-semibold text-gray-800">#3453453454</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Date</Text>
              <Text className="font-semibold text-gray-800">7/20/2025</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Time</Text>
              <Text className="font-semibold text-gray-800">3.12 pm</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Total Amount</Text>
              <Text className="font-semibold text-gray-800">LKR 1500.00</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">App fee</Text>
              <Text className="font-semibold text-gray-800">LKR 300.00</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">You Receive</Text>
              <Text className="font-semibold text-gray-800">LKR 1200.00</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View className="w-full px-4 py-4">
        <PrimaryButton
          title="Done"
          onPress={() => router.push('/pages/driver/MyEarnings')}
        />
      </View>
    </SafeAreaView>
  );
};

export default WithdrawalDetails;
