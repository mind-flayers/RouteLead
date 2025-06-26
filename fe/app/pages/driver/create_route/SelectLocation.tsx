import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../../../components/ui/PrimaryButton';

const SelectLocation = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Select Location',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#888"
        />
      </View>

      {/* Placeholder for Map */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map goes here</Text>
      </View>

      {/* Current Location Card */}
      <View style={styles.currentLocationCard}>
        <Text style={styles.currentLocationTitle}>Current Location</Text>
        <View style={styles.locationDetail}>
          <Ionicons name="radio-button-on" size={20} color="#FF8C00" />
          <Text style={styles.locationAddress}>Raden Patah Road 1, Kandangwetan, Nganjuk City</Text>
          <Ionicons name="radio-button-off" size={20} color="#FF8C00" style={styles.radioIcon} />
        </View>
      </View>

      {/* Select Location Button */}
      <PrimaryButton onPress={() => router.push('/pages/driver/create_route/CreateRoute')} title="Select Location" style={styles.selectLocationButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mapText: {
    fontSize: 20,
    color: '#666',
  },
  currentLocationCard: {
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
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5e6', // Light orange background
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  locationAddress: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  radioIcon: {
    marginLeft: 10,
  },
  selectLocationButton: {
    marginTop: 'auto', // Pushes button to the bottom
  },
});

export default SelectLocation;
