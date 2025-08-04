import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRouteCreation } from '../../../../contexts/RouteCreationContext';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';

const SelectRoute = () => {
  const router = useRouter();
  const { routeData, isLocationDataComplete } = useRouteCreation();

  // Check if we have the required location data
  React.useEffect(() => {
    if (!isLocationDataComplete()) {
      Alert.alert(
        'Missing Location Data',
        'Please select origin and destination locations first.',
        [
          {
            text: 'Go Back',
            onPress: () => router.push('/pages/driver/create_route/SelectLocation'),
          },
        ]
      );
    }
  }, []);

  const handleNext = () => {
    router.push('/pages/driver/create_route/EnterBiddingDetails');
  };

  const handleEditRoute = () => {
    router.push('/pages/driver/create_route/SelectLocation');
  };

  if (!isLocationDataComplete()) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Route Summary',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centeredContainer}>
          <Ionicons name="location-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No route data available</Text>
          <PrimaryButton 
            title="Select Locations" 
            onPress={() => router.push('/pages/driver/create_route/SelectLocation')}
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
          title: 'Route Summary',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Route Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="map-outline" size={24} color="#2196F3" />
            <Text style={styles.cardTitle}>Selected Route</Text>
          </View>
          
          {/* Origin */}
          <View style={styles.locationContainer}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={20} color="#4CAF50" />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Origin</Text>
              <Text style={styles.locationAddress}>{routeData.origin?.address}</Text>
              <Text style={styles.locationCoords}>
                {routeData.origin?.lat.toFixed(6)}, {routeData.origin?.lng.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Route Line */}
          <View style={styles.routeLine}>
            <View style={styles.routeDots} />
            <View style={styles.routeStats}>
              <Text style={styles.routeStatsText}>
                {routeData.selectedRoute?.distance.toFixed(1)} km
              </Text>
              <Text style={styles.routeStatsText}>
                ~{Math.round(routeData.selectedRoute?.duration || 0)} min
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View style={styles.locationContainer}>
            <View style={styles.locationIcon}>
              <Ionicons name="flag" size={20} color="#f44336" />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={styles.locationAddress}>{routeData.destination?.address}</Text>
              <Text style={styles.locationCoords}>
                {routeData.destination?.lat.toFixed(6)}, {routeData.destination?.lng.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Edit Route Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditRoute}>
            <Ionicons name="pencil" size={16} color="#2196F3" />
            <Text style={styles.editButtonText}>Edit Route</Text>
          </TouchableOpacity>
        </View>

        {/* Route Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#FF9800" />
            <Text style={styles.cardTitle}>Route Details</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Distance:</Text>
            <Text style={styles.detailValue}>
              {routeData.selectedRoute?.distance.toFixed(2)} km
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Duration:</Text>
            <Text style={styles.detailValue}>
              {Math.round(routeData.selectedRoute?.duration || 0)} minutes
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Route Type:</Text>
            <Text style={styles.detailValue}>Optimized Path</Text>
          </View>
        </View>

        {/* Next Steps Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Next Steps</Text>
          </View>
          
          <Text style={styles.nextStepsText}>
            Your route has been selected successfully. Next, you'll need to:
          </Text>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.stepText}>Set departure time and schedule</Text>
            </View>
            <View style={styles.stepItem}>
              <Ionicons name="cash-outline" size={16} color="#666" />
              <Text style={styles.stepText}>Configure pricing and capacity</Text>
            </View>
            <View style={styles.stepItem}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.stepText}>Review and publish your route</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton 
          onPress={() => router.back()} 
          title="Back" 
          style={styles.button} 
        />
        <PrimaryButton 
          onPress={handleNext} 
          title="Continue" 
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
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: '#444',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#888',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingLeft: 16,
  },
  routeDots: {
    width: 2,
    height: 40,
    backgroundColor: '#ddd',
    marginRight: 16,
  },
  routeStats: {
    flex: 1,
  },
  routeStatsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    marginTop: 12,
  },
  editButtonText: {
    marginLeft: 4,
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nextStepsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  stepsList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
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

export default SelectRoute;