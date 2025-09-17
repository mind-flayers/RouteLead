import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import { ApiService, MyRoute } from '@/services/apiService';
import { useDriverInfo } from '@/hooks/useEarningsData';

const EditRoute = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { driverId } = useDriverInfo();
  
  // Parse route data from params
  const routeData: MyRoute = JSON.parse(params.routeData as string);
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [departureTime, setDepartureTime] = useState(new Date(routeData.departureTime));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [detourTolerance, setDetourTolerance] = useState(routeData.detourToleranceKm?.toString() || '5');
  const [minPrice, setMinPrice] = useState(routeData.suggestedPriceMin?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(routeData.suggestedPriceMax?.toString() || '');
  
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDateTime = new Date(departureTime);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setDepartureTime(newDateTime);
    }
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(departureTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDepartureTime(newDateTime);
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!minPrice || !maxPrice) {
      Alert.alert('Validation Error', 'Please enter both minimum and maximum prices.');
      return;
    }

    const minPriceNum = parseFloat(minPrice);
    const maxPriceNum = parseFloat(maxPrice);
    
    if (isNaN(minPriceNum) || isNaN(maxPriceNum)) {
      Alert.alert('Validation Error', 'Please enter valid price amounts.');
      return;
    }

    if (minPriceNum >= maxPriceNum) {
      Alert.alert('Validation Error', 'Maximum price must be greater than minimum price.');
      return;
    }

    if (departureTime <= new Date()) {
      Alert.alert('Validation Error', 'Departure time must be in the future.');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate bidding start time (default to 24 hours before departure)
      const biddingStartTime = new Date(departureTime.getTime() - (24 * 60 * 60 * 1000));
      
      const updateData = {
        driverId,
        originLat: routeData.originLat,
        originLng: routeData.originLng,
        destinationLat: routeData.destinationLat,
        destinationLng: routeData.destinationLng,
        departureTime: departureTime.toISOString(),
        biddingStartTime: biddingStartTime.toISOString(),
        detourToleranceKm: parseFloat(detourTolerance) || 5.0,
        suggestedPriceMin: minPriceNum,
        suggestedPriceMax: maxPriceNum,
        routePolyline: routeData.routePolyline || '',
        totalDistanceKm: routeData.totalDistanceKm || 0,
        estimatedDurationMinutes: routeData.estimatedDurationMinutes || 0,
      };

      await ApiService.updateRoute(routeData.id, updateData);
      
      Alert.alert(
        'Success',
        'Route updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/pages/driver/MyRoutes')
          }
        ]
      );
    } catch (error) {
      console.error('Error updating route:', error);
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update route. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatLocationName = (lat: number, lng: number, name?: string) => {
    return name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Route</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Route Overview Card */}
        <PrimaryCard style={styles.card}>
          <Text style={styles.sectionTitle}>Route Overview</Text>
          
          {/* Origin */}
          <View style={styles.locationContainer}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={16} color="#4CAF50" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {formatLocationName(routeData.originLat, routeData.originLng, routeData.originLocationName)}
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View style={styles.locationContainer}>
            <View style={[styles.locationIcon, { backgroundColor: '#ffebee' }]}>
              <Ionicons name="flag" size={16} color="#f44336" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {formatLocationName(routeData.destinationLat, routeData.destinationLng, routeData.destinationLocationName)}
              </Text>
            </View>
          </View>

          {/* Route Stats */}
          {(routeData.totalDistanceKm || routeData.estimatedDurationMinutes) && (
            <View style={styles.statsContainer}>
              {routeData.totalDistanceKm && (
                <View style={styles.statItem}>
                  <Ionicons name="speedometer-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{routeData.totalDistanceKm.toFixed(1)} km</Text>
                </View>
              )}
              {routeData.estimatedDurationMinutes && (
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{Math.round(routeData.estimatedDurationMinutes)} min</Text>
                </View>
              )}
            </View>
          )}
        </PrimaryCard>

        {/* Departure Time Card */}
        <PrimaryCard style={styles.card}>
          <Text style={styles.sectionTitle}>Departure Time</Text>
          
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={styles.dateTimeButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#f97316" />
              <Text style={styles.dateTimeButtonText}>
                {departureTime.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: '2-digit', 
                  year: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateTimeButton} 
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#f97316" />
              <Text style={styles.dateTimeButtonText}>
                {departureTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={departureTime}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={departureTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </PrimaryCard>

        {/* Route Settings Card */}
        <PrimaryCard style={styles.card}>
          <Text style={styles.sectionTitle}>Route Settings</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Detour Tolerance (km)</Text>
            <TextInput
              style={styles.textInput}
              value={detourTolerance}
              onChangeText={setDetourTolerance}
              placeholder="5"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.inputHint}>Maximum detour distance allowed</Text>
          </View>
        </PrimaryCard>

        {/* Pricing Card */}
        <PrimaryCard style={styles.card}>
          <Text style={styles.sectionTitle}>Pricing Range</Text>
          
          <View style={styles.pricingContainer}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.inputLabel}>Minimum Price (LKR)</Text>
              <TextInput
                style={styles.textInput}
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="1000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.priceInputContainer}>
              <Text style={styles.inputLabel}>Maximum Price (LKR)</Text>
              <TextInput
                style={styles.textInput}
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="2000"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Text style={styles.inputHint}>
            Set your suggested price range for customers to bid within
          </Text>
        </PrimaryCard>

        {/* Current Status Card */}
        <PrimaryCard style={styles.card}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Route Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: routeData.status === 'OPEN' ? '#e3f2fd' : '#f3e5f5' }]}>
                <Text style={[styles.statusText, { color: routeData.status === 'OPEN' ? '#1976d2' : '#7b1fa2' }]}>
                  {routeData.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Total Bids</Text>
              <Text style={styles.statusValue}>{routeData.bidCount}</Text>
            </View>

            {routeData.highestBidAmount && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Highest Bid</Text>
                <Text style={styles.statusValue}>LKR {routeData.highestBidAmount.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </PrimaryCard>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton
          title="Cancel"
          onPress={() => router.back()}
          style={styles.button}
        />
        <PrimaryButton
          title={loading ? "Updating..." : "Update Route"}
          onPress={handleUpdate}
          style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  statusContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditRoute;
