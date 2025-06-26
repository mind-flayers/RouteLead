import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';

const CreateRoute = () => {
  const router = useRouter();

  const handleSelectLocation = () => {
    router.push('/pages/driver/create_route/SelectLocation');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Route',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
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
          <View style={styles.progressCircle}>
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
            Define your origin, destination locations.
          </Text>

          <TouchableOpacity style={styles.locationSelector} onPress={handleSelectLocation}>
            <Ionicons name="location-outline" size={20} color="#888" />
            <Text style={styles.locationSelectorText}>Select Origin Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationSelector} onPress={handleSelectLocation}>
            <Ionicons name="location-outline" size={20} color="#888" />
            <Text style={styles.locationSelectorText}>Select Destination Location</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton onPress={() => router.push('/pages/driver/Dashboard')} title="Go to Home" style={styles.button} />
        <PrimaryButton onPress={() => router.push('/pages/driver/create_route/EnterBiddingDetails')} title="Next" style={styles.button} />
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
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  locationSelectorText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 16,
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
});

export default CreateRoute;
