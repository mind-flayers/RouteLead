import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface RouteData {
  polyline: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  encoded_polyline: string;
}

export interface RouteSelectionData {
  origin: LocationData;
  destination: LocationData;
  route: RouteData;
}

interface MapLocationSelectorProps {
  onOriginSelected?: (location: LocationData) => void;
  onDestinationSelected?: (location: LocationData) => void;
  onRouteSelected?: (route: RouteData) => void;
  onRouteConfirmed?: (data: RouteSelectionData) => void;
  onError?: (error: string) => void;
  googleMapsApiKey: string;
}

const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({
  onOriginSelected,
  onDestinationSelected,
  onRouteSelected,
  onRouteConfirmed,
  onError,
  googleMapsApiKey
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Debug: Log API key status
  console.log('MapLocationSelector - API Key received:', googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'EMPTY');

  // Get the HTML content with the API key injected
  const getHtmlContent = () => {
    const { width, height } = Dimensions.get('window');
    
    // Read the HTML file content and replace the API key placeholder
    // For now, we'll inline the HTML content with the API key
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Route Selection Map</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: Arial, sans-serif;
        }
        #map {
            height: 70%;
            width: 100%;
        }
        #controls {
            height: 30%;
            padding: 10px;
            box-sizing: border-box;
            background: #f5f5f5;
            overflow-y: auto;
        }
        .search-container {
            margin-bottom: 10px;
        }
        .search-container input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        .location-display {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .route-option {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            border: 1px solid #ddd;
            cursor: pointer;
        }
        .route-option:hover {
            background: #e3f2fd;
        }
        .route-option.selected {
            background: #2196f3;
            color: white;
        }
        .btn {
            background: #2196f3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            font-size: 16px;
        }
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .status {
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="controls">
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Search for a location...">
        </div>
        
        <div class="status" id="status">Click on the map to select origin location</div>
        
        <div id="originDisplay" class="location-display" style="display: none;">
            <strong>Origin:</strong> <span id="originText"></span>
        </div>
        
        <div id="destinationDisplay" class="location-display" style="display: none;">
            <strong>Destination:</strong> <span id="destinationText"></span>
        </div>
        
        <div id="routeOptions" style="display: none;">
            <h3>Select Route:</h3>
            <div id="routesList"></div>
        </div>
        
        <button class="btn" id="confirmBtn" onclick="confirmSelection()" disabled>
            Confirm Selection
        </button>
        <button class="btn" id="resetBtn" onclick="resetSelection()">
            Reset
        </button>
    </div>

    <script>
        console.log('[MapLocationSelector] HTML Script starting...');
        console.log('[MapLocationSelector] Document ready state:', document.readyState);
        console.log('[MapLocationSelector] Window object available:', typeof window !== 'undefined');
        console.log('[MapLocationSelector] ReactNativeWebView available:', typeof window.ReactNativeWebView !== 'undefined');
        
        let map;
        let directionsService;
        let directionsRenderer;
        let originMarker = null;
        let destinationMarker = null;
        let currentStep = 'origin';
        let selectedOrigin = null;
        let selectedDestination = null;
        let routeOptions = [];
        let selectedRoute = null;

        // Debug: Check API key
        console.log('API Key in HTML:', '${googleMapsApiKey ? googleMapsApiKey.substring(0, 10) + "..." : "EMPTY"}');

        // Function to send messages to React Native
        function sendMessage(message) {
            console.log('[MapLocationSelector] Sending message:', message);
            try {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(message));
                } else {
                    console.error('[MapLocationSelector] ReactNativeWebView.postMessage not available');
                }
            } catch (error) {
                console.error('[MapLocationSelector] Error sending message:', error);
            }
        }

        // Global error handler for Google Maps
        window.gm_authFailure = function() {
            console.error('[MapLocationSelector] Google Maps API authentication failed');
            sendMessage({ 
                type: 'error', 
                data: { message: 'Google Maps API authentication failed. Please check your API key.' } 
            });
        };

        // Catch any global errors
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('[MapLocationSelector] Global error:', msg, 'at', url, lineNo + ':' + columnNo);
            sendMessage({ 
                type: 'error', 
                data: { message: 'JavaScript error: ' + msg } 
            });
            return false;
        };

        // Add event listener for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[MapLocationSelector] DOM Content Loaded');
        });
        
        // Add event listener for window load
        window.addEventListener('load', function() {
            console.log('[MapLocationSelector] Window loaded');
        });

        // Check if Google is already available
        if (typeof google !== 'undefined') {
            console.log('[MapLocationSelector] Google API already available');
        } else {
            console.log('[MapLocationSelector] Google API not yet available, waiting for script load...');
        }

        function initMap() {
            console.log('[MapLocationSelector] initMap called!');
            console.log('[MapLocationSelector] Google Maps API available:', typeof google !== 'undefined');
            console.log('[MapLocationSelector] Google Maps object:', google);
            console.log('[MapLocationSelector] Document getElementById map:', document.getElementById('map'));
            
            try {
                // Check if Google Maps API is loaded
                if (typeof google === 'undefined') {
                    throw new Error('Google Maps API not loaded');
                }
                
                if (typeof google.maps === 'undefined') {
                    throw new Error('Google Maps object not available');
                }

                const sriLanka = { lat: 7.8731, lng: 80.7718 };
                
                console.log('[MapLocationSelector] Creating map...');
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: sriLanka,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                });

                console.log('[MapLocationSelector] Map created successfully:', map);
                console.log('[MapLocationSelector] Setting up services...');
                directionsService = new google.maps.DirectionsService();
                directionsRenderer = new google.maps.DirectionsRenderer({
                    draggable: false,
                    panel: null
                });
                directionsRenderer.setMap(map);

                console.log('[MapLocationSelector] Setting up autocomplete...');
                const searchInput = document.getElementById('searchInput');
                const autocomplete = new google.maps.places.Autocomplete(searchInput, {
                    componentRestrictions: { country: 'lk' },
                    fields: ['geometry', 'formatted_address']
                });

                autocomplete.addListener('place_changed', function() {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        map.setCenter(place.geometry.location);
                        map.setZoom(15);
                    }
                });

                console.log('[MapLocationSelector] Setting up map click listener...');
                map.addListener('click', function(event) {
                    handleMapClick(event.latLng);
                });

                console.log('[MapLocationSelector] Map initialized successfully!');
                sendMessage({ type: 'map_ready' });
            } catch (error) {
                console.error('Error initializing map:', error);
                console.error('Error stack:', error.stack);
                sendMessage({ 
                    type: 'error', 
                    data: { message: 'Error initializing map: ' + error.message + '\nStack: ' + (error.stack || 'No stack trace') } 
                });
            }
        }

        function handleMapClick(latLng) {
            const location = {
                lat: latLng.lat(),
                lng: latLng.lng()
            };

            if (currentStep === 'origin') {
                setOrigin(location);
            } else if (currentStep === 'destination') {
                setDestination(location);
            }
        }

        function setOrigin(location) {
            selectedOrigin = location;
            
            if (originMarker) {
                originMarker.setMap(null);
            }
            
            originMarker = new google.maps.Marker({
                position: location,
                map: map,
                title: 'Origin',
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                }
            });

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: location }, function(results, status) {
                if (status === 'OK' && results[0]) {
                    const address = results[0].formatted_address;
                    document.getElementById('originText').textContent = address;
                    document.getElementById('originDisplay').style.display = 'block';
                    
                    currentStep = 'destination';
                    document.getElementById('status').textContent = 'Now click to select destination location';
                    
                    sendMessage({
                        type: 'origin_selected',
                        data: {
                            lat: location.lat,
                            lng: location.lng,
                            address: address
                        }
                    });
                }
            });
        }

        function setDestination(location) {
            selectedDestination = location;
            
            if (destinationMarker) {
                destinationMarker.setMap(null);
            }
            
            destinationMarker = new google.maps.Marker({
                position: location,
                map: map,
                title: 'Destination',
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }
            });

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: location }, function(results, status) {
                if (status === 'OK' && results[0]) {
                    const address = results[0].formatted_address;
                    document.getElementById('destinationText').textContent = address;
                    document.getElementById('destinationDisplay').style.display = 'block';
                    
                    sendMessage({
                        type: 'destination_selected',
                        data: {
                            lat: location.lat,
                            lng: location.lng,
                            address: address
                        }
                    });
                    
                    getRouteOptions();
                }
            });
        }

        function getRouteOptions() {
            if (!selectedOrigin || !selectedDestination) return;

            document.getElementById('status').textContent = 'Loading route options...';

            const request = {
                origin: selectedOrigin,
                destination: selectedDestination,
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
                region: 'lk'
            };

            directionsService.route(request, function(result, status) {
                if (status === 'OK') {
                    routeOptions = result.routes;
                    displayRouteOptions();
                    currentStep = 'route';
                    document.getElementById('status').textContent = 'Select your preferred route:';
                } else {
                    document.getElementById('status').textContent = 'Could not calculate routes. Please try different locations.';
                    sendMessage({
                        type: 'error',
                        data: { message: 'Could not calculate routes: ' + status }
                    });
                }
            });
        }

        function displayRouteOptions() {
            const routesList = document.getElementById('routesList');
            routesList.innerHTML = '';

            routeOptions.forEach((route, index) => {
                const leg = route.legs[0];
                const distance = leg.distance.text;
                const duration = leg.duration.text;
                
                const routeDiv = document.createElement('div');
                routeDiv.className = 'route-option';
                routeDiv.innerHTML = \`
                    <strong>Route \${index + 1}</strong><br>
                    Distance: \${distance}<br>
                    Duration: \${duration}
                \`;
                routeDiv.onclick = () => selectRoute(index);
                routesList.appendChild(routeDiv);
            });

            document.getElementById('routeOptions').style.display = 'block';
            
            if (routeOptions.length > 0) {
                selectRoute(0);
            }
        }

        function selectRoute(index) {
            selectedRoute = routeOptions[index];
            
            document.querySelectorAll('.route-option').forEach((div, i) => {
                div.classList.toggle('selected', i === index);
            });

            directionsRenderer.setDirections({
                routes: [selectedRoute],
                request: {
                    origin: selectedOrigin,
                    destination: selectedDestination,
                    travelMode: google.maps.TravelMode.DRIVING
                }
            });

            document.getElementById('confirmBtn').disabled = false;

            const leg = selectedRoute.legs[0];
            sendMessage({
                type: 'route_selected',
                data: {
                    polyline: selectedRoute.overview_polyline,
                    distance: leg.distance.value / 1000,
                    duration: leg.duration.value / 60,
                    encoded_polyline: selectedRoute.overview_polyline,
                    routeIndex: index
                }
            });
        }

        function confirmSelection() {
            if (selectedRoute && selectedOrigin && selectedDestination) {
                const leg = selectedRoute.legs[0];
                
                sendMessage({
                    type: 'route_confirmed',
                    data: {
                        origin: {
                            lat: selectedOrigin.lat,
                            lng: selectedOrigin.lng,
                            address: document.getElementById('originText').textContent
                        },
                        destination: {
                            lat: selectedDestination.lat,
                            lng: selectedDestination.lng,
                            address: document.getElementById('destinationText').textContent
                        },
                        route: {
                            polyline: selectedRoute.overview_polyline,
                            distance: leg.distance.value / 1000,
                            duration: leg.duration.value / 60,
                            encoded_polyline: selectedRoute.overview_polyline
                        }
                    }
                });
            }
        }

        function resetSelection() {
            if (originMarker) {
                originMarker.setMap(null);
                originMarker = null;
            }
            if (destinationMarker) {
                destinationMarker.setMap(null);
                destinationMarker = null;
            }

            directionsRenderer.setDirections({routes: []});

            selectedOrigin = null;
            selectedDestination = null;
            selectedRoute = null;
            routeOptions = [];
            currentStep = 'origin';

            document.getElementById('originDisplay').style.display = 'none';
            document.getElementById('destinationDisplay').style.display = 'none';
            document.getElementById('routeOptions').style.display = 'none';
            document.getElementById('confirmBtn').disabled = true;
            document.getElementById('status').textContent = 'Click on the map to select origin location';

            sendMessage({ type: 'selection_reset' });
        }

        window.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'reset':
                    resetSelection();
                    break;
                case 'set_center':
                    if (message.data && message.data.lat && message.data.lng) {
                        map.setCenter({ lat: message.data.lat, lng: message.data.lng });
                        map.setZoom(message.data.zoom || 15);
                    }
                    break;
            }
        });

        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('JavaScript Error:', { msg, url, lineNo, columnNo, error });
            sendMessage({
                type: 'error',
                data: {
                    message: msg,
                    url: url,
                    line: lineNo,
                    column: columnNo,
                    error: error ? error.toString() : null
                }
            });
        };

        // Debug: Check if Google Maps API is loaded
        window.addEventListener('load', function() {
            console.log('Window loaded');
            console.log('Google Maps API available:', typeof google !== 'undefined');
            if (typeof google === 'undefined') {
                sendMessage({
                    type: 'error',
                    data: { message: 'Google Maps API failed to load' }
                });
            }
        });

        // Fallback if initMap is not called within 10 seconds
        setTimeout(function() {
            if (!map) {
                console.error('Map initialization timeout');
                sendMessage({
                    type: 'error',
                    data: { message: 'Map initialization timeout - Google Maps API may not have loaded' }
                });
            }
        }, 10000);
    </script>
    
    <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initMap"
        onload="console.log('[MapLocationSelector] Google Maps script loaded successfully');"
        onerror="console.error('[MapLocationSelector] Failed to load Google Maps API script - Network error or invalid API key'); sendMessage({ type: 'error', data: { message: 'Failed to load Google Maps API script. Check network connection and API key validity.' } });">
    </script>
    
    <script>
        // Fallback timeout in case the API script loads but callback doesn't fire
        setTimeout(function() {
            if (typeof google === 'undefined') {
                console.error('Google Maps API failed to load within timeout period');
                sendMessage({ 
                    type: 'error', 
                    data: { message: 'Google Maps API failed to load. This could be due to:\n1. Network connectivity issues\n2. Invalid API key\n3. API key restrictions (referrer/domain limitations)\n4. Quota exceeded' } 
                });
            }
        }, 15000); // 15 second timeout
    </script>
</body>
</html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'map_ready':
          setIsMapReady(true);
          break;
          
        case 'origin_selected':
          if (onOriginSelected) {
            onOriginSelected(message.data);
          }
          break;
          
        case 'destination_selected':
          if (onDestinationSelected) {
            onDestinationSelected(message.data);
          }
          break;
          
        case 'route_selected':
          if (onRouteSelected) {
            onRouteSelected(message.data);
          }
          break;
          
        case 'route_confirmed':
          if (onRouteConfirmed) {
            onRouteConfirmed(message.data);
          }
          break;
          
        case 'error':
          if (onError) {
            onError(message.data.message || 'Unknown error occurred');
          } else {
            Alert.alert('Map Error', message.data.message || 'Unknown error occurred');
          }
          break;
          
        default:
          console.log('Unhandled message from WebView:', message);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      if (onError) {
        onError('Error parsing map message');
      }
    }
  };

  const sendMessageToWebView = (message: any) => {
    if (webViewRef.current && isMapReady) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  const resetMap = () => {
    sendMessageToWebView({ type: 'reset' });
  };

  const setCenterLocation = (lat: number, lng: number, zoom: number = 15) => {
    sendMessageToWebView({
      type: 'set_center',
      data: { lat, lng, zoom }
    });
  };

  // Expose methods for parent components - removed for now due to TypeScript issues
  // React.useImperativeHandle(React.forwardRef<any, any>(() => null).ref, () => ({
  //   resetMap,
  //   setCenterLocation
  // }));

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getHtmlContent() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
          if (onError) {
            onError(`WebView error: ${nativeEvent.description || 'Unknown error'}`);
          }
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error: ', nativeEvent);
          if (onError) {
            onError(`HTTP error: ${nativeEvent.statusCode} - ${nativeEvent.description || 'Unknown HTTP error'}`);
          }
        }}
        onLoadStart={() => {
          console.log('WebView started loading');
        }}
        onLoadEnd={() => {
          console.log('WebView finished loading');
        }}
        onLoadProgress={({ nativeEvent }) => {
          console.log('WebView load progress:', nativeEvent.progress);
        }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
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

export default MapLocationSelector;
