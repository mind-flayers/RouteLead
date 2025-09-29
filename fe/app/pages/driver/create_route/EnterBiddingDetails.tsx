import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouteCreation } from '../../../../contexts/RouteCreationContext';
import { ApiService, formatLocation } from '../../../../services/apiService';
import { useDriverInfo } from '../../../../hooks/useEarningsData';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';
import PrimaryCard from '../../../../components/ui/PrimaryCard';

const EnterBiddingDetails = () => {
  const router = useRouter();
  const { routeData, updateRouteData, isLocationDataComplete, getCreateRoutePayload, clearRouteData } = useRouteCreation();
  const { driverId } = useDriverInfo();

  // Form state
  const [biddingStartDate, setBiddingStartDate] = useState(new Date());
  const [biddingStartTime, setBiddingStartTime] = useState(new Date());
  const [departureDate, setDepartureDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState(new Date());
  const [detourTolerance, setDetourTolerance] = useState('5');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  
  // UI state
  const [showBiddingDatePicker, setShowBiddingDatePicker] = useState(false);
  const [showBiddingTimePicker, setShowBiddingTimePicker] = useState(false);
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false);
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  
  // Price suggestion state
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  
  // Location names state
  const [originLocationName, setOriginLocationName] = useState('');
  const [destinationLocationName, setDestinationLocationName] = useState('');

  // Check if route data is complete
  useEffect(() => {
    if (!isLocationDataComplete()) {
      Alert.alert(
        'Missing Route Data',
        'Please select your route locations first.',
        [
          {
            text: 'Select Route',
            onPress: () => router.push('/pages/driver/create_route/SelectLocation'),
          },
        ]
      );
    }
  }, []);

  // Load location names from coordinates
  useEffect(() => {
    const loadLocationNames = async () => {
      if (routeData.origin) {
        const originName = await formatLocation(`${routeData.origin.lat}, ${routeData.origin.lng}`);
        setOriginLocationName(originName);
      }
      if (routeData.destination) {
        const destName = await formatLocation(`${routeData.destination.lat}, ${routeData.destination.lng}`);
        setDestinationLocationName(destName);
      }
    };

    if (isLocationDataComplete()) {
      loadLocationNames();
    }
  }, [routeData.origin, routeData.destination]);

  const onChangeBiddingDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || biddingStartDate;
    setShowBiddingDatePicker(Platform.OS === 'ios');
    setBiddingStartDate(currentDate);
  };

  const onChangeBiddingTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || biddingStartTime;
    setShowBiddingTimePicker(Platform.OS === 'ios');
    setBiddingStartTime(currentTime);
  };

  const onChangeDepartureDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || departureDate;
    setShowDepartureDatePicker(Platform.OS === 'ios');
    setDepartureDate(currentDate);
  };

  const onChangeDepartureTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || departureTime;
    setShowDepartureTimePicker(Platform.OS === 'ios');
    setDepartureTime(currentTime);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const generatePriceSuggestion = async () => {
    if (!isLocationDataComplete()) {
      setSuggestionError('Please select route locations first.');
      return;
    }

    // Validate that weight and volume are provided
    if (!maxWeight || !maxVolume) {
      setSuggestionError('Please enter maximum weight and volume capacity first to get accurate price suggestions.');
      return;
    }

    const weightNum = parseFloat(maxWeight);
    const volumeNum = parseFloat(maxVolume);

    if (isNaN(weightNum) || weightNum <= 0) {
      setSuggestionError('Please enter a valid weight (greater than 0).');
      return;
    }

    if (isNaN(volumeNum) || volumeNum <= 0) {
      setSuggestionError('Please enter a valid volume (greater than 0).');
      return;
    }

    setIsLoadingSuggestion(true);
    setSuggestionError(null);

    try {
      const distance = routeData.selectedRoute?.distance || 0;
      
      if (distance <= 0) {
        throw new Error('Invalid route distance');
      }

      // Call the actual ML service through the backend API
      const features = {
        distance: distance,
        weight: weightNum,
        volume: volumeNum
      };

      console.log('Calling backend ML prediction API with features:', features);

      try {
        // Call the standalone prediction API
        const result = await ApiService.predictPrice(features);
        
        console.log('ML prediction received from backend:', result);
        setPriceSuggestion({
          minPrice: result.minPrice,
          maxPrice: result.maxPrice,
          modelVersion: result.modelVersion || "1.0",
          generatedAt: result.generatedAt || new Date().toISOString(),
          confidence: result.confidence || 0.90,
          features: features
        });
        return;

      } catch (backendError) {
        console.warn('Backend ML prediction API failed, trying fallback methods:', backendError);
        
        // Fallback: Call ML service directly
        try {
          const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(features),
          });

          if (!response.ok) {
            throw new Error(`ML service error: ${response.status}`);
          }

          const mlResult = await response.json();
          const predictedPrice = mlResult.price;

          // Apply same scaling factor as backend (reduce by 70%)
          const scaledPrice = predictedPrice * 0.3;

          // Calculate price range (±20% of predicted price)
          const minPrice = Math.round(scaledPrice * 0.3);
          const maxPrice = Math.round(scaledPrice * 1.2);
          
          const suggestion = {
            minPrice: minPrice,
            maxPrice: maxPrice,
            modelVersion: "1.0-direct",
            generatedAt: new Date().toISOString(),
            confidence: 0.80,
            features: features
          };
          
          console.log('Direct ML prediction received:', suggestion);
          setPriceSuggestion(suggestion);
          return;

        } catch (mlError) {
          console.warn('Direct ML service also failed, using final fallback:', mlError);
          
          // Final fallback calculation if all ML services are unavailable
          // Using reasonable Sri Lankan market rates: LKR 50 per km base rate + weight/volume factors
          const basePrice = distance * 15 + (weightNum * 2) + (volumeNum * 20);
          const minPrice = Math.round(basePrice * 0.8);
          const maxPrice = Math.round(basePrice * 1.2);
          
          const fallbackSuggestion = {
            minPrice: minPrice,
            maxPrice: maxPrice,
            modelVersion: "1.0-fallback",
            generatedAt: new Date().toISOString(),
            confidence: 0.60,
            features: features
          };
          
          console.log('Using final fallback prediction:', fallbackSuggestion);
          setPriceSuggestion(fallbackSuggestion);
        }
      }
      
    } catch (error) {
      console.error('Error generating price suggestion:', error);
      setSuggestionError(`Failed to generate price suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const applySuggestion = () => {
    if (priceSuggestion) {
      setMinPrice(priceSuggestion.minPrice?.toString() || '');
      setMaxPrice(priceSuggestion.maxPrice?.toString() || '');
    }
  };

  const validateForm = () => {
    if (!minPrice || !maxPrice) {
      Alert.alert('Validation Error', 'Please enter both minimum and maximum prices.');
      return false;
    }

    const minPriceNum = parseFloat(minPrice);
    const maxPriceNum = parseFloat(maxPrice);

    if (isNaN(minPriceNum) || isNaN(maxPriceNum)) {
      Alert.alert('Validation Error', 'Please enter valid numeric prices.');
      return false;
    }

    if (minPriceNum >= maxPriceNum) {
      Alert.alert('Validation Error', 'Maximum price must be greater than minimum price.');
      return false;
    }

    if (minPriceNum < 0 || maxPriceNum < 0) {
      Alert.alert('Validation Error', 'Prices cannot be negative.');
      return false;
    }

    // Combine bidding start date and time
    const combinedBiddingStartTime = new Date(biddingStartDate);
    combinedBiddingStartTime.setHours(biddingStartTime.getHours());
    combinedBiddingStartTime.setMinutes(biddingStartTime.getMinutes());

    // Combine departure date and time
    const combinedDepartureTime = new Date(departureDate);
    combinedDepartureTime.setHours(departureTime.getHours());
    combinedDepartureTime.setMinutes(departureTime.getMinutes());

    if (combinedBiddingStartTime <= new Date()) {
      Alert.alert('Validation Error', 'Bidding start time must be in the future.');
      return false;
    }

    if (combinedDepartureTime <= new Date()) {
      Alert.alert('Validation Error', 'Departure time must be in the future.');
      return false;
    }

    // Bidding should end 2 hours before departure
    const biddingEndTime = new Date(combinedDepartureTime.getTime() - (2 * 60 * 60 * 1000));
    
    if (combinedBiddingStartTime >= biddingEndTime) {
      Alert.alert('Validation Error', 'Bidding must start more than 3 hours before departure time.');
      return false;
    }

    return true;
  };

  const handleCreateRoute = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isLocationDataComplete()) {
      Alert.alert('Error', 'Route location data is incomplete.');
      return;
    }

    setIsCreatingRoute(true);

    try {
      // Combine bidding start date and time
      const combinedBiddingStartTime = new Date(biddingStartDate);
      combinedBiddingStartTime.setHours(biddingStartTime.getHours());
      combinedBiddingStartTime.setMinutes(biddingStartTime.getMinutes());

      // Combine departure date and time
      const combinedDepartureTime = new Date(departureDate);
      combinedDepartureTime.setHours(departureTime.getHours());
      combinedDepartureTime.setMinutes(departureTime.getMinutes());

      // Build the route payload directly with current form data
      const routePayload = {
        driverId,
        originLat: routeData.origin!.lat,
        originLng: routeData.origin!.lng,
        destinationLat: routeData.destination!.lat,
        destinationLng: routeData.destination!.lng,
        departureTime: combinedDepartureTime.toISOString(),
        biddingStartTime: combinedBiddingStartTime.toISOString(),
        detourToleranceKm: parseFloat(detourTolerance) || 5.0,
        suggestedPriceMin: parseFloat(minPrice),
        suggestedPriceMax: parseFloat(maxPrice),
        // Enhanced fields for polyline support
        routePolyline: routeData.selectedRoute!.encoded_polyline,
        totalDistanceKm: routeData.selectedRoute!.distance,
        estimatedDurationMinutes: Math.round(routeData.selectedRoute!.duration),
      };

      console.log('Creating route with payload:', routePayload);

      // Create the route via API
      const result = await ApiService.createRoute(routePayload);

      console.log('Route created successfully:', result);

      // If price suggestion was returned, store it
      if (result.priceSuggestion && !priceSuggestion) {
        setPriceSuggestion(result.priceSuggestion);
      }

      // Update route data in context for consistency (optional, since we're navigating away)
      updateRouteData({
        biddingStartTime: combinedBiddingStartTime,
        departureTime: combinedDepartureTime,
        detourToleranceKm: parseFloat(detourTolerance) || 5.0,
        suggestedPriceMin: parseFloat(minPrice),
        suggestedPriceMax: parseFloat(maxPrice),
        vehicleCapacity: {
          maxWeight: parseFloat(maxWeight) || 0,
          maxVolume: parseFloat(maxVolume) || 0,
        }
      });

      // Show success message and navigate to dashboard
      Alert.alert(
        'Route Created Successfully!',
        `Your route has been created with ID: ${result.routeId}. You can now start receiving delivery requests.`,
        [
          {
            text: 'View Dashboard',
            onPress: () => {
              clearRouteData();
              router.push('/pages/driver/Dashboard');
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error creating route:', error);
      Alert.alert(
        'Error Creating Route',
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    } finally {
      setIsCreatingRoute(false);
    }
  };

  if (!isLocationDataComplete()) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Route Details',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
          <Text style={styles.errorText}>Route data incomplete</Text>
          <Text style={styles.errorSubtext}>Please select your route locations first.</Text>
          <PrimaryButton 
            title="Select Route" 
            onPress={() => router.push('/pages/driver/create_route/SelectLocation')}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Route Details',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.completedStep]}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
          <Text style={styles.progressLabel}>Route Selected</Text>
        </View>
        <View style={[styles.progressBar, styles.completedBar]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>2</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Details & Pricing</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>3</Text>
          </View>
          <Text style={styles.progressLabel}>Publish</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Route Summary */}
        <View style={styles.routeSummaryCard}>
          <Text style={styles.sectionTitle}>Selected Route</Text>
          <View style={styles.routeSummaryContent}>
            <Text style={styles.routeSummaryText}>
              {originLocationName || routeData.origin?.address} → {destinationLocationName || routeData.destination?.address}
            </Text>
            <Text style={styles.routeStatsText}>
              {routeData.selectedRoute?.distance.toFixed(1)} km • {Math.round(routeData.selectedRoute?.duration || 0)} min
            </Text>
          </View>
        </View>

        {/* Bidding Schedule Section */}
        <Text style={styles.sectionTitle}>Bidding Schedule</Text>
        <PrimaryCard>
          <Text style={styles.cardLabel}>When should bidding start? (Bidding ends 2 hours before departure)</Text>
          
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => setShowBiddingDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatDate(biddingStartDate)}</Text>
            </TouchableOpacity>
          </View>
          
          {showBiddingDatePicker && (
            <DateTimePicker
              value={biddingStartDate}
              mode="date"
              display="default"
              onChange={onChangeBiddingDate}
              minimumDate={new Date()}
            />
          )}
          
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => setShowBiddingTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatTime(biddingStartTime)}</Text>
            </TouchableOpacity>
          </View>
          
          {showBiddingTimePicker && (
            <DateTimePicker
              value={biddingStartTime}
              mode="time"
              display="default"
              onChange={onChangeBiddingTime}
            />
          )}
        </PrimaryCard>

        {/* Departure Time Section */}
        <Text style={styles.sectionTitle}>Departure Schedule</Text>
        <PrimaryCard>
          <Text style={styles.cardLabel}>When do you plan to depart?</Text>
          
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => setShowDepartureDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatDate(departureDate)}</Text>
            </TouchableOpacity>
          </View>
          
          {showDepartureDatePicker && (
            <DateTimePicker
              value={departureDate}
              mode="date"
              display="default"
              onChange={onChangeDepartureDate}
              minimumDate={new Date()}
            />
          )}
          
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.datePicker} onPress={() => setShowDepartureTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color="#555" />
              <Text style={styles.datePickerText}>{formatTime(departureTime)}</Text>
            </TouchableOpacity>
          </View>
          
          {showDepartureTimePicker && (
            <DateTimePicker
              value={departureTime}
              mode="time"
              display="default"
              onChange={onChangeDepartureTime}
            />
          )}
        </PrimaryCard>

        {/* Pricing Section */}
        <Text style={styles.sectionTitle}>Pricing Range</Text>
        
        {/* Price Suggestion Card */}
        <PrimaryCard>
          <View style={styles.suggestionHeader}>
            <Text style={styles.cardLabel}>💡 Smart Price Suggestion</Text>
            <TouchableOpacity 
              style={[styles.suggestionButton, (isLoadingSuggestion || !maxWeight || !maxVolume) && styles.suggestionButtonDisabled]}
              onPress={generatePriceSuggestion}
              disabled={isLoadingSuggestion || !isLocationDataComplete() || !maxWeight || !maxVolume}
            >
              <Ionicons 
                name={isLoadingSuggestion ? "refresh" : "bulb-outline"} 
                size={16} 
                color={(isLoadingSuggestion || !maxWeight || !maxVolume) ? "#ccc" : "#FF8C00"} 
                style={isLoadingSuggestion ? styles.rotatingIcon : undefined}
              />
              <Text style={[styles.suggestionButtonText, (isLoadingSuggestion || !maxWeight || !maxVolume) && styles.suggestionButtonTextDisabled]}>
                {isLoadingSuggestion ? 'Generating...' : 'Get AI Suggestion'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {(!maxWeight || !maxVolume) && (
            <View style={styles.warningContainer}>
              <Ionicons name="information-circle" size={16} color="#FF8C00" />
              <Text style={styles.warningText}>Please enter weight and volume capacity below to get accurate price suggestions.</Text>
            </View>
          )}
          
          {suggestionError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#f44336" />
              <Text style={styles.suggestionErrorText}>{suggestionError}</Text>
            </View>
          )}
          
          {priceSuggestion && (
            <View style={styles.suggestionContainer}>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>Recommended Price Range</Text>
                <Text style={styles.suggestionRange}>
                  LKR {Number(priceSuggestion.minPrice).toLocaleString()} - LKR {Number(priceSuggestion.maxPrice).toLocaleString()}
                </Text>
                <Text style={styles.suggestionDetails}>
                  Based on {routeData.selectedRoute?.distance.toFixed(1)} km distance, {priceSuggestion.features?.weight || 'N/A'}kg weight, {priceSuggestion.features?.volume || 'N/A'}m³ volume
                  {priceSuggestion.modelVersion?.includes('fallback') && ' (offline calculation)'}
                </Text>
              </View>
              <TouchableOpacity style={styles.applyButton} onPress={applySuggestion}>
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
        </PrimaryCard>
        
        <PrimaryCard>
          <Text style={styles.cardLabel}>Set your price range for deliveries (LKR)</Text>
          
          <View style={styles.priceInputContainer}>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.priceLabel}>Minimum Price</Text>
              <View style={styles.inputRow}>
                <Ionicons name="cash-outline" size={20} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="500"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <Text style={styles.currencyText}>LKR</Text>
              </View>
            </View>
            
            <View style={styles.priceInputWrapper}>
              <Text style={styles.priceLabel}>Maximum Price</Text>
              <View style={styles.inputRow}>
                <Ionicons name="cash-outline" size={20} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="2000"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
                <Text style={styles.currencyText}>LKR</Text>
              </View>
            </View>
          </View>
        </PrimaryCard>

        {/* Vehicle Capacity Section */}
        <Text style={styles.sectionTitle}>Vehicle Capacity (Optional)</Text>
        <PrimaryCard>
          <Text style={styles.cardLabel}>Available space for deliveries</Text>
          
          <View style={styles.inputRow}>
            <Ionicons name="cube-outline" size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Maximum weight (kg)"
              keyboardType="numeric"
              value={maxWeight}
              onChangeText={setMaxWeight}
            />
          </View>
          
          <View style={styles.inputRow}>
            <Ionicons name="resize-outline" size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Maximum volume (m³)"
              keyboardType="numeric"
              value={maxVolume}
              onChangeText={setMaxVolume}
            />
          </View>
        </PrimaryCard>

        {/* Detour Tolerance Section */}
        <Text style={styles.sectionTitle}>Maximum Pickup Distance</Text>
        <PrimaryCard>
          <Text style={styles.cardLabel}>Maximum pickup distance for pickups (km)</Text>
          
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="10"
              keyboardType="numeric"
              value={detourTolerance}
              onChangeText={setDetourTolerance}
            />
            <Text style={styles.currencyText}>km</Text>
          </View>
        </PrimaryCard>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton 
          onPress={() => router.back()} 
          title="Back" 
          style={styles.button}
          disabled={isCreatingRoute}
        />
        <PrimaryButton 
          onPress={handleCreateRoute} 
          title={isCreatingRoute ? "Creating Route..." : "Create Route"} 
          style={styles.button}
          disabled={isCreatingRoute}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollViewContent: {
    paddingBottom: 20, // Add padding to the bottom of the scrollable content
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeStep: {
    backgroundColor: '#FF8C00', // Orange color for active step
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: -15, // Overlap with circles
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light grey background
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 50, // Fixed height for consistency
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Remove default vertical padding
  },
  smallTextInput: {
    flex: 0,
    width: 50, // Adjusted width for better fit
    textAlign: 'center',
    marginHorizontal: 5, // Adjusted margin
    backgroundColor: 'white', // White background for individual small inputs
    borderRadius: 8,
    height: 40, // Fixed height for small inputs
    paddingHorizontal: 5,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#e0e0e0', // Background for dropdown button
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  datePickerText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  priceInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  priceLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  currencyText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    width: '80%',
  },
  routeSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  routeSummaryContent: {
    marginTop: 10,
  },
  routeSummaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  routeStatsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  completedStep: {
    backgroundColor: '#4CAF50', // Green for completed
  },
  completedBar: {
    backgroundColor: '#4CAF50',
  },
  boldLabel: {
    fontWeight: 'bold',
  },
  // Price suggestion styles
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  suggestionButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  suggestionButtonText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
    marginLeft: 4,
  },
  suggestionButtonTextDisabled: {
    color: '#ccc',
  },
  rotatingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionErrorText: {
    fontSize: 12,
    color: '#f44336',
    marginLeft: 5,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  warningText: {
    fontSize: 12,
    color: '#FF8C00',
    marginLeft: 5,
    flex: 1,
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  suggestionRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  suggestionDetails: {
    fontSize: 12,
    color: '#388E3C',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  applyButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default EnterBiddingDetails;
