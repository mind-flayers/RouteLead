import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Config } from '@/constants/Config';
import { supabase } from '@/lib/supabase';

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
  const [pickupContactName, setPickupContactName] = useState('');
  const [pickupContactPhone, setPickupContactPhone] = useState('');
  const [deliveryContactName, setDeliveryContactName] = useState('');
  const [deliveryContactPhone, setDeliveryContactPhone] = useState('');
  const [requestingParcel, setRequestingParcel] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null);

  // Calculate volume when dimensions change
  useEffect(() => {
    const lengthValue = parseFloat(length);
    const widthValue = parseFloat(width);
    const heightValue = parseFloat(height);
    
    if (!isNaN(lengthValue) && !isNaN(widthValue) && !isNaN(heightValue) && 
        lengthValue > 0 && widthValue > 0 && heightValue > 0) {
      const volumeM3 = (lengthValue * widthValue * heightValue) / 1000000;
      setCalculatedVolume(volumeM3);
    } else {
      setCalculatedVolume(null);
    }
  }, [length, width, height]);

  // Get authenticated user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          Alert.alert('Authentication Error', 'Please log in to request a parcel.');
          router.push('/pages/login');
          return;
        }
        
        // Print whole user data
        console.log('Whole user data:', JSON.stringify(user, null, 2));
        console.log('User ID:', user.id);
        console.log('User email:', user.email);
        console.log('User metadata:', user.user_metadata);
        
        setCustomerId(user.id);
        
        // Auto-fill contact information from user metadata
        const userMetadata = user.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || 'Customer';
        const phone = userMetadata.phone || userMetadata.phone_number || '+94 999999999';
        
        setPickupContactName(fullName);
        setPickupContactPhone(phone);
        setDeliveryContactName(fullName);
        setDeliveryContactPhone(phone);
      } catch (err) {
        console.error('Error getting current user:', err);
        Alert.alert('Error', 'Failed to get user information.');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const handleRequestParcel = async () => {
    // Check if user is authenticated
    if (!customerId) {
      Alert.alert('Authentication Error', 'Please log in to request a parcel.');
      return;
    }

    // Validate all required fields
    if (!weight || !length || !width || !height || !description || 
        !pickupContactName || !pickupContactPhone || !deliveryContactName || !deliveryContactPhone) {
      Alert.alert('Validation Error', 'Please fill in all fields including contact information.');
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
      console.log('Volume calculation:', {
        length: lengthValue,
        width: widthValue,
        height: heightValue,
        volumeCm3: lengthValue * widthValue * heightValue,
        volumeM3: volumeM3
      });
      
      // Create parcel request
      const requestData = {
        customerId: customerId,
        pickupLat: 6.9271, // TODO: Get from route details
        pickupLng: 79.8612, // TODO: Get from route details
        dropoffLat: 6.9934, // TODO: Get from route details
        dropoffLng: 81.0550, // TODO: Get from route details
        weightKg: weightValue,
        volumeM3: volumeM3,
        description: description,
        maxBudget: 1000.00, // TODO: Get from user input or default
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        pickupContactName: pickupContactName,
        pickupContactPhone: pickupContactPhone,
        deliveryContactName: deliveryContactName,
        deliveryContactPhone: deliveryContactPhone
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
      
      // Parse response JSON to get created request ID
      const result = await response.json().catch(() => ({} as any));
      const createdRequestId = result?.id as string | undefined;
      console.log('Created parcel request ID:', createdRequestId);
      Alert.alert('Success!', 'Your parcel request has been submitted successfully.', [
        { text: 'OK', onPress: () => router.push({
          pathname: '/pages/customer/RequestConfirmation',
          params: {
            routeId: routeId,
            requestId: createdRequestId,
            weight: `${weightValue} kg`,
            volume: `${volumeM3.toFixed(4)} m³`,
            description: description,
            pickupContactName: pickupContactName,
            pickupContactPhone: pickupContactPhone,
            deliveryContactName: deliveryContactName,
            deliveryContactPhone: deliveryContactPhone
          }
        }) }
      ]);
    } catch (err) {
      console.error('Error requesting parcel:', err);
      Alert.alert('Error', 'Failed to submit parcel request. Please try again.');
    } finally {
      setRequestingParcel(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
         
         {/* Volume Display */}
         {calculatedVolume !== null && (
           <View style={styles.volumeInfo}>
             <Text style={styles.volumeLabel}>Calculated Volume:</Text>
             <Text style={styles.volumeValue}>{calculatedVolume.toFixed(4)} m³</Text>
           </View>
         )}
         
         <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your parcel (e.g., Fragile electronics, books, etc.)"
          placeholderTextColor="#555"
          style={styles.input}
        />
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup Contact Information</Text>
        <Text style={styles.label}>Contact Name</Text>
        <TextInput
          value={pickupContactName}
          onChangeText={setPickupContactName}
          placeholder="Enter pickup contact name"
          placeholderTextColor="#555"
          style={styles.input}
        />
        <Text style={styles.label}>Contact Phone</Text>
        <TextInput
          value={pickupContactPhone}
          onChangeText={setPickupContactPhone}
          placeholder="Enter pickup contact phone"
          placeholderTextColor="#555"
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Contact Information</Text>
        <Text style={styles.label}>Contact Name</Text>
        <TextInput
          value={deliveryContactName}
          onChangeText={setDeliveryContactName}
          placeholder="Enter delivery contact name"
          placeholderTextColor="#555"
          style={styles.input}
        />
        <Text style={styles.label}>Contact Phone</Text>
        <TextInput
          value={deliveryContactPhone}
          onChangeText={setDeliveryContactPhone}
          placeholder="Enter delivery contact phone"
          placeholderTextColor="#555"
          style={styles.input}
          keyboardType="phone-pad"
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
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
  volumeInfo: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
  },
});
