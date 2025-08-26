package com.example.be.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeocodingService {
    
    @Value("${google.maps.api.key:AIzaSyDj2o9cWpgCtIM2hUP938Ppo31-gvap1ig}")
    private String googleMapsApiKey;
    
    private final RestTemplate restTemplate;
    
    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Convert latitude and longitude coordinates to a human-readable address
     * @param latitude The latitude coordinate
     * @param longitude The longitude coordinate
     * @return Formatted address string or coordinates if geocoding fails
     */
    public String reverseGeocode(BigDecimal latitude, BigDecimal longitude) {
        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?latlng=%s,%s&key=%s",
                latitude.toString(), longitude.toString(), googleMapsApiKey
            );
            
            log.debug("Making geocoding request to: {}", url.replaceAll("key=[^&]*", "key=***"));
            
            // Make API call and parse response
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && "OK".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
                if (results != null && !results.isEmpty()) {
                    String formattedAddress = (String) results.get(0).get("formatted_address");
                    log.debug("Geocoded {}, {} to: {}", latitude, longitude, formattedAddress);
                    return formattedAddress;
                }
            } else {
                log.warn("Geocoding API returned status: {}", response != null ? response.get("status") : "null");
            }
            
            // Fallback to coordinates if geocoding fails
            return String.format("%.4f, %.4f", latitude.doubleValue(), longitude.doubleValue());
        } catch (Exception e) {
            log.error("Error in reverse geocoding for {}, {}: ", latitude, longitude, e);
            return String.format("%.4f, %.4f", latitude.doubleValue(), longitude.doubleValue());
        }
    }
    
    /**
     * Get a shorter, more readable location name (e.g., city and country)
     * @param latitude The latitude coordinate
     * @param longitude The longitude coordinate
     * @return Short location name or coordinates if geocoding fails
     */
    public String getLocationName(BigDecimal latitude, BigDecimal longitude) {
        try {
            String fullAddress = reverseGeocode(latitude, longitude);
            
            // If we got coordinates back, return as is
            if (fullAddress.matches("^-?\\d+\\.\\d+, -?\\d+\\.\\d+$")) {
                return fullAddress;
            }
            
            // Try to extract city and country from full address
            String[] parts = fullAddress.split(", ");
            if (parts.length >= 2) {
                // Return last two parts (usually city and country for Sri Lankan addresses)
                return parts[parts.length - 2] + ", " + parts[parts.length - 1];
            }
            
            return fullAddress;
        } catch (Exception e) {
            log.error("Error getting location name for {}, {}: ", latitude, longitude, e);
            return String.format("%.4f, %.4f", latitude.doubleValue(), longitude.doubleValue());
        }
    }
}
