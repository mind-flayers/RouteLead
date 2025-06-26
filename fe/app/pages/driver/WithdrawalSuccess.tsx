import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';

const WithdrawalSuccess = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Withdrawal Successful</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View className="items-center mb-8">
          <AntDesign name="checkcircleo" size={80} color="#f97316" className="mb-4" />
          <Text className="text-3xl font-bold text-center mb-2">Withdrawal Successful!</Text>
          <Text className="text-5xl font-bold text-orange-500 mb-8">$500.00</Text>

          <PrimaryCard style={{ width: '100%', padding: 20, alignItems: 'center' }}>
            <Text className="text-gray-700 text-lg mb-1">Method: Bank Transfer</Text>
            <Text className="text-gray-500 text-base">Estimated: 1-3 business days</Text>
          </PrimaryCard>
        </View>

        <View className="w-full px-4 absolute bottom-4">
          <SecondaryButton
            title="View Details"
            onPress={() => router.push('/pages/driver/WithdrawalDetails')}
            style={{ marginBottom: 12 }}
          />
          <PrimaryButton
            title="Done"
            onPress={() => router.push('/pages/driver/MyEarnings')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawalSuccess;
