import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRouteCreation } from '../../../../contexts/RouteCreationContext';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';

const CreateRoute = () => {
  const router = useRouter();
  const { routeData, clearRouteData, isLocationDataComplete } = useRouteCreation();

  const handleSelectLocation = () => {
    router.push('/pages/driver/create_route/SelectLocation');
  };

  const handleNext = () => {
    if (!isLocationDataComplete()) {
      Alert.alert(
        'Incomplete Route', 
        'Please select your origin and destination locations first.',
        [
          {
            text: 'Select Locations',
            onPress: handleSelectLocation,
          },
        ]
      );
      return;
    }
    
    router.push('/pages/driver/create_route/EnterBiddingDetails');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Route',
      'This will clear all your route data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            clearRouteData();
            Alert.alert('Route Cleared', 'All route data has been reset.');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Route',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            routeData.origin && (
              <TouchableOpacity onPress={handleReset}>
                <Ionicons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            )
          ),
        }}
      />

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>1</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Route Details</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, isLocationDataComplete() && styles.completedStep]}>
            <Text style={styles.progressText}>2</Text>
          </View>
          <Text style={styles.progressLabel}>Bidding & Capacity</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>3</Text>
          </View>
          <Text style={styles.progressLabel}>Pricing & Suggestions</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>4</Text>
          </View>
          <Text style={styles.progressLabel}>Overview</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Route Details Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <Text style={styles.sectionDescription}>
            Define your origin and destination locations using our interactive map.
          </Text>

          {/* Location Selection Button/Display */}
          {!routeData.origin ? (
            <TouchableOpacity style={styles.locationSelector} onPress={handleSelectLocation}>
              <Ionicons name="location-outline" size={20} color="#888" />
              <Text style={styles.locationSelectorText}>Select Route Locations</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedRouteContainer}>
              {/* Origin Display */}
              <View style={styles.selectedLocationContainer}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location" size={16} color="#4CAF50" />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationTypeText}>Origin</Text>
                  <Text style={styles.locationAddressText} numberOfLines={2}>
                    {routeData.origin.address}
                  </Text>
                </View>
              </View>

              {/* Destination Display */}
              {routeData.destination && (
                <View style={styles.selectedLocationContainer}>
                  <View style={[styles.locationIconContainer, { backgroundColor: '#ffebee' }]}>
                    <Ionicons name="flag" size={16} color="#f44336" />
                  </View>
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationTypeText}>Destination</Text>
                    <Text style={styles.locationAddressText} numberOfLines={2}>
                      {routeData.destination.address}
                    </Text>
                  </View>
                </View>
              )}

              {/* Route Stats */}
              {routeData.selectedRoute && (
                <View style={styles.routeStatsContainer}>
                  <View style={styles.routeStatItem}>
                    <Ionicons name="speedometer-outline" size={16} color="#2196F3" />
                    <Text style={styles.routeStatText}>
                      {routeData.selectedRoute.distance.toFixed(1)} km
                    </Text>
                  </View>
                  <View style={styles.routeStatItem}>
                    <Ionicons name="time-outline" size={16} color="#2196F3" />
                    <Text style={styles.routeStatText}>
                      {Math.round(routeData.selectedRoute.duration)} min
                    </Text>
                  </View>
                </View>
              )}

              {/* Edit Route Button */}
              <TouchableOpacity style={styles.editRouteButton} onPress={handleSelectLocation}>
                <Ionicons name="pencil" size={16} color="#2196F3" />
                <Text style={styles.editRouteButtonText}>Edit Route</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instructions Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Select your route origin and destination on the map
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Choose from multiple route options with different paths
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Set your pricing, capacity, and availability details
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Publish your route and start receiving delivery requests
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton 
          onPress={() => router.push('/pages/driver/Dashboard')} 
          title="Go to Home" 
          style={styles.button} 
        />
        <PrimaryButton 
          onPress={handleNext} 
          title={isLocationDataComplete() ? "Continue" : "Select Locations"} 
          style={styles.button}
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
    paddingBottom: 100,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#2196F3',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  boldLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationSelectorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  selectedRouteContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  locationAddressText: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  routeStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  routeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  editRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    marginTop: 8,
  },
  editRouteButtonText: {
    marginLeft: 4,
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsList: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
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
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CreateRoute;
