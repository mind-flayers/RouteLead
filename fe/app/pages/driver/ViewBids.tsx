import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import PrimaryCard from '../../../components/ui/PrimaryCard';
import SecondaryButton from '../../../components/ui/SecondaryButton';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import IndigoButton from '../../../components/ui/IndigoButton';
import { useNavigation } from '@react-navigation/native';

const ViewBids = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewDetails = () => {
    // Navigate to DeliveryManagement screen
    // Assuming 'DeliveryManagement' is a defined route name
    (navigation as any).navigate('pages/driver/DeliveryManagement');
  };

  const bids = [
    {
      id: '1',
      name: 'Michael Chen',
      avatar: require('../../../assets/images/profile_placeholder.jpeg'),
      amount: '52.50',
      timeAgo: '1 hr ago',
      weight: '8 kg',
      dimensions: '30×20×15 cm',
      address: '123 Elm Street, Apartment 4B, Springfield, IL 62704',
      notes: 'Can you deliver by evening today?',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: require('../../../assets/images/profile_placeholder.jpeg'),
      amount: '45.00',
      timeAgo: '3 hr ago',
      weight: '5 kg',
      dimensions: '20×15×10 cm',
      address: '123 Elm Street, Apartment 4B, Springfield, IL 62704',
      notes: 'Please ensure careful handling of fragile items.',
    },
    {
      id: '3',
      name: 'Jessica Lee',
      avatar: require('../../../assets/images/profile_placeholder.jpeg'),
      amount: '38.00',
      timeAgo: '2 hr ago',
      weight: '3 kg',
      dimensions: '15×15×5 cm',
      address: '123 Elm Street, Apartment 4B, Springfield, IL 62704',
      notes: 'Small package, urgent delivery requested.',
    },
  ];

  const wonBids = [
    {
      id: '4',
      name: 'Emily White',
      avatar: require('../../../assets/images/profile_placeholder.jpeg'),
      amount: '48.00',
      weight: '6 kg',
      dimensions: '25×20×10 cm',
      notes: 'Flexible with delivery time, just keep me updated.',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">View Bids</Text>
        <View className="w-10" />{/* Placeholder for alignment */}
      </View>

      <ScrollView className="flex-1">
        {/* Route ID and Details Card */}
        <View className="p-4 bg-white mb-4">
          <Text className="text-lg font-bold mb-2">Route ID: ASDSA423423</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-sharp" size={20} color="#6B7280" />
              <Text className="ml-2 text-base font-semibold">New York, NY</Text>
            </View>
            <View className="items-center my-1">
              <Ionicons name="arrow-down" size={20} color="#6B7280" />
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-sharp" size={20} color="#6B7280" />
              <Text className="ml-2 text-base font-semibold">Los Angeles, CA</Text>
            </View>
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <View className="flex-row items-center">
                <FontAwesome name="clock-o" size={16} color="#6B7280" />
                <Text className="ml-2 text-sm text-gray-600">02 Days | 02:56:48 Hrs Left</Text>
              </View>
              <View className="bg-yellow-100 px-3 py-1 rounded-full">
                <Text className="text-yellow-700 text-xs font-semibold">Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sort By and Filter */}
        <View className="flex-row justify-between items-center px-4 py-2 bg-white mb-4">
          <TouchableOpacity className="flex-row items-center border border-gray-300 rounded-md px-3 py-2">
            <Text className="text-gray-700 mr-1">Sort By: Time</Text>
            <Ionicons name="chevron-down" size={16} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center border border-gray-300 rounded-md px-3 py-2">
            <Ionicons name="filter" size={16} color="gray" />
            <Text className="text-gray-700 ml-1">Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Bids List */}
        <View className="px-4">
          {bids.map((bid) => (
            <PrimaryCard key={bid.id} className="mb-4 p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Image source={bid.avatar} className="w-10 h-10 rounded-full mr-3" />
                  <Text className="text-lg font-bold">{bid.name}</Text>
                </View>
                <Text className="text-gray-500 text-sm">
                  <FontAwesome name="clock-o" size={14} color="#6B7280" /> {bid.timeAgo}
                </Text>
              </View>
              <Text className="text-orange-500 text-2xl font-bold mb-3">LKR {bid.amount}</Text>
              <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons name="package-variant" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-700">{bid.weight} {bid.dimensions}</Text>
              </View>
              <Text>From: </Text>
              <View className="flex-row items-center mb-3">
                <Ionicons name="location-sharp" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-700">{bid.address}</Text>
              </View>
              <Text>To: </Text>
              <View className="flex-row items-center mb-3">
                <Ionicons name="location-sharp" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-700">{bid.address}</Text>
              </View>
              <Text className="text-blue-600 font-semibold mb-4">Notes: <Text className="text-gray-700 font-normal">{bid.notes}</Text></Text>
              <View className="flex-row justify-between">
                <SecondaryButton title="Reject Bid" onPress={() => console.log('Reject Bid')} />
                <PrimaryButton title="Accept Bid" onPress={() => console.log('Accept Bid')} />
              </View>
            </PrimaryCard>
          ))}
        </View>

        {/* Won Bids Section */}
        <View className="px-4 mt-4 mb-8">
          <Text className="text-lg font-bold mb-4">Won Bids ({wonBids.length})</Text>
          {wonBids.map((bid) => (
            <PrimaryCard key={bid.id} className="mb-4 p-4 text-orange-100">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Image source={bid.avatar} className="w-10 h-10 rounded-full mr-3" />
                  <Text className="text-lg font-bold">{bid.name}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="green" />
              </View>
              <Text className="text-orange-500 text-2xl font-bold mb-3">LKR {bid.amount}</Text>
              <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons name="package-variant" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-700">{bid.weight} {bid.dimensions}</Text>
              </View>
              <Text className="text-blue-600 font-semibold mb-4">Notes: <Text className="text-gray-700 font-normal">{bid.notes}</Text></Text>
              <IndigoButton title="View Details" onPress={handleViewDetails} />
            </PrimaryCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewBids;
