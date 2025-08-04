import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface RouteData {
  distance: number;
  duration: number;
  overview_path?: any;
  encoded_polyline?: string;
}

interface SimpleMapLocationSelectorProps {
  onOriginSelected?: (location: LocationData) => void;
  onDestinationSelected?: (location: LocationData) => void;
  onRouteSelected?: (route: RouteData) => void;
  onError?: (error: string) => void;
  googleMapsApiKey: string;
}

const SimpleMapLocationSelector: React.FC<SimpleMapLocationSelectorProps> = ({
  onOriginSelected,
  onDestinationSelected,
  onRouteSelected,
  onError,
  googleMapsApiKey
}) => {
  const webViewRef = useRef<WebView>(null);

  console.log('SimpleMapLocationSelector - API Key received:', googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'EMPTY');

  const getHtmlContent = () => {
    console.log('SimpleMapLocationSelector - Generating HTML content...');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Map Selector</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: Arial, sans-serif;
        }
        #map {
            height: 100%;
            width: 100%;
        }
        .controls {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        .controls input {
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 3px;
            box-sizing: border-box;
        }
        .status {
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="controls">
        <input type="text" id="searchInput" placeholder="Search for a location...">
    </div>
    
    <div id="map"></div>
    
    <div class="status" id="status">
        Loading Google Maps...
    </div>

    <script>
        console.log('[SimpleMap] Script starting...');
        console.log('[SimpleMap] API Key:', '${googleMapsApiKey ? googleMapsApiKey.substring(0, 15) + "..." : "NOT PROVIDED"}');
        
        let map;
        let directionsService;
        let directionsRenderer;
        let originMarker = null;
        let destinationMarker = null;
        let currentStep = 'origin';
        let selectedOrigin = null;
        let selectedDestination = null;

        function sendMessage(message) {
            console.log('[SimpleMap] Sending message:', message);
            try {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(message));
                } else {
                    console.log('[SimpleMap] ReactNativeWebView not available');
                }
            } catch (error) {
                console.error('[SimpleMap] Error sending message:', error);
            }
        }

        function updateStatus(text) {
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = text;
            }
            console.log('[SimpleMap] Status:', text);
        }

        function initMap() {
            console.log('[SimpleMap] initMap called!');
            
            try {
                if (typeof google === 'undefined') {
                    throw new Error('Google Maps API not loaded');
                }

                const sriLanka = { lat: 7.8731, lng: 80.7718 };
                
                console.log('[SimpleMap] Creating map...');
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: sriLanka,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                });

                console.log('[SimpleMap] Map created successfully!');
                
                // Set up directions
                directionsService = new google.maps.DirectionsService();
                directionsRenderer = new google.maps.DirectionsRenderer({
                    draggable: false,
                    panel: null
                });
                directionsRenderer.setMap(map);

                // Set up map click handler
                map.addListener('click', function(event) {
                    handleMapClick(event.latLng);
                });

                // Set up search autocomplete
                const searchInput = document.getElementById('searchInput');
                if (searchInput && google.maps.places) {
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
                }

                console.log('[SimpleMap] Map setup complete!');
                sendMessage({ type: 'map_ready' });
                updateStatus('Map ready - Click to select origin location');
                
            } catch (error) {
                console.error('[SimpleMap] Error initializing map:', error);
                sendMessage({ 
                    type: 'error', 
                    data: { message: 'Failed to initialize map: ' + error.message } 
                });
                updateStatus('Error: Failed to load map');
            }
        }

        function handleMapClick(latLng) {
            console.log('[SimpleMap] Map clicked:', latLng.lat(), latLng.lng());
            
            if (currentStep === 'origin') {
                setOrigin(latLng);
            } else if (currentStep === 'destination') {
                setDestination(latLng);
            }
        }

        function setOrigin(latLng) {
            console.log('[SimpleMap] Setting origin:', latLng.lat(), latLng.lng());
            
            // Remove existing origin marker
            if (originMarker) {
                originMarker.setMap(null);
            }
            
            // Create new origin marker
            originMarker = new google.maps.Marker({
                position: latLng,
                map: map,
                title: 'Origin'
            });
            
            selectedOrigin = {
                lat: latLng.lat(),
                lng: latLng.lng(),
                address: latLng.lat().toFixed(6) + ', ' + latLng.lng().toFixed(6)
            };
            
            currentStep = 'destination';
            updateStatus('Origin selected - Click to select destination');
            
            sendMessage({
                type: 'origin_selected',
                data: selectedOrigin
            });
        }

        function setDestination(latLng) {
            console.log('[SimpleMap] Setting destination:', latLng.lat(), latLng.lng());
            
            // Remove existing destination marker
            if (destinationMarker) {
                destinationMarker.setMap(null);
            }
            
            // Create new destination marker
            destinationMarker = new google.maps.Marker({
                position: latLng,
                map: map,
                title: 'Destination'
            });
            
            selectedDestination = {
                lat: latLng.lat(),
                lng: latLng.lng(),
                address: latLng.lat().toFixed(6) + ', ' + latLng.lng().toFixed(6)
            };
            
            updateStatus('Destination selected - Calculating route...');
            
            sendMessage({
                type: 'destination_selected',
                data: selectedDestination
            });
            
            // Calculate route
            calculateRoute();
        }

        function calculateRoute() {
            if (!selectedOrigin || !selectedDestination) {
                return;
            }
            
            console.log('[SimpleMap] Calculating route...');
            
            const request = {
                origin: new google.maps.LatLng(selectedOrigin.lat, selectedOrigin.lng),
                destination: new google.maps.LatLng(selectedDestination.lat, selectedDestination.lng),
                travelMode: google.maps.TravelMode.DRIVING
            };
            
            directionsService.route(request, function(result, status) {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);
                    
                    const route = result.routes[0];
                    const leg = route.legs[0];
                    
                    const routeData = {
                        distance: leg.distance.value / 1000, // km
                        duration: leg.duration.value / 60, // minutes
                        overview_path: route.overview_path,
                        encoded_polyline: route.overview_polyline
                    };
                    
                    updateStatus('Route: ' + routeData.distance.toFixed(1) + 'km, ' + Math.round(routeData.duration) + 'min');
                    
                    sendMessage({
                        type: 'route_selected',
                        data: routeData
                    });
                    
                } else {
                    console.error('[SimpleMap] Route calculation failed:', status);
                    updateStatus('Failed to calculate route');
                }
            });
        }

        // Load Google Maps API
        function loadGoogleMaps() {
            console.log('[SimpleMap] Loading Google Maps API...');
            
            if (!'${googleMapsApiKey}') {
                console.error('[SimpleMap] No API key provided');
                updateStatus('Error: No API key provided');
                sendMessage({ 
                    type: 'error', 
                    data: { message: 'No Google Maps API key provided' } 
                });
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initMap';
            script.async = true;
            script.defer = true;
            
            script.onerror = function(error) {
                console.error('[SimpleMap] Failed to load Google Maps script:', error);
                updateStatus('Error: Failed to load Google Maps');
                sendMessage({ 
                    type: 'error', 
                    data: { message: 'Failed to load Google Maps API script' } 
                });
            };
            
            document.head.appendChild(script);
            console.log('[SimpleMap] Google Maps script added');
        }

        // Global error handlers
        window.gm_authFailure = function() {
            console.error('[SimpleMap] Google Maps API authentication failed');
            updateStatus('Error: API authentication failed');
            sendMessage({ 
                type: 'error', 
                data: { message: 'Google Maps API authentication failed' } 
            });
        };

        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('[SimpleMap] Global error:', msg);
            updateStatus('Error: ' + msg);
            sendMessage({ 
                type: 'error', 
                data: { message: 'JavaScript error: ' + msg } 
            });
        };

        // Start loading when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[SimpleMap] DOM ready, loading Google Maps...');
            updateStatus('Loading Google Maps...');
            loadGoogleMaps();
        });
    </script>
</body>
</html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('SimpleMapLocationSelector received message:', message);
      
      switch (message.type) {
        case 'map_ready':
          console.log('Simple map is ready');
          break;
          
        case 'origin_selected':
          console.log('Origin selected:', message.data);
          if (onOriginSelected) {
            onOriginSelected(message.data);
          }
          break;
          
        case 'destination_selected':
          console.log('Destination selected:', message.data);
          if (onDestinationSelected) {
            onDestinationSelected(message.data);
          }
          break;
          
        case 'route_selected':
          console.log('Route selected:', message.data);
          if (onRouteSelected) {
            onRouteSelected(message.data);
          }
          break;
          
        case 'error':
          console.error('Simple map error:', message.data.message);
          if (onError) {
            onError(message.data.message);
          }
          break;
          
        default:
          console.log('Unhandled simple map message:', message);
      }
    } catch (error) {
      console.error('Error parsing simple map message:', error);
      if (onError) {
        onError('Error parsing map message');
      }
    }
  };

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
          console.error('Simple WebView error: ', nativeEvent);
          if (onError) {
            onError(`WebView error: ${nativeEvent.description || 'Unknown error'}`);
          }
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('Simple WebView HTTP error: ', nativeEvent);
          if (onError) {
            onError(`HTTP error: ${nativeEvent.statusCode} - ${nativeEvent.description || 'Unknown HTTP error'}`);
          }
        }}
        onLoadStart={() => {
          console.log('Simple WebView started loading');
        }}
        onLoadEnd={() => {
          console.log('Simple WebView finished loading');
        }}
        onLoadProgress={({ nativeEvent }) => {
          console.log('Simple WebView load progress:', nativeEvent.progress);
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

export default SimpleMapLocationSelector;
