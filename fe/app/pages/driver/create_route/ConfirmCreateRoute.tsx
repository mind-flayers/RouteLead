import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';
import { useRouteCreation } from '../../../../contexts/RouteCreationContext';
import { createRoute, CreateRouteRequest, RouteSegmentRequest } from '../../../../services/routeService';

const ConfirmCreateRoute = () => {
  const router = useRouter();
  const { routeData, getCreateRoutePayload, clearRouteData } = useRouteCreation();
  const [isCreating, setIsCreating] = useState(false);

  // Mock driver ID - in real app, get from auth context
  const MOCK_DRIVER_ID = '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27';

  const handleCreateRoute = async () => {
    try {
      setIsCreating(true);

      // Get payload from context
      const payload = getCreateRoutePayload(MOCK_DRIVER_ID);
      
      // Convert segments to the format expected by backend
      const segments: RouteSegmentRequest[] = payload.segments?.map((segment, index) => ({
        segmentIndex: segment.segment_index,
        startLat: segment.start_lat,
        startLng: segment.start_lng,
        endLat: segment.end_lat,
        endLng: segment.end_lng,
        distanceKm: segment.distance_km,
        locationName: segment.location_name,
      })) || [];

      // Prepare create route request
      const createRouteRequest: CreateRouteRequest = {
        driverId: payload.driverId,
        originLat: payload.originLat,
        originLng: payload.originLng,
        destinationLat: payload.destinationLat,
        destinationLng: payload.destinationLng,
        departureTime: payload.departureTime,
        biddingStartTime: payload.biddingStartTime,
        detourToleranceKm: payload.detourToleranceKm,
        suggestedPriceMin: payload.suggestedPriceMin,
        suggestedPriceMax: payload.suggestedPriceMax,
        routePolyline: payload.routePolyline,
        totalDistanceKm: payload.totalDistanceKm,
        estimatedDurationMinutes: payload.estimatedDurationMinutes,
        segments: segments,
      };

      console.log('Creating route with request:', createRouteRequest);

      // Call API to create route
      const response = await createRoute(createRouteRequest);

      // Show success message
      Alert.alert(
        'Route Created Successfully!',
        `Your route has been created with ID: ${response.routeId}\n\nSegments created: ${response.segmentsCount}\n\nYour route is now open for bidding.`,
        [
          {
            text: 'View My Routes',
            onPress: () => {
              clearRouteData(); // Clear the context
              router.push('/pages/driver/MyRoutes');
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error creating route:', error);
      Alert.alert(
        'Error Creating Route',
        error instanceof Error ? error.message : 'An unexpected error occurred while creating your route. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>2</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Bidding & Capacity</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>3</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Pricing & Suggestions</Text>
        </View>
        <View style={styles.progressBar} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, styles.activeStep]}>
            <Text style={styles.progressText}>4</Text>
          </View>
          <Text style={[styles.progressLabel, styles.boldLabel]}>Post Route</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Content for Post Route (Overview) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.detailText}>From:</Text> 
            <Text style={styles.detailValue}>{routeData.origin?.address || 'Not selected'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.detailText}>To:</Text> 
            <Text style={styles.detailValue}>{routeData.destination?.address || 'Not selected'}</Text>
          </View>
          {routeData.selectedRoute && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="map-outline" size={18} color="#555" />
                <Text style={styles.detailText}>Distance:</Text>
                <Text style={styles.detailValue}>{routeData.selectedRoute.distance.toFixed(1)} km</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color="#555" />
                <Text style={styles.detailText}>Estimated Time:</Text>
                <Text style={styles.detailValue}>{Math.round(routeData.selectedRoute.duration)} minutes</Text>
              </View>
              {routeData.selectedRoute.segments && (
                <View style={styles.detailRow}>
                  <Ionicons name="trail-sign-outline" size={18} color="#555" />
                  <Text style={styles.detailText}>Route Segments:</Text>
                  <Text style={styles.detailValue}>{routeData.selectedRoute.segments.length} segments</Text>
                </View>
              )}
            </>
          )}
        </View>

        {routeData.selectedRoute?.segments && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Route Segments</Text>
            <Text style={styles.detailSubtext}>Your route passes through these areas:</Text>
            {routeData.selectedRoute.segments.slice(0, 5).map((segment, index) => (
              <View key={index} style={styles.segmentRow}>
                <View style={styles.segmentIndex}>
                  <Text style={styles.segmentNumber}>{index + 1}</Text>
                </View>
                <View style={styles.segmentInfo}>
                  <Text style={styles.segmentTown}>{segment.location_name}</Text>
                  <Text style={styles.segmentDistance}>{segment.distance_km.toFixed(1)} km</Text>
                </View>
              </View>
            ))}
            {routeData.selectedRoute.segments.length > 5 && (
              <Text style={styles.moreSegments}>
                ... and {routeData.selectedRoute.segments.length - 5} more segments
              </Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Departure & Bidding Schedule</Text>
          {routeData.departureTime && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color="#555" />
                <Text style={styles.detailText}>Departure Date:</Text>
                <Text style={styles.detailValue}>{formatDate(routeData.departureTime)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color="#555" />
                <Text style={styles.detailText}>Departure Time:</Text>
                <Text style={styles.detailValue}>{formatTime(routeData.departureTime)}</Text>
              </View>
            </>
          )}
          {routeData.biddingStartTime && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color="#555" />
                <Text style={styles.detailText}>Bidding Start:</Text>
                <Text style={styles.detailValue}>{formatDate(routeData.biddingStartTime)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color="#555" />
                <Text style={styles.detailText}>Bidding Time:</Text>
                <Text style={styles.detailValue}>{formatTime(routeData.biddingStartTime)}</Text>
              </View>
            </>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="compass-outline" size={18} color="#555" />
            <Text style={styles.detailText}>Pickup Radius:</Text>
            <Text style={styles.detailValue}>{routeData.detourToleranceKm || 5} km</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pricing Overview</Text>
          {routeData.suggestedPriceMin !== undefined && routeData.suggestedPriceMax !== undefined && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={18} color="#555" />
              <Text style={styles.detailText}>Price Range:</Text>
              <Text style={styles.detailValue}>
                LKR {routeData.suggestedPriceMin.toFixed(2)} - {routeData.suggestedPriceMax.toFixed(2)}
              </Text>
            </View>
          )}
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
          onPress={handleCreateRoute} 
          title={isCreating ? "Creating..." : "Post Route"} 
          style={styles.button}
          disabled={isCreating}
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
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  indent: {
    marginLeft: 38, // To align with the text next to the icon
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f8f8f8', // Match container background
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  boldLabel: {
    fontWeight: 'bold',
  },
  detailSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  segmentIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  segmentInfo: {
    flex: 1,
  },
  segmentTown: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  segmentDistance: {
    fontSize: 14,
    color: '#666',
  },
  moreSegments: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ConfirmCreateRoute;
