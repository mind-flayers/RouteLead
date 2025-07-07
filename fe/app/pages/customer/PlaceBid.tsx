import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PlaceBid() {
  const router = useRouter();

  // Simulate driver's fixed price (replace with prop or API as needed)
  const fixedPrice = 1000; // Example: 1000. Replace with actual value.

  const [bid, setBid] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [description, setDescription] = useState('');
  // TODO: Replace with actual customerId and routeId from context or navigation params
  const customerId = '70ba4867-edcb-4628-b614-7bb60e935862';
  const routeId = 'ROUTE_ID_HERE'; // Replace with actual routeId
  const API_BASE_URL = 'http://localhost:8080/api';

  const handlePlaceBid = async () => {
    if (!bid || !weight || !length || !width || !height || !description) {
      alert('Please fill in all fields.');
      return;
    }
    if (parseFloat(bid) > fixedPrice) {
      alert(`Bid amount cannot exceed the driver's fixed price: ${fixedPrice}`);
      return;
    }
    try {
      const bidData = {
        amount: parseFloat(bid),
        weight: parseFloat(weight),
        dimensions: `${length}×${width}×${height}`,
        description,
        customerId,
        routeId,
      };
      const res = await fetch(`${API_BASE_URL}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bidData),
      });
      if (!res.ok) throw new Error('Failed to place bid');
      router.push('/pages/customer/MyBids');
    } catch (err) {
      let message = 'Could not place bid';
      if (err instanceof Error) message = err.message;
      router.push('/pages/customer/MyBids')
      // alert(message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Bid Details */}
      <Text style={styles.title}>Place Your Bid</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Bid Amount (Driver's Fixed Price: {fixedPrice})</Text>
        <TextInput
          value={bid}
          onChangeText={text => {
            // Only allow up to fixedPrice
            if (!text || parseFloat(text) <= fixedPrice) setBid(text);
          }}
          keyboardType="numeric"
          placeholder={`Enter your bid (up to ${fixedPrice})`}
          placeholderTextColor="#555"
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
          placeholder="Enter weight in kg (e.g., 5)"
          placeholderTextColor="#555"
          style={styles.input}
        />
        <Text style={styles.label}>Dimensions (cm)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput
            value={length}
            onChangeText={setLength}
            keyboardType="numeric"
            placeholder="Length (cm)"
            placeholderTextColor="#555"
            style={[styles.input, { flex: 1, marginRight: 4 }]}
          />
          <TextInput
            value={width}
            onChangeText={setWidth}
            keyboardType="numeric"
            placeholder="Width (cm)"
            placeholderTextColor="#555"
            style={[styles.input, { flex: 1, marginHorizontal: 2 }]}
          />
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Height (cm)"
            placeholderTextColor="#555"
            style={[styles.input, { flex: 1, marginLeft: 4 }]}
          />
        </View>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your parcel (e.g., Fragile electronics, books, etc.)"
          placeholderTextColor="#555"
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
