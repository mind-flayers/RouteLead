import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';

const PostRoute = () => {
  const router = useRouter();

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
            <Text style={styles.detailText}>From:</Text> <Text style={styles.detailValue}>Puttalam, Madurankuliya</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.detailText}>To:</Text> <Text style={styles.detailValue}>Badulla, UWU</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bidding & Capacity Summary</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#555" />
            <Text style={styles.detailText}>Bidding Period</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, styles.indent]}>Start Date</Text>
            <Text style={styles.detailValue}>2025-07-20</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, styles.indent]}>Start Time</Text>
            <Text style={styles.detailValue}>09:00 AM</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, styles.indent]}>End Date</Text>
            <Text style={styles.detailValue}>2025-07-22</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, styles.indent]}>End Time</Text>
            <Text style={styles.detailValue}>05:00 PM</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={18} color="#555" />
            <Text style={styles.detailText}>Remaining Space in the Vehicle</Text>
            
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, styles.indent]}>Space</Text>
            <Text style={styles.detailValue}>35cm</Text><Text>*</Text><Text style={styles.detailValue}>35cm</Text><Text>*</Text><Text style={styles.detailValue}>35cm</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="compass-outline" size={18} color="#555" />
            <Text style={styles.detailText}>Pickup Radius</Text>
            <Text style={styles.detailValue}>25</Text><Text style={styles.detailValue}>km</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pricing Overview</Text>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={18} color="#555" />
            <Text style={styles.detailText}>Base Price</Text>
            <Text style={styles.detailValue}>LKR 120.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <SecondaryButton onPress={() => router.push('/pages/driver/create_route/EnterPricing')} title="Back" style={styles.button} />
        <PrimaryButton onPress={() => router.push('/pages/driver/MyRoutes')} title="Post Route" style={styles.button} />
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
});

export default PostRoute;
