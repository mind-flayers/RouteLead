import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';

const MyEarnings = () => {
  const router = useRouter();

  const transactionHistory = [
    {
      id: '1',
      type: 'route_completion',
      description: 'Route Completion: Badulla to Colombo',
      date: 'April 20, 2025',
      amount: '+1500.00',
      isCredit: true,
    },
    {
      id: '2',
      type: 'bank_transfer',
      description: 'Bank Transfer to Account ****1234',
      date: 'April 18, 2025',
      amount: '-5000.00',
      isCredit: false,
    },
    {
      id: '3',
      type: 'route_completion',
      description: 'Route Completion: Industrial Park to Pettah',
      date: 'April 15, 2025',
      amount: '+850.50',
      isCredit: true,
    },
    {
      id: '4',
      type: 'bank_transfer',
      description: 'Bank Transfer to Account ****1234',
      date: 'April 18, 2025',
      amount: '-5000.00',
      isCredit: false,
    },
    {
      id: '5',
      type: 'route_completion',
      description: 'Route Completion: Kandy to Galle',
      date: 'April 12, 2025',
      amount: '+2200.00',
      isCredit: true,
    },
    {
      id: '6',
      type: 'route_completion',
      description: 'Route Completion: Matara to Colombo',
      date: 'April 10, 2025',
      amount: '+4500.00',
      isCredit: true,
    },
    {
      id: '7',
      type: 'bank_transfer',
      description: 'Bank Transfer to Account ****1234',
      date: 'April 05, 2025',
      amount: '-1000.00',
      isCredit: false,
    },
    {
      id: '8',
      type: 'route_completion',
      description: 'Route Completion: Colombo to Jaffna',
      date: 'April 03, 2025',
      amount: '+1800.00',
      isCredit: true,
    },
  ];

  const getIcon = (type: string, isCredit: boolean) => {
    switch (type) {
      case 'route_completion':
        return (
          <View className="bg-blue-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#3b82f6" />
          </View>
        );
      case 'bank_transfer':
        return (
          <View className="bg-red-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#ef4444" />
          </View>
        );
      case 'fuel_surcharge':
        return (
          <View className="bg-red-100 p-3 rounded-full mr-3">
            <AntDesign name="minuscircleo" size={24} color="#ef4444" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">My Earnings</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-8 h-8 rounded-full mr-2"
            />
          </View>
        </Link>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Total Balance Card */}
          <PrimaryCard style={{ marginBottom: 24 }}>
            <Text className="text-gray-600 text-base mb-2">Your Total Balance</Text>
            <View className="flex-row items-center mb-4">
              <FontAwesome5 name="dollar-sign" size={24} color="#f97316" />
              <Text className="text-3xl font-bold ml-2">LKR 23500.75</Text>
            </View>
            <PrimaryButton
              title="Withdraw Funds"
              onPress={() => router.push('/pages/driver/WithdrawalSuccess')}
            />
          </PrimaryCard>

          {/* Transaction History */}
          <Text className="text-xl font-bold mb-4">Transaction History</Text>
          <View className="space-y-4">
            {transactionHistory.map((item) => (
              <TouchableOpacity key={item.id} className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {getIcon(item.type, item.isCredit)}
                  <View>
                    <Text className="font-semibold">{item.description}</Text>
                    <Text className="text-gray-500 text-sm">{item.date}</Text>
                  </View>
                </View>
                <Text className={`font-bold ${item.isCredit ? 'text-green-600' : 'text-red-600'}`}>
                  {item.isCredit ? `+$${item.amount}` : `-$${item.amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation Bar */}
      <DriverBottomNavigation />
    </SafeAreaView>
  );
};

export default MyEarnings;
