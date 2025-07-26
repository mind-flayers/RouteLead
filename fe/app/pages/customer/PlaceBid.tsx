import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Config } from '@/constants/Config';

export default function PlaceBid() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get route parameters
  const routeId = params.routeId as string;
  const origin = params.origin as string;
  const destination = params.destination as string;

  // Simulate driver's fixed price (replace with prop or API as needed)
  const fixedPrice = 1000; // Example: 1000. Replace with actual value.

  const [bid, setBid] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [description, setDescription] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  
  // TODO: Replace with actual customerId from context or authentication
  const customerId = '70ba4867-edcb-4628-b614-7bb60e935862';

  const handlePlaceBid = async () => {
    // Validate all required fields
    if (!bid || !weight || !length || !width || !height || !description) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    
    // Validate numeric values
    const bidAmount = parseFloat(bid);
    const weightValue = parseFloat(weight);
    const lengthValue = parseFloat(length);
    const widthValue = parseFloat(width);
    const heightValue = parseFloat(height);
    
    if (isNaN(bidAmount) || isNaN(weightValue) || isNaN(lengthValue) || isNaN(widthValue) || isNaN(heightValue)) {
      Alert.alert('Validation Error', 'Please enter valid numeric values for all fields.');
      return;
    }
    
    if (bidAmount <= fixedPrice) {
      Alert.alert('Invalid Bid', `Your bid must be higher than the driver&apos;s fixed price: ${fixedPrice}`);
      return;
    }
    
    if (weightValue <= 0 || lengthValue <= 0 || widthValue <= 0 || heightValue <= 0) {
      Alert.alert('Validation Error', 'Weight and dimensions must be greater than 0.');
      return;
    }
    
    try {
      setPlacingBid(true);
      
      // Calculate volume from dimensions (convert cm³ to m³)
      const volumeM3 = (lengthValue * widthValue * heightValue) / 1000000;
      
      // Create both request and bid in one call
      const combinedData = {
        customerId: customerId,
        pickupLat: 6.9271, // TODO: Get from route details
        pickupLng: 79.8612, // TODO: Get from route details
        dropoffLat: 6.9934, // TODO: Get from route details
        dropoffLng: 81.0550, // TODO: Get from route details
        weightKg: weightValue,
        volumeM3: volumeM3,
        description: description,
        maxBudget: bidAmount,
        pickupContactName: "Customer", // TODO: Get from user profile
        pickupContactPhone: "+94 999999999", // TODO: Get from user profile
        deliveryContactName: "Customer", // TODO: Get from user profile
        deliveryContactPhone: "+94 999999999", // TODO: Get from user profile
        offeredPrice: bidAmount,
        specialInstructions: description
      };
      
      console.log('Sending data to backend:', combinedData);
      
      const response = await fetch(`${Config.API_BASE}/routes/${routeId}/create-request-and-bid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(combinedData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to place bid: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      Alert.alert('Success!', 'Your bid has been placed successfully.', [
        { text: 'OK', onPress: () => router.push('/pages/customer/BidConfirmation') }
      ]);
    } catch (err) {
      console.error('Error placing bid:', err);
      Alert.alert('Error', 'Failed to place bid. Please try again.');
    } finally {
      setPlacingBid(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Route Information */}
      <View style={styles.routeInfo}>
        <Text style={styles.routeTitle}>Route Details</Text>
        <Text style={styles.routeText}>{origin} → {destination}</Text>
      </View>
      
      {/* Bid Details */}
      <Text style={styles.title}>Place Your Bid</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Bid Amount (Driver&apos;s Fixed Price: {fixedPrice})</Text>
        <TextInput
          value={bid}
          onChangeText={setBid}
          keyboardType="numeric"
          placeholder={`Enter your bid (above ${fixedPrice})`}
          placeholderTextColor="#555"
          style={styles.input}
        />
        {bid && parseFloat(bid) <= fixedPrice && (
          <Text style={{ color: 'red', marginTop: 4 }}>
            Your bid must be higher than the fixed price ({fixedPrice}).
          </Text>
        )}
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
      <TouchableOpacity 
        style={[styles.button, placingBid && styles.buttonDisabled]} 
        onPress={handlePlaceBid}
        disabled={placingBid}
      >
        <Text style={styles.buttonText}>
          {placingBid ? 'Placing Bid...' : 'Place Your Bid'}
        </Text>
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
  routeInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#424242',
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
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
