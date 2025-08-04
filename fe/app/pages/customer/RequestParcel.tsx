import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Config } from '@/constants/Config';

export default function RequestParcel() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get route parameters
  const routeId = params.routeId as string;
  const origin = params.origin as string;
  const destination = params.destination as string;

  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [description, setDescription] = useState('');
  const [requestingParcel, setRequestingParcel] = useState(false);
  
  // TODO: Replace with actual customerId from context or authentication
  const customerId = '70ba4867-edcb-4628-b614-7bb60e935862';

  const handleRequestParcel = async () => {
    // Validate all required fields
    if (!weight || !length || !width || !height || !description) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    
    // Validate numeric values
    const weightValue = parseFloat(weight);
    const lengthValue = parseFloat(length);
    const widthValue = parseFloat(width);
    const heightValue = parseFloat(height);
    
    if (isNaN(weightValue) || isNaN(lengthValue) || isNaN(widthValue) || isNaN(heightValue)) {
      Alert.alert('Validation Error', 'Please enter valid numeric values for all fields.');
      return;
    }
    
    if (weightValue <= 0 || lengthValue <= 0 || widthValue <= 0 || heightValue <= 0) {
      Alert.alert('Validation Error', 'Weight and dimensions must be greater than 0.');
      return;
    }
    
    try {
      setRequestingParcel(true);
      
      // Calculate volume from dimensions (convert cm³ to m³)
      const volumeM3 = (lengthValue * widthValue * heightValue) / 1000000;
      
      // Create parcel request
      const requestData = {
        customer: { id: customerId },
        pickupLat: 6.9271, // TODO: Get from route details
        pickupLng: 79.8612, // TODO: Get from route details
        dropoffLat: 6.9934, // TODO: Get from route details
        dropoffLng: 81.0550, // TODO: Get from route details
        weightKg: weightValue,
        volumeM3: volumeM3,
        description: description,
        maxBudget: 1000.00, // TODO: Get from user input or default
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        pickupContactName: "Customer", // TODO: Get from user profile
        pickupContactPhone: "+94 999999999", // TODO: Get from user profile
        deliveryContactName: "Customer", // TODO: Get from user profile
        deliveryContactPhone: "+94 999999999" // TODO: Get from user profile
      };
      
      console.log('Sending parcel request to backend:', requestData);
      
      const response = await fetch(`${Config.API_BASE}/parcel-requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to request parcel: ${response.status} - ${errorText}`);
      }
      
      // Check if response has content before parsing JSON
      const responseText = await response.text();
      console.log('Backend response:', responseText);
      
      let result = null;
      if (responseText && responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // If it's a 201 status, the request was successful even without JSON response
          if (response.status === 201) {
            result = { success: true };
          } else {
            throw new Error(`Invalid JSON response: ${responseText}`);
          }
        }
      } else if (response.status === 201) {
        // Empty response but 201 status means success
        result = { success: true };
      }
      Alert.alert('Success!', 'Your parcel request has been submitted successfully.', [
        { text: 'OK', onPress: () => router.push('/pages/customer/RequestConfirmation') }
      ]);
    } catch (err) {
      console.error('Error requesting parcel:', err);
      Alert.alert('Error', 'Failed to submit parcel request. Please try again.');
    } finally {
      setRequestingParcel(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Route Information */}
      <View style={styles.routeInfo}>
        <Text style={styles.routeTitle}>Route Details</Text>
        <Text style={styles.routeText}>{origin} → {destination}</Text>
      </View>
      
      {/* Parcel Request Details */}
      <Text style={styles.title}>Parcel Request</Text>

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
        style={[styles.button, requestingParcel && styles.buttonDisabled]} 
        onPress={handleRequestParcel}
        disabled={requestingParcel}
      >
        <Text style={styles.buttonText}>
          {requestingParcel ? 'Requesting...' : 'Request'}
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
