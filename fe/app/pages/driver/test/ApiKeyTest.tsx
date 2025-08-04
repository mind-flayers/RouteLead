import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const ApiKeyTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const testGoogleMapsAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      // Test basic Maps JavaScript API accessibility
      const testUrl = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      console.log('Testing URL:', testUrl);

      // Test Geocoding API (which we know works)
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=7.8731,80.7718&key=${API_KEY}`;
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      console.log('Geocoding API response:', data);
      
      if (data.status === 'OK') {
        setTestResult(`✅ Geocoding API works!\nStatus: ${data.status}\nResults: ${data.results.length} locations found\nAPI Key: ${API_KEY.substring(0, 10)}...`);
      } else if (data.status === 'REQUEST_DENIED') {
        setTestResult(`❌ API Key Denied!\nStatus: ${data.status}\nError: ${data.error_message || 'API key restrictions'}\nAPI Key: ${API_KEY.substring(0, 10)}...`);
      } else {
        setTestResult(`⚠️ API Response: ${data.status}\nMessage: ${data.error_message || 'Unknown error'}\nAPI Key: ${API_KEY.substring(0, 10)}...`);
      }
    } catch (error) {
      console.error('API Test Error:', error);
      setTestResult(`❌ Network Error: ${error.message}\nAPI Key: ${API_KEY.substring(0, 10)}...`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectHTTPAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing Direct HTTP...');

    try {
      // Test if the API key works with HTTP restrictions
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=7.8731,80.7718&zoom=10&size=400x400&key=${API_KEY}`;
      
      const response = await fetch(staticMapUrl, { method: 'HEAD' });
      
      console.log('Static Maps API response status:', response.status);
      console.log('Static Maps API headers:', response.headers);
      
      if (response.ok) {
        setTestResult(`✅ Static Maps API works!\nStatus: ${response.status}\nAPI Key appears valid for HTTP requests`);
      } else {
        setTestResult(`❌ Static Maps API failed!\nStatus: ${response.status}\nThis might indicate API key restrictions`);
      }
    } catch (error) {
      console.error('Direct HTTP Test Error:', error);
      setTestResult(`❌ HTTP Test Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showAPIKeyInfo = () => {
    Alert.alert(
      'API Key Information',
      `API Key: ${API_KEY ? `${API_KEY.substring(0, 15)}...` : 'NOT FOUND'}\n\nLength: ${API_KEY.length} characters\n\nCommon issues:\n1. API key restrictions (HTTP referrers)\n2. Missing APIs enabled in Google Cloud Console\n3. Billing not enabled\n4. Domain restrictions`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Maps API Key Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testGoogleMapsAPI} disabled={isLoading}>
        <Text style={styles.buttonText}>Test Geocoding API</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testDirectHTTPAPI} disabled={isLoading}>
        <Text style={styles.buttonText}>Test Static Maps API</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoButton} onPress={showAPIKeyInfo}>
        <Text style={styles.buttonText}>Show API Key Info</Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Test Result:</Text>
        <Text style={styles.resultText}>{testResult}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Common Solutions:</Text>
        <Text style={styles.infoText}>
          1. Check Google Cloud Console{'\n'}
          2. Enable Maps JavaScript API{'\n'}
          3. Remove HTTP referrer restrictions{'\n'}
          4. Enable billing if required{'\n'}
          5. Check API quota limits
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  infoButton: {
    backgroundColor: '#ff9800',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ApiKeyTest;
