import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface RouteOption {
  id: number;
  distance: number;
  duration: number;
  description: string;
  polyline: string;
  overview_path: any[];
  segments: RouteSegment[];
}

interface RouteSegment {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  distance_km: number;
  location_name: string;
  segment_index: number;
}

interface RouteSelectionMapProps {
  origin: LocationData;
  destination: LocationData;
  onRouteSelected?: (route: RouteOption) => void;
  onError?: (error: string) => void;
  googleMapsApiKey: string;
}

const RouteSelectionMap: React.FC<RouteSelectionMapProps> = ({
  origin,
  destination,
  onRouteSelected,
  onError,
  googleMapsApiKey
}) => {
  const webViewRef = useRef<WebView>(null);

  console.log('RouteSelectionMap - API Key received:', googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'EMPTY');

  const getHtmlContent = () => {
    console.log('RouteSelectionMap - Generating HTML content...');
    
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
            height: 100%;
            width: 100%;
        }
        .route-options {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            max-height: 40%;
            overflow-y: auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            display: none;
        }
        .route-option {
            padding: 12px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
        }
        .route-option:last-child {
            border-bottom: none;
        }
        .route-option:hover {
            background-color: #f0f7ff;
            border-left: 4px solid #90CAF9;
            transform: translateX(2px);
        }
        .route-option.selected {
            background-color: #e3f2fd;
            border-left: 4px solid #2196F3;
            box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
        }
        .route-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
        }
        .route-details {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
        .route-distance {
            color: #2196F3;
            font-weight: 600;
        }
        .route-time {
            color: #4CAF50;
            font-weight: 600;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 2000;
            text-align: center;
        }
        .error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #e57373;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <div class="route-options" id="routeOptions">
        <!-- Route options will be populated here -->
    </div>
    
    <div class="loading" id="loading">
        Calculating route options...
    </div>

    <script>
        console.log('[RouteMap] Script starting...');
        
        let map;
        let directionsService;
        let directionsRenderers = [];
        let routeOptions = [];
        let selectedRouteIndex = -1;
        let currentInfoWindow = null;
        
        const origin = { lat: ${origin.lat}, lng: ${origin.lng} };
        const destination = { lat: ${destination.lat}, lng: ${destination.lng} };

        function sendMessage(message) {
            console.log('[RouteMap] Sending message:', message);
            try {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(message));
                } else {
                    console.log('[RouteMap] ReactNativeWebView not available');
                }
            } catch (error) {
                console.error('[RouteMap] Error sending message:', error);
            }
        }

        function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }

        function showError(message) {
            console.error('[RouteMap] Error:', message);
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = message;
                loading.className = 'loading error';
            }
            sendMessage({ type: 'error', data: { message } });
        }

        function updateLoadingMessage(message) {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = message;
                loading.className = 'loading';
            }
        }

        function initMap() {
            console.log('[RouteMap] initMap called!');
            
            try {
                if (typeof google === 'undefined') {
                    throw new Error('Google Maps API not loaded');
                }

                // Create map centered between origin and destination
                const center = {
                    lat: (origin.lat + destination.lat) / 2,
                    lng: (origin.lng + destination.lng) / 2
                };
                
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 10,
                    center: center,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: false
                });

                console.log('[RouteMap] Map created successfully!');
                
                // Add origin and destination markers with address names only
                new google.maps.Marker({
                    position: origin,
                    map: map,
                    title: 'Origin: ${origin.address}',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#4CAF50',
                        fillOpacity: 1,
                        strokeColor: '#2E7D32',
                        strokeWeight: 2
                    }
                });

                new google.maps.Marker({
                    position: destination,
                    map: map,
                    title: 'Destination: ${destination.address}',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#F44336',
                        fillOpacity: 1,
                        strokeColor: '#C62828',
                        strokeWeight: 2
                    }
                });

                // Set up directions service
                directionsService = new google.maps.DirectionsService();

                console.log('[RouteMap] Map setup complete!');
                sendMessage({ type: 'map_ready' });
                
                // Calculate multiple route options
                calculateRouteOptions();
                
            } catch (error) {
                console.error('[RouteMap] Error initializing map:', error);
                showError('Failed to initialize map: ' + error.message);
            }
        }

        function calculateRouteOptions() {
            console.log('[RouteMap] Calculating route options...');
            updateLoadingMessage('Calculating route options...');
            
            const request = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
                avoidHighways: false,
                avoidTolls: false
            };
            
            directionsService.route(request, function(result, status) {
                console.log('[RouteMap] DirectionsService response:', status);
                if (status === 'OK') {
                    console.log('[RouteMap] Routes calculated:', result.routes.length);
                    updateLoadingMessage('Processing route segments...');
                    processRouteOptions(result.routes, result);
                } else {
                    console.error('[RouteMap] Route calculation failed:', status);
                    let errorMessage = 'Failed to calculate route options';
                    switch(status) {
                        case 'ZERO_RESULTS':
                            errorMessage = 'No routes found between these locations';
                            break;
                        case 'OVER_QUERY_LIMIT':
                            errorMessage = 'Google Maps quota exceeded';
                            break;
                        case 'REQUEST_DENIED':
                            errorMessage = 'Google Maps access denied - check API key';
                            break;
                        case 'INVALID_REQUEST':
                            errorMessage = 'Invalid route request';
                            break;
                        case 'UNKNOWN_ERROR':
                            errorMessage = 'Unknown error occurred';
                            break;
                    }
                    showError(errorMessage + ' (' + status + ')');
                }
            });
        }

        async function processRouteOptions(routes, directionsResult) {
            routeOptions = [];
            
            for (let i = 0; i < routes.length; i++) {
                const route = routes[i];
                const leg = route.legs[0];
                
                updateLoadingMessage(\`Processing route \${i + 1} of \${routes.length}...\`);
                
                // Create segments for this route
                const segments = await createRouteSegments(route);
                
                const routeOption = {
                    id: i,
                    distance: leg.distance.value / 1000, // km
                    duration: leg.duration.value / 60, // minutes
                    description: getRouteDescription(route, i),
                    polyline: route.overview_polyline,
                    overview_path: route.overview_path,
                    segments: segments
                };
                
                routeOptions.push(routeOption);
                
                // Create direction renderer for this route - all routes equal visibility
                const renderer = new google.maps.DirectionsRenderer({
                    routeIndex: i,
                    polylineOptions: {
                        strokeColor: getRouteColor(i),
                        strokeOpacity: 0.7, // Equal opacity for all routes
                        strokeWeight: 5 // Equal weight for all routes
                    },
                    markerOptions: { visible: false }, // Hide default markers
                    infoWindow: null,
                    preserveViewport: i > 0
                });
                
                renderer.setDirections(directionsResult);
                renderer.setMap(map);
                directionsRenderers.push(renderer);
            }
            
            displayRouteOptions();
            
            // Don't auto-select any route - let user choose
            hideLoading();
        }

        async function createRouteSegments(route) {
            const segments = [];
            const routePath = route.overview_path;
            
            if (!routePath || routePath.length === 0) {
                return segments;
            }
            
            const SEGMENT_DISTANCE_KM = 10; // 10km per segment
            let accumulatedDistance = 0;
            let segmentIndex = 0;
            let segmentStartPoint = routePath[0];
            
            for (let i = 1; i < routePath.length; i++) {
                const prevPoint = routePath[i - 1];
                const currentPoint = routePath[i];
                
                // Calculate distance between consecutive points
                const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(prevPoint.lat(), prevPoint.lng()),
                    new google.maps.LatLng(currentPoint.lat(), currentPoint.lng())
                ) / 1000; // Convert to km
                
                accumulatedDistance += segmentDistance;
                
                // Create a segment when we reach 10km or at the end of the route
                if (accumulatedDistance >= SEGMENT_DISTANCE_KM || i === routePath.length - 1) {
                    const segmentEndPoint = currentPoint;
                    
                    // Get location name for the middle point of this segment
                    const midLat = (segmentStartPoint.lat() + segmentEndPoint.lat()) / 2;
                    const midLng = (segmentStartPoint.lng() + segmentEndPoint.lng()) / 2;
                    const locationName = await getLocationName(midLat, midLng);
                    
                    segments.push({
                        start_lat: segmentStartPoint.lat(),
                        start_lng: segmentStartPoint.lng(),
                        end_lat: segmentEndPoint.lat(),
                        end_lng: segmentEndPoint.lng(),
                        distance_km: Math.round(accumulatedDistance * 100) / 100, // Round to 2 decimal places
                        location_name: locationName,
                        segment_index: segmentIndex
                    });
                    
                    // Reset for next segment
                    segmentStartPoint = segmentEndPoint;
                    accumulatedDistance = 0;
                    segmentIndex++;
                }
            }
            
            return segments;
        }

        async function getLocationName(lat, lng) {
            try {
                const geocoder = new google.maps.Geocoder();
                
                return new Promise((resolve, reject) => {
                    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            // Extract specific location name from address components
                            // Priority: sublocality > locality > administrative_area_level_3 > administrative_area_level_2
                            const addressComponents = results[0].address_components;
                            
                            // Look for sublocality (neighborhood/area within city)
                            for (let component of addressComponents) {
                                if (component.types.includes('sublocality') || 
                                    component.types.includes('sublocality_level_1')) {
                                    resolve(component.long_name);
                                    return;
                                }
                            }
                            
                            // Look for locality (city/town)
                            for (let component of addressComponents) {
                                if (component.types.includes('locality')) {
                                    resolve(component.long_name);
                                    return;
                                }
                            }
                            
                            // Look for administrative areas (smaller areas before districts)
                            for (let component of addressComponents) {
                                if (component.types.includes('administrative_area_level_3') ||
                                    component.types.includes('administrative_area_level_4')) {
                                    resolve(component.long_name);
                                    return;
                                }
                            }
                            
                            // Fallback to level 2 (district) if nothing else found
                            for (let component of addressComponents) {
                                if (component.types.includes('administrative_area_level_2')) {
                                    resolve(component.long_name);
                                    return;
                                }
                            }
                            
                            // Final fallback to first available name
                            resolve(addressComponents[0]?.long_name || 'Unknown Location');
                        } else {
                            console.warn('[RouteMap] Geocoding failed for coordinates:', lat, lng, 'Status:', status);
                            resolve('Location ' + Math.round(lat * 1000) / 1000); // Fallback with rounded coordinates
                        }
                    });
                });
            } catch (error) {
                console.error('[RouteMap] Error getting location name:', error);
                return 'Unknown Location';
            }
        }

        function getRouteDescription(route, index) {
            const leg = route.legs[0];
            const summary = route.summary || '';
            
            if (summary) {
                return \`Route \${index + 1}: via \${summary}\`;
            } else {
                return \`Route \${index + 1}\`;
            }
        }

        function getRouteColor(index) {
            const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'];
            return colors[index % colors.length];
        }

        function displayRouteOptions() {
            const container = document.getElementById('routeOptions');
            if (!container) return;
            
            container.innerHTML = '';
            
            // Add header instruction
            const header = document.createElement('div');
            header.style.padding = '12px';
            header.style.backgroundColor = '#f5f5f5';
            header.style.borderBottom = '1px solid #ddd';
            header.style.fontWeight = 'bold';
            header.style.fontSize = '14px';
            header.style.color = '#333';
            header.innerHTML = '📍 Choose your preferred route (' + routeOptions.length + ' options available):';
            container.appendChild(header);
            
            routeOptions.forEach((route, index) => {
                const div = document.createElement('div');
                div.className = 'route-option';
                div.onclick = () => selectRoute(index);
                
                div.innerHTML = \`
                    <div class="route-title">\${route.description}</div>
                    <div class="route-details">
                        <span class="route-distance">\${route.distance.toFixed(1)} km</span> • 
                        <span class="route-time">\${Math.round(route.duration)} min</span>
                        <br>
                        <small>Segments (\${route.segments.length}): \${route.segments.slice(0, 3).map(s => s.location_name + ' (~' + s.distance_km + 'km)').join(', ')}\${route.segments.length > 3 ? '...' : ''}</small>
                    </div>
                \`;
                
                container.appendChild(div);
            });
            
            container.style.display = 'block';
        }

        function selectRoute(index) {
            if (index < 0 || index >= routeOptions.length) return;
            
            // Update visual selection
            const options = document.querySelectorAll('.route-option');
            options.forEach((option, i) => {
                if (i === index) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
            
            // Update route rendering
            directionsRenderers.forEach((renderer, i) => {
                const isSelected = i === index;
                renderer.setOptions({
                    polylineOptions: {
                        strokeColor: getRouteColor(i),
                        strokeOpacity: isSelected ? 0.8 : 0.3,
                        strokeWeight: isSelected ? 6 : 3
                    }
                });
            });
            
            selectedRouteIndex = index;
            
            // Send selection to React Native
            const selectedRoute = routeOptions[index];
            console.log('[RouteMap] Route selected:', selectedRoute);
            
            sendMessage({
                type: 'route_selected',
                data: selectedRoute
            });
        }

        // Load Google Maps API
        function loadGoogleMaps() {
            console.log('[RouteMap] Loading Google Maps API...');
            
            if (!'${googleMapsApiKey}') {
                showError('No Google Maps API key provided');
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry&callback=initMap';
            script.async = true;
            script.defer = true;
            
            // Add timeout handling
            let timeoutId = setTimeout(() => {
                showError('Google Maps API loading timeout - please check your internet connection');
            }, 15000); // 15 second timeout
            
            script.onload = () => {
                clearTimeout(timeoutId);
                console.log('[RouteMap] Google Maps API loaded successfully');
            };
            
            script.onerror = function(error) {
                clearTimeout(timeoutId);
                console.error('[RouteMap] Failed to load Google Maps script:', error);
                showError('Failed to load Google Maps API script');
            };
            
            document.head.appendChild(script);
        }

        // Global error handlers
        window.gm_authFailure = function() {
            showError('Google Maps API authentication failed');
        };

        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('[RouteMap] Global error:', msg);
            showError('JavaScript error: ' + msg);
        };

        // Start loading when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[RouteMap] DOM ready, loading Google Maps...');
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
      console.log('RouteSelectionMap received message:', message);
      
      switch (message.type) {
        case 'map_ready':
          console.log('Route selection map is ready');
          break;
          
        case 'route_selected':
          console.log('Route selected:', message.data);
          if (onRouteSelected) {
            onRouteSelected(message.data);
          }
          break;
          
        case 'error':
          console.error('Route selection map error:', message.data.message);
          if (onError) {
            onError(message.data.message);
          }
          break;
          
        default:
          console.log('Unhandled route selection map message:', message);
      }
    } catch (error) {
      console.error('Error parsing route selection map message:', error);
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
          console.error('Route Selection WebView error: ', nativeEvent);
          if (onError) {
            onError(`WebView error: ${nativeEvent.description || 'Unknown error'}`);
          }
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('Route Selection WebView HTTP error: ', nativeEvent);
          if (onError) {
            onError(`HTTP error: ${nativeEvent.statusCode} - ${nativeEvent.description || 'Unknown HTTP error'}`);
          }
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

export default RouteSelectionMap;
