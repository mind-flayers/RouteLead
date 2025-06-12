import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function BidConfirmation() {
  const router = useRouter();
  const { amount, route } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 50 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 20 }}>
        Bid Placed Successfully
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Your bid has been successfully placed. You will be notified if your bid is accepted.
      </Text>

      <Text style={{ fontWeight: '600' }}>Bid Details</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Text>Bid Amount: ${amount}</Text>
        <Text>Route: {route}</Text>
        <Text>Reference Number: REF-{Math.floor(1000 + Math.random() * 9000)}</Text>
      </View>

      <View style={{ marginTop: 40 }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>View Bid Status</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#ccc',
            padding: 16,
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: 'center' }}>Manage Bid</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
