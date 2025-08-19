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
      label: 'sanjika@example.com',
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
          <Text style={styles.totalAmount}>LKR 3,080</Text>
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
          onPress={() => {
            // Handle payment logic here
            console.log('Processing payment...');
            // Navigate to booking confirmation after payment
            router.push('/pages/customer/BookingConfirmation');
          }}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Pay now</Text>
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
});