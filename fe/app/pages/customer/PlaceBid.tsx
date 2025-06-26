import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PlaceBid() {
  const router = useRouter();

  const handlePlaceBid = () => {
    // You can pass bid details as params if needed
    router.push('/pages/customer/BidConfirmation');
  };

  const [bid, setBid] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [type, setType] = useState('Small Package');

  return (
    <ScrollView style={styles.container}>
      {/* Bid Details */}
      <Text style={styles.title}>Place Your Bid</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Bid Amount</Text>
        <TextInput
          value={bid}
          onChangeText={setBid}
          keyboardType="numeric"
          placeholder="e.g., 500.00"
          style={styles.input}
        />
      </View>

      {/* Parcel Details */}
      <View style={styles.section}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="e.g., 5"
          style={styles.input}
        />
        <Text style={styles.label}>Dimensions (cm)</Text>
        <TextInput
          value={dimensions}
          onChangeText={setDimensions}
          placeholder="e.g., 30×20×15"
          style={styles.input}
        />
        <Text style={styles.label}>Parcel Type</Text>
        <TextInput
          value={type}
          onChangeText={setType}
          placeholder="e.g., Small Package"
          style={styles.input}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handlePlaceBid}>
        <Text style={styles.buttonText}>Place Your Bid</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0D47A1',
    paddingVertical: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
