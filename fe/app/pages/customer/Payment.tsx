import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Payment() {
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  const cards = [
    {
      icon: <MaterialCommunityIcons name="credit-card-outline" size={28} color="#7C3AED" />,
      label: '**** **** **** 2334',
    },
    {
      icon: <MaterialCommunityIcons name="credit-card-outline" size={28} color="#06B6D4" />,
      label: '**** **** **** 3774',
    },
    {
      icon: <MaterialCommunityIcons name="email-outline" size={28} color="#6366F1" />,
      label: 'user@example.com',
    },
  ];

  return (
    <View className="flex-1 bg-[#F6F6FA]">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-10 pb-4 bg-white shadow">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 text-center -ml-6">Secure Payment</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="items-center mt-8">
          <Text className="text-gray-500 mb-2">TOTAL</Text>
          <Text className="text-4xl font-extrabold mb-8">$3,080</Text>
        </View>

        {/* Payment Methods */}
        <View className="mx-6">
          {cards.map((card, idx) => (
            <TouchableOpacity
              key={idx}
              className={`flex-row items-center px-4 py-4 mb-4 rounded-xl border ${selected === idx ? 'border-[#FFA726] bg-[#FFF8E1]' : 'border-gray-200 bg-white'}`}
              onPress={() => setSelected(idx)}
              activeOpacity={0.8}
            >
              {card.icon}
              <Text className="ml-4 flex-1 text-base">{card.label}</Text>
              <Ionicons
                name={selected === idx ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected === idx ? '#FFA726' : '#BDBDBD'}
              />
            </TouchableOpacity>
          ))}
        </View>

         {/* Pay Now Button */}
        <TouchableOpacity
          className="bg-[#FFA726] mx-6 py-4 rounded-md flex-row items-center justify-center mt-2"
          onPress={() => {/* Handle payment */}}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">Pay now</Text>
        </TouchableOpacity>

        {/* Booking Confirmation Button */}
        <TouchableOpacity
  className="bg-[#0D47A1] mx-6 py-4 rounded-md flex-row items-center justify-center mt-4"
  onPress={() => router.push('/pages/customer/BookingConfirmation')}
>
  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
  <Text className="text-white font-semibold text-base ml-2">Booking Confirmation</Text>
</TouchableOpacity>

        {/* Chat Button */}
        <TouchableOpacity
          className="bg-white border border-[#FFA726] mx-6 py-4 rounded-md flex-row items-center justify-center mt-4"
          onPress={() => {/* Navigate to chat page */}}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFA726" />
          <Text className="text-[#FFA726] font-semibold text-base ml-2">Chat</Text>
        </TouchableOpacity>

        {/* Add new card */}
        <TouchableOpacity className="flex-row items-center justify-center mt-6">
          <Ionicons name="add" size={18} color="#FFA726" />
          <Text className="text-[#FFA726] font-semibold ml-2">Add new card</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}