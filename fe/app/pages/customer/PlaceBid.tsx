import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';

export default function PlaceBid() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const handlePlaceBid = () => {
    router.push({
      pathname: '/pages/customer/BidConfirmation',
      params: {
        amount,
        route: 'New York to Boston',
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 50 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 20 }}>Route Details</Text>
      <Text style={{ marginVertical: 4 }}>123 Main St, Anytown to 456 Oak Ave, Anytown</Text>
      <Text>Distance: 100 miles</Text>
      <Text>Vehicle Type: Car</Text>

      <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 20 }}>Bid Details</Text>
      <TextInput
        placeholder="Enter bid amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{
          marginVertical: 10,
          padding: 12,
          backgroundColor: '#f1f1f1',
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Preferred delivery date/time"
        value={preferredTime}
        onChangeText={setPreferredTime}
        style={{
          marginVertical: 10,
          padding: 12,
          backgroundColor: '#f1f1f1',
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Additional notes"
        multiline
        value={notes}
        onChangeText={setNotes}
        style={{
          height: 100,
          padding: 12,
          backgroundColor: '#f1f1f1',
          borderRadius: 8,
          textAlignVertical: 'top',
          marginVertical: 10,
        }}
      />

      <TouchableOpacity
        onPress={handlePlaceBid}
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: 'black',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Place Bid
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
