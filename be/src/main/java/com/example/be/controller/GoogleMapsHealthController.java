package com.example.be.controller;

import com.example.be.service.GoogleMapsClient;
import com.example.be.util.LatLng;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.GeocodingResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/health/maps")
@RequiredArgsConstructor
public class GoogleMapsHealthController {
    
    private final GoogleMapsClient googleMapsClient;
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkMapsApiStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test 1: Basic API connectivity with a simple geocoding request
            log.info("Testing Google Maps API connectivity...");
            
            // Test coordinates (New York City)
            com.google.maps.model.LatLng testPoint = new com.google.maps.model.LatLng(40.7128, -74.0060);
            
            // Test reverse geocoding
            GeocodingResult[] geocodingResults = googleMapsClient.reverseGeocode(testPoint);
            
            if (geocodingResults != null && geocodingResults.length > 0) {
                response.put("status", "SUCCESS");
                response.put("message", "Google Maps API is working correctly");
                response.put("testLocation", "New York City");
                response.put("geocodingResult", geocodingResults[0].formattedAddress);
                response.put("timestamp", System.currentTimeMillis());
                
                log.info("Google Maps API health check passed");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "WARNING");
                response.put("message", "Google Maps API responded but no geocoding results");
                response.put("timestamp", System.currentTimeMillis());
                
                log.warn("Google Maps API health check: No geocoding results");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("Google Maps API health check failed", e);
            
            response.put("status", "ERROR");
            response.put("message", "Google Maps API is not working: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/test-directions")
    public ResponseEntity<Map<String, Object>> testDirections(
            @RequestParam(defaultValue = "40.7128") double originLat,
            @RequestParam(defaultValue = "-74.0060") double originLng,
            @RequestParam(defaultValue = "34.0522") double destLat,
            @RequestParam(defaultValue = "-118.2437") double destLng) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Testing directions from ({}, {}) to ({}, {})", originLat, originLng, destLat, destLng);
            
            LatLng origin = new LatLng(originLat, originLng);
            LatLng destination = new LatLng(destLat, destLng);
            
            DirectionsResult directionsResult = googleMapsClient.getDirections(origin, destination);
            
            if (directionsResult != null && directionsResult.routes != null && directionsResult.routes.length > 0) {
                response.put("status", "SUCCESS");
                response.put("message", "Directions API is working correctly");
                response.put("origin", String.format("%.4f, %.4f", originLat, originLng));
                response.put("destination", String.format("%.4f, %.4f", destLat, destLng));
                response.put("routesCount", directionsResult.routes.length);
                response.put("totalDistance", directionsResult.routes[0].legs[0].distance.humanReadable);
                response.put("totalDuration", directionsResult.routes[0].legs[0].duration.humanReadable);
                response.put("timestamp", System.currentTimeMillis());
                
                log.info("Directions API test passed");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "WARNING");
                response.put("message", "Directions API responded but no routes found");
                response.put("timestamp", System.currentTimeMillis());
                
                log.warn("Directions API test: No routes found");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("Directions API test failed", e);
            
            response.put("status", "ERROR");
            response.put("message", "Directions API is not working: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/test-geocoding")
    public ResponseEntity<Map<String, Object>> testGeocoding(
            @RequestParam(defaultValue = "New York City") String address) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Testing geocoding for address: {}", address);
            
            // Note: You might need to add a geocoding method to GoogleMapsClient
            // For now, we'll test with reverse geocoding using a known coordinate
            
            com.google.maps.model.LatLng testPoint = new com.google.maps.model.LatLng(40.7128, -74.0060);
            GeocodingResult[] geocodingResults = googleMapsClient.reverseGeocode(testPoint);
            
            if (geocodingResults != null && geocodingResults.length > 0) {
                response.put("status", "SUCCESS");
                response.put("message", "Geocoding API is working correctly");
                response.put("testAddress", address);
                response.put("reverseGeocodingResult", geocodingResults[0].formattedAddress);
                response.put("timestamp", System.currentTimeMillis());
                
                log.info("Geocoding API test passed");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "WARNING");
                response.put("message", "Geocoding API responded but no results");
                response.put("timestamp", System.currentTimeMillis());
                
                log.warn("Geocoding API test: No results");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("Geocoding API test failed", e);
            
            response.put("status", "ERROR");
            response.put("message", "Geocoding API is not working: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }
} 