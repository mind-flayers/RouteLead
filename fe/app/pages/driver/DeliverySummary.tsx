import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import BannerCard from '../../../components/ui/BannerCard'; // Assuming BannerCard exists or needs to be created

const DeliverySummary = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDonePress = () => {
    // Navigate to Dashboard screen
    (navigation as any).navigate('pages/driver/Dashboard');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">Delivery Complete</Text>
        <View className="w-10" />{/* Placeholder for alignment */}
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Earnings Banner Card */}
        <BannerCard className="mb-5 bg-orange-500 p-5 rounded-lg flex-row items-center justify-between">
          <View>
            <Text className="text-white text-base font-semibold">You have Earned:</Text>
            <Text className="text-white text-4xl font-bold text-center">LKR 280.75</Text>
          </View>
          <MaterialCommunityIcons name="trophy" size={60} color="rgba(255,255,255,0.3)" />
        </BannerCard>

        {/* Route Details Card */}
        <PrimaryCard className="mb-4 p-4">
          <Text className="text-lg font-bold mb-4">Route Details</Text>

          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 w-24">Trip ID:</Text>
            <Text className="text-gray-900 font-semibold">RTL-890123</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <FontAwesome name="user-o" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 w-24">Customer Name:</Text>
            <Text className="text-gray-900 font-semibold">Sarah Jenkins</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 w-24">Customer ID:</Text>
            <Text className="text-gray-900 font-semibold">CUST-4567</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <FontAwesome name="calendar" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 w-24">Trip Started:</Text>
            <Text className="text-gray-900 font-semibold">7/20/2025</Text>
          </View>

          <View className="border-t border-gray-200 my-4" />

          <View className="flex-row items-center mb-2">
            <Ionicons name="location-sharp" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 w-24">Pickup Location:</Text>
            <View className="flex-col">
              <Text className="text-gray-900 font-semibold">123 Main St, Anytown, USA</Text>
              <View className="flex-row items-center mt-1">
                <FontAwesome name="clock-o" size={14} color="#6B7280" />
                <Text className="ml-1 text-gray-600 text-sm">09:15 AM</Text>
              </View>
            </View>
          </View>

          <View className="border-t border-gray-200 my-4" />

          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="flag-checkered" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 w-24">Delivery Location:</Text>
            <View className="flex-col">
              <Text className="text-gray-900 font-semibold">456 Oak Ave, Somesville, USA</Text>
              <View className="flex-row items-center mt-1">
                <FontAwesome name="clock-o" size={14} color="#6B7280" />
                <Text className="ml-1 text-gray-600 text-sm">09:40 AM</Text>
              </View>
            </View>
          </View>

          <View className="border-t border-gray-200 my-4" />

          <View className="flex-row items-center">
            <MaterialCommunityIcons name="timer-outline" size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 w-24">Time Taken:</Text>
            <Text className="text-gray-900 font-semibold">25 minutes</Text>
          </View>
        </PrimaryCard>

        {/* Done Button */}
        <PrimaryButton title="Done" onPress={handleDonePress} className="w-full mb-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliverySummary;
