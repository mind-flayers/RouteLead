import React, { useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

interface GoogleMapsTestProps {
  googleMapsApiKey: string;
}

const GoogleMapsTest: React.FC<GoogleMapsTestProps> = ({ googleMapsApiKey }) => {
  const webViewRef = useRef<WebView>(null);

  const getTestHtml = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Maps API Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        #map { height: 200px; width: 100%; border: 1px solid #ccc; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Google Maps API Test</h1>
    <div id="status" class="status info">Testing Google Maps API...</div>
    <div>API Key: ${googleMapsApiKey ? googleMapsApiKey.substring(0, 15) + '...' : 'NOT PROVIDED'}</div>
    <div id="map"></div>
    <div id="details"></div>

    <script>
        function logMessage(message, type = 'info') {
            console.log('GoogleMapsTest:', message);
            
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = 'status ' + type;
            
            // Send message to React Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'test_log',
                    message: message,
                    level: type
                }));
            }
        }

        function testGoogleMapsAPI() {
            logMessage('Starting Google Maps API test...', 'info');
            
            // Test 1: Check if API key is provided
            if (!'${googleMapsApiKey}') {
                logMessage('ERROR: No API key provided', 'error');
                return;
            }
            
            logMessage('API key provided: ${googleMapsApiKey.substring(0, 15)}...', 'info');
            
            // Test 2: Try to load the API script
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initTestMap';
            script.async = true;
            script.defer = true;
            
            script.onerror = function(error) {
                logMessage('ERROR: Failed to load Google Maps script', 'error');
                console.error('Script load error:', error);
            };
            
            document.head.appendChild(script);
            logMessage('Google Maps script added to head', 'info');
        }

        function initTestMap() {
            logMessage('Google Maps API loaded successfully!', 'success');
            
            try {
                // Test 3: Try to create a map
                const map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: { lat: 7.8731, lng: 80.7718 } // Sri Lanka
                });
                
                logMessage('Map created successfully!', 'success');
                
                // Test 4: Try to add a marker
                const marker = new google.maps.Marker({
                    position: { lat: 7.8731, lng: 80.7718 },
                    map: map,
                    title: 'Test Marker'
                });
                
                logMessage('Marker added successfully! Google Maps is working!', 'success');
                
            } catch (error) {
                logMessage('ERROR: Failed to create map: ' + error.message, 'error');
                console.error('Map creation error:', error);
            }
        }

        // Global error handler
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            const errorMsg = 'JavaScript Error: ' + msg + ' at ' + url + ':' + lineNo;
            logMessage(errorMsg, 'error');
            console.error('Global error:', { msg, url, lineNo, columnNo, error });
        };

        // Start the test when page loads
        document.addEventListener('DOMContentLoaded', function() {
            logMessage('DOM loaded, starting test...', 'info');
            testGoogleMapsAPI();
        });
    </script>
</body>
</html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'test_log') {
        console.log(`[GoogleMapsTest] ${message.level.toUpperCase()}: ${message.message}`);
        
        if (message.level === 'error') {
          Alert.alert('Google Maps Test Error', message.message);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getTestHtml() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
          Alert.alert('WebView Error', nativeEvent.description || 'Unknown error');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error: ', nativeEvent);
          Alert.alert('HTTP Error', `${nativeEvent.statusCode}: ${nativeEvent.description || 'Unknown HTTP error'}`);
        }}
        onLoadStart={() => {
          console.log('[GoogleMapsTest] WebView started loading');
        }}
        onLoadEnd={() => {
          console.log('[GoogleMapsTest] WebView finished loading');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default GoogleMapsTest;
