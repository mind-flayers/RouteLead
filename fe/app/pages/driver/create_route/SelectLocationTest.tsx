import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GoogleMapsTest from '../../../../components/GoogleMapsTest';
import SecondaryButton from '../../../../components/ui/SecondaryButton';

const SelectLocation = () => {
  const router = useRouter();
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  console.log('Google Maps API Key available:', GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Google Maps Test",
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#007AFF" 
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            />
          ),
        }}
      />
      
      <View style={styles.container}>
        <Text style={styles.title}>Google Maps API Test</Text>
        <Text style={styles.subtitle}>
          Testing if Google Maps can load in WebView
        </Text>
        
        {GOOGLE_MAPS_API_KEY ? (
          <GoogleMapsTest googleMapsApiKey={GOOGLE_MAPS_API_KEY} />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No Google Maps API key found</Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <SecondaryButton
            title="Back to Route Creation"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 8,
  },
});

export default SelectLocation;
