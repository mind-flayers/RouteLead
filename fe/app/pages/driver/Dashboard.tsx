import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('Mishaf Hasan'); // Default name

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setUserName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
        }
      }
    };

    fetchUserName();
  }, []);

  // Data for the KPI cards for easier management
  const kpiData = [
    {
      title: "Today's\nEarnings",
      icon: <FontAwesome5 name="wallet" size={20} color="#f97316" />,
      value: "LKR 1850.00",
      subtext: "+12.5% from yesterday"
    },
    {
      title: "Pending Bids",
      icon: <FontAwesome5 name="list-alt" size={20} color="#f97316" />,
      value: "7",
      subtext: "2 new bids today"
    },
    {
      title: "Weekly Total\nEarnings",
      icon: <FontAwesome5 name="dollar-sign" size={20} color="#f97316" />,
      value: "LKR 15450.50",
      subtext: "+8.1% from last week"
    },
    {
      title: "Routes\nCompleted",
      icon: <AntDesign name="checkcircle" size={20} color="#f97316" />,
      value: "24",
      subtext: "Deliveries this month"
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">Dashboard</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-8 h-8 rounded-full mr-2"
            />
          </View>
        </Link>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Welcome Section */}
        <View className="mb-4 items-center">
          <Text className="text-2xl font-bold mb-1">Welcome, {userName}!</Text>
          <Text className="text-gray-600">Ready for your next route?</Text>
        </View>

        {/* Post New Route Button */}
        <PrimaryButton
          title="Post New Route"
          onPress={() => router.push('/pages/driver/create_route/CreateRoute')}
          style={{ marginBottom: 24 }}
        />

        {/* Key Performance Indicators */}
        <Text className="text-xl font-bold mb-4">Key Performance Indicators</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {kpiData.map((item, index) => (
            <View 
              key={index} 
              className="w-[48%] bg-orange-50 p-4 rounded-2xl border border-orange-300 flex flex-col justify-between mb-4"
              style={{ minHeight: 150 }} // Ensures consistent card height
            >
              <View className="flex-row justify-between items-start">
                <Text className="text-gray-800 text-base font-medium">{item.title}</Text>
                <View className="bg-orange-200 p-2 rounded-lg">
                  {item.icon}
                </View>
              </View>
              <View>
                <Text className="text-orange-500 text-2xl font-bold">{item.value}</Text>
                <Text className="text-gray-500 text-sm mt-1">{item.subtext}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Route Activity Overview */}
        <Text className="text-xl font-bold mb-4">Recent Activities</Text>
        <View className="space-y-4">
          {/* Activity 1 */}
          <Link href="/pages/driver/DeliverySummary" className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full mr-3">
                <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#3b82f6" />
              </View>
              <View>
                <Text className="font-semibold">Route Completion:</Text>
                <Text className="text-gray-700">Puttalam to Mannar</Text>
                <Text className="text-gray-500 text-sm">April 20, 2025</Text>
              </View>
            </View>
            <Text className="text-green-600 font-bold">+LKR 550.00</Text>
          </Link>

          {/* Activity 2 */}
          <Link href="/pages/driver/WithdrawalDetails" className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-red-100 p-3 rounded-full mr-3">
                <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#ef4444" />
              </View>
              <View>
                <Text className="font-semibold">Bank Transfer to Account</Text>
                <Text className="text-gray-700">****1234</Text>
                <Text className="text-gray-500 text-sm">April 18, 2025</Text>
              </View>
            </View>
            <Text className="text-red-600 font-bold">-LKR 500.00</Text>
          </Link>

          {/* Activity 3 */}
          <Link href="/pages/driver/DeliverySummary" className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full mr-3">
                <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#3b82f6" />
              </View>
              <View>
                <Text className="font-semibold">Route Completion:</Text>
                <Text className="text-gray-700">Colombo to Badulla</Text>
                <Text className="text-gray-500 text-sm">April 15, 2025</Text>
              </View>
            </View>
            <Text className="text-green-600 font-bold">+LKR 850.50</Text>
          </Link>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 bg-orange-500 p-4 rounded-full shadow-lg mb-4"
        onPress={() => router.push('/pages/driver/DeliveryManagement')}
        style={{
          zIndex: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.30,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <Ionicons name="car-outline" size={30} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <DriverBottomNavigation />
    </SafeAreaView>
  );
};

export default Dashboard;
