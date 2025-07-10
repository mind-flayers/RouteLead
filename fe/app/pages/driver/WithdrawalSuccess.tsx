import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import { formatCurrency } from '@/services/apiService';

const WithdrawalSuccess = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const withdrawalData = {
    amount: parseFloat(params.amount as string),
    method: params.method as string,
    accountNumber: params.accountNumber as string,
    bankName: params.bankName as string,
    accountName: params.accountName as string,
    transactionId: params.transactionId as string,
    estimatedTime: '1-3 business days',
    processingFee: parseFloat(params.processingFee as string)
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.replace('/pages/driver/MyEarnings')} className="mr-4">
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Withdrawal Successful</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View className="items-center mb-8">
          {/* Success Icon */}
          <View className="bg-green-100 p-6 rounded-full mb-6">
            <AntDesign name="checkcircleo" size={60} color="#10b981" />
          </View>
          
          <Text className="text-3xl font-bold text-center mb-2 text-gray-800">Withdrawal Successful!</Text>
          <Text className="text-5xl font-bold text-green-600 mb-8">
            {formatCurrency(withdrawalData.amount)}
          </Text>

          {/* Success Details Card */}
          <PrimaryCard style={{ width: '100%', padding: 20 }}>
            <View className="items-center mb-4">
              <MaterialCommunityIcons name="bank" size={32} color="#f97316" />
              <Text className="text-gray-700 text-lg font-medium mt-2">
                {withdrawalData.method}
              </Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Bank</Text>
                <Text className="font-semibold text-gray-800">{withdrawalData.bankName}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Account Name</Text>
                <Text className="font-semibold text-gray-800">{withdrawalData.accountName}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Account</Text>
                <Text className="font-semibold text-gray-800">{withdrawalData.accountNumber}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Transaction ID</Text>
                <Text className="font-semibold text-gray-800">{withdrawalData.transactionId}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Processing Fee</Text>
                <Text className="font-semibold text-gray-800">
                  {withdrawalData.processingFee > 0 ? formatCurrency(withdrawalData.processingFee) : 'Free'}
                </Text>
              </View>
              <View className="border-t border-gray-200 pt-3 mt-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Estimated Arrival</Text>
                  <Text className="font-semibold text-orange-600">{withdrawalData.estimatedTime}</Text>
                </View>
              </View>
            </View>
          </PrimaryCard>

          {/* Info Message */}
          <View className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-200">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text className="text-blue-700 text-sm ml-2 flex-1">
                Your withdrawal is being processed. You'll receive an SMS notification when the funds are transferred to your account.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="p-4 border-t border-gray-200">
        <SecondaryButton
          title="View Details"
          onPress={() => router.push({ pathname: '/pages/driver/WithdrawalDetails', params: { withdrawalId: withdrawalData.transactionId, driverId: params.driverId } })}
          style={{ marginBottom: 12 }}
        />
        <PrimaryButton
          title="Done"
          onPress={() => router.replace('/pages/driver/MyEarnings')}
        />
      </View>
    </SafeAreaView>
  );
};

export default WithdrawalSuccess;
