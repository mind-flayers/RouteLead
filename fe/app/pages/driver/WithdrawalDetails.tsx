import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import BannerCard from '@/components/ui/BannerCard';
import { formatCurrency } from '@/services/apiService';
import { useEarningsData } from '@/hooks/useEarningsData';

const WithdrawalDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { history, loading, error } = useEarningsData(params.driverId as string);

  const withdrawalData = history.find(item => item.id === params.withdrawalId);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-gray-600">Loading details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
      </SafeAreaView>
    );
  }

  if (!withdrawalData) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-lg text-gray-700">Withdrawal not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-orange-600">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Processing' };
      case 'COMPLETED':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
      case 'FAILED':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  const statusStyle = getStatusStyle(withdrawalData.status);

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
        <BannerCard className="mb-5 bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl flex-row items-center justify-between">
          <View>
            <Text className="text-white text-base font-medium">Withdrawal Amount</Text>
            <Text className="text-white text-4xl font-bold mt-2">
              {formatCurrency(withdrawalData.netAmount)}
            </Text>
          </View>
          <View className="bg-white bg-opacity-20 p-3 rounded-full">
            <FontAwesome5 name="wallet" size={30} color="white" />
          </View>
        </BannerCard>

        {/* Transaction Details Card */}
        <View className="bg-white p-0 rounded-2xl border border-gray-200 overflow-hidden mb-6">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 pt-4">
            <Text className="text-lg font-semibold">Transaction Details</Text>
            <View className={`${statusStyle.bg} px-3 py-1 rounded-full`}>
              <Text className={`${statusStyle.text} text-sm font-semibold`}>
                {statusStyle.label}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="border-b border-gray-200 mt-3" />

          {/* Content */}
          <View className="px-4 py-3 space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Transaction ID</Text>
              <Text className="font-semibold text-gray-800">{withdrawalData.id}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Date</Text>
              <Text className="font-semibold text-gray-800">{new Date(withdrawalData.earnedAt).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Time</Text>
              <Text className="font-semibold text-gray-800">{new Date(withdrawalData.earnedAt).toLocaleTimeString()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Payment Method</Text>
              <Text className="font-semibold text-gray-800">Bank Transfer</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Bank</Text>
              <Text className="font-semibold text-gray-800">Commercial Bank</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Account Name</Text>
              <Text className="font-semibold text-gray-800">Mishaf Hasan</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Account</Text>
              <Text className="font-semibold text-gray-800">****1234</Text>
            </View>
            
            <View className="border-t border-gray-200 pt-3 mt-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Withdrawal Amount</Text>
                <Text className="font-semibold text-gray-800">{formatCurrency(withdrawalData.grossAmount)}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Processing Fee</Text>
                <Text className="font-semibold text-gray-800">{formatCurrency(withdrawalData.appFee)}</Text>
              </View>
              <View className="flex-row justify-between items-center border-t border-gray-200 pt-2 mt-2">
                <Text className="text-lg font-semibold text-gray-800">You Receive</Text>
                <Text className="text-lg font-bold text-green-600">{formatCurrency(withdrawalData.netAmount)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Information */}
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <View className="flex-row items-start">
            <MaterialCommunityIcons name="information" size={20} color="#3b82f6" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-700 font-medium mb-1">Processing Information</Text>
              <Text className="text-blue-600 text-sm">
                Your withdrawal is being processed and will be transferred to your bank account within 1-3 business days.
              </Text>
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
