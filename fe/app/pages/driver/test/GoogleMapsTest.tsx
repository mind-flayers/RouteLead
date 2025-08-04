import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import GoogleMapsTest from '../../../../components/GoogleMapsTest';

const GoogleMapsTestPage: React.FC = () => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Maps API Test</Text>
      <Text style={styles.subtitle}>
        This page tests if Google Maps API can load in WebView
      </Text>
      <GoogleMapsTest googleMapsApiKey={apiKey} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
});

export default GoogleMapsTestPage;
