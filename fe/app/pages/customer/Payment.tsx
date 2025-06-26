import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="items-center mt-8">
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>$3,080</Text>
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
              <Text style={styles.cardLabel}>{card.label}</Text>
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
          <Text style={styles.buttonText}>Pay now</Text>
        </TouchableOpacity>

        {/* Booking Confirmation Button */}
        <TouchableOpacity
  className="bg-[#0D47A1] mx-6 py-4 rounded-md flex-row items-center justify-center mt-4"
  onPress={() => router.push('/pages/customer/BookingConfirmation')}
>
  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
  <Text style={styles.buttonText}>Booking Confirmation</Text>
</TouchableOpacity>

        {/* Chat Button */}
        <TouchableOpacity
          className="bg-white border border-[#FFA726] mx-6 py-4 rounded-md flex-row items-center justify-center mt-4"
          onPress={() => {/* Navigate to chat page */}}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFA726" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>

        {/* Add new card */}
        <TouchableOpacity className="flex-row items-center justify-center mt-6">
          <Ionicons name="add" size={18} color="#FFA726" />
          <Text style={styles.addCardText}>Add new card</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  totalLabel: {
    color: '#6B7280',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 32,
  },
  cardLabel: {
    marginLeft: 16,
    flex: 1,
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  chatButtonText: {
    color: '#FFA726',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  addCardText: {
    color: '#FFA726',
    fontWeight: '600',
    marginLeft: 8,
  },
});