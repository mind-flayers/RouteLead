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
  const pickupLat = params.pickupLat as string;
  const pickupLng = params.pickupLng as string;
  const dropoffLat = params.dropoffLat as string;
  const dropoffLng = params.dropoffLng as string;

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
  const [maxBudget, setMaxBudget] = useState('1000.00'); // Add max budget state with default value
  const [routeDetails, setRouteDetails] = useState<{
    suggestedPriceMin: number;
    suggestedPriceMax: number;
    driverName: string;
  } | null>(null);
  const [priceValidationError, setPriceValidationError] = useState<string | null>(null);

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

  // Fetch route details to get price range
  useEffect(() => {
    const fetchRouteDetails = async () => {
      if (!routeId || routeId === 'custom' || routeId === '') {
        console.log('No valid route ID provided, skipping route details fetch');
        return;
      }

      try {
        console.log('Fetching route details for routeId:', routeId);
        const response = await fetch(`${Config.API_BASE}/routes/${routeId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch route details:', response.status);
          return;
        }
        
        const routeData = await response.json();
        console.log('Route details received:', routeData);
        
        setRouteDetails({
          suggestedPriceMin: routeData.suggestedPriceMin || 0,
          suggestedPriceMax: routeData.suggestedPriceMax || 0,
          driverName: routeData.driverName || 'Unknown Driver'
        });
        
        // Set default max budget to the minimum suggested price
        if (routeData.suggestedPriceMin) {
          setMaxBudget(routeData.suggestedPriceMin.toString());
        }
      } catch (error) {
        console.error('Error fetching route details:', error);
      }
    };

    fetchRouteDetails();
  }, [routeId]);

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
  }, [router]);

  // Validate max budget against route's suggested price range
  const validateMaxBudget = (value: string) => {
    setMaxBudget(value);
    setPriceValidationError(null);
    
    if (!value || value.trim() === '') {
      setPriceValidationError('Maximum budget is required');
      return;
    }
    
    const budgetValue = parseFloat(value);
    if (isNaN(budgetValue)) {
      setPriceValidationError('Please enter a valid number');
      return;
    }
    
    if (budgetValue <= 0) {
      setPriceValidationError('Maximum budget must be greater than 0');
      return;
    }
    
    if (routeDetails) {
      if (budgetValue < routeDetails.suggestedPriceMin) {
        setPriceValidationError(`Minimum allowed budget is LKR ${routeDetails.suggestedPriceMin.toFixed(2)}`);
        return;
      }
      
      if (budgetValue > routeDetails.suggestedPriceMax) {
        setPriceValidationError(`Maximum allowed budget is LKR ${routeDetails.suggestedPriceMax.toFixed(2)}`);
        return;
      }
    }
  };

  const handleRequestParcel = async () => {
    // Check if user is authenticated
    if (!customerId) {
      Alert.alert('Authentication Error', 'Please log in to request a parcel.');
      return;
    }

    // Validate all required fields
    if (!weight || !length || !width || !height || !description || 
        !pickupContactName || !pickupContactPhone || !deliveryContactName || !deliveryContactPhone || !maxBudget) {
      Alert.alert('Validation Error', 'Please fill in all fields including contact information and max budget.');
      return;
    }
    
    // Validate price range if route details are available
    if (priceValidationError) {
      Alert.alert('Price Validation Error', priceValidationError);
      return;
    }
    
    // Validate coordinates
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      Alert.alert('Validation Error', 'Please select pickup and dropoff locations from the map first.');
      return;
    }
    
    // Validate numeric values
    const weightValue = parseFloat(weight);
    const lengthValue = parseFloat(length);
    const widthValue = parseFloat(width);
    const heightValue = parseFloat(height);
    const maxBudgetValue = parseFloat(maxBudget);
    
    if (isNaN(weightValue) || isNaN(lengthValue) || isNaN(widthValue) || isNaN(heightValue) || isNaN(maxBudgetValue)) {
      Alert.alert('Validation Error', 'Please enter valid numeric values for all fields.');
      return;
    }
    
    if (weightValue <= 0 || lengthValue <= 0 || widthValue <= 0 || heightValue <= 0 || maxBudgetValue <= 0) {
      Alert.alert('Validation Error', 'Weight, dimensions, and max budget must be greater than 0.');
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
        pickupLat: parseFloat(pickupLat) || 6.9271, // Use coordinates from map selection
        pickupLng: parseFloat(pickupLng) || 79.8612, // Use coordinates from map selection
        dropoffLat: parseFloat(dropoffLat) || 6.9934, // Use coordinates from map selection
        dropoffLng: parseFloat(dropoffLng) || 81.0550, // Use coordinates from map selection
        weightKg: weightValue,
        volumeM3: volumeM3,
        description: description,
        maxBudget: maxBudgetValue, // Use the user input max budget
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
      
             // Automatically create the first bid with the max budget
       console.log('Route ID for automatic bid:', routeId, 'Type:', typeof routeId);
       
       // Validate that routeId is a valid UUID
       const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
       const isValidUuid = uuidRegex.test(routeId);
       console.log('Is valid UUID:', isValidUuid);
       
       if (createdRequestId && routeId && routeId !== 'custom' && routeId !== '' && isValidUuid) {
        try {
          const bidData = {
            routeId: routeId,
            offeredPrice: maxBudgetValue
          };
          
          console.log('Creating automatic bid:', bidData);
          
          const bidResponse = await fetch(`${Config.API_BASE}/parcel-requests/${createdRequestId}/bids`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(bidData),
          });
          
                     if (bidResponse.ok) {
             const bidResult = await bidResponse.json();
             console.log('Automatic bid created successfully:', bidResult);
           } else {
             const errorText = await bidResponse.text();
             console.error('Failed to create automatic bid:', errorText);
             console.error('Bid request data:', bidData);
             console.error('Response status:', bidResponse.status);
           }
                 } catch (bidErr) {
           console.error('Error creating automatic bid:', bidErr);
         }
       } else if (routeId && !isValidUuid) {
         console.log('Skipping automatic bid creation - routeId is not a valid UUID:', routeId);
       }
      
      Alert.alert('Success!', 'Your parcel request has been submitted successfully.', [
        { text: 'OK', onPress: () => router.push({
          pathname: '/pages/customer/RequestConfirmation',
          params: {
            routeId: routeId,
            requestId: createdRequestId,
            weight: `${weightValue} kg`,
            volume: `${volumeM3.toFixed(4)} m³`,
            description: description,
            maxBudget: maxBudgetValue.toString(), // Pass max budget to confirmation page
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Route Information */}
        <View style={styles.routeInfo}>
          <Text style={styles.routeTitle}>Route Details</Text>
          <Text style={styles.routeText}>{origin} → {destination}</Text>
          {routeDetails && (
            <Text style={styles.driverText}>
              Driver: {routeDetails.driverName}
            </Text>
          )}
          <Text style={styles.coordinatesText}>
            Pickup: {pickupLat}, {pickupLng}
          </Text>
          <Text style={styles.coordinatesText}>
            Dropoff: {dropoffLat}, {dropoffLng}
          </Text>
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
          
          <Text style={styles.label}>Maximum Budget (LKR)</Text>
          {routeDetails && (
            <Text style={styles.priceRangeText}>
              Allowed range: LKR {routeDetails.suggestedPriceMin.toFixed(2)} - LKR {routeDetails.suggestedPriceMax.toFixed(2)}
            </Text>
          )}
          <TextInput
            value={maxBudget}
            onChangeText={validateMaxBudget}
            keyboardType="numeric"
            placeholder="Enter your maximum budget"
            placeholderTextColor="#555"
            style={[
              styles.input,
              priceValidationError && styles.inputError
            ]}
          />
          {priceValidationError && (
            <Text style={styles.errorText}>{priceValidationError}</Text>
          )}
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
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, requestingParcel && styles.buttonDisabled]} 
          onPress={handleRequestParcel}
          disabled={requestingParcel}
        >
          <Text style={styles.buttonText}>
            {requestingParcel ? 'Requesting...' : 'Request'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 100, // Add padding to prevent content from being hidden behind the fixed button
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 34, // Account for safe area
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
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
  driverText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
    marginTop: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  priceRangeText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -12,
    marginBottom: 16,
  },
});
