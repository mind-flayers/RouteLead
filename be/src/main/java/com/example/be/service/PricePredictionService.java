package com.example.be.service;

import com.example.be.dto.PricePredictionDto;
import com.example.be.model.PricePrediction;
import com.example.be.model.ReturnRoute;
import com.example.be.repository.PricePredictionRepository;
import com.example.be.repository.ReturnRouteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class PricePredictionService {
    private final PricePredictionRepository pricePredictionRepository;
    private final ReturnRouteRepository returnRouteRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Autowired
    public PricePredictionService(PricePredictionRepository pricePredictionRepository,
                                ReturnRouteRepository returnRouteRepository,
                                RestTemplate restTemplate,
                                ObjectMapper objectMapper) {
        this.pricePredictionRepository = pricePredictionRepository;
        this.returnRouteRepository = returnRouteRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public PricePredictionDto getLatestPriceSuggestion(UUID routeId) {
        PricePrediction prediction = pricePredictionRepository.findTopByRouteIdOrderByGeneratedAtDesc(routeId);
        if (prediction == null) {
            throw new RuntimeException("No price suggestion found for this route");
        }
        PricePredictionDto dto = new PricePredictionDto();
        dto.setId(prediction.getId());
        dto.setRouteId(prediction.getRoute() != null ? prediction.getRoute().getId() : null);
        dto.setMinPrice(prediction.getMinPrice());
        dto.setMaxPrice(prediction.getMaxPrice());
        dto.setModelVersion(prediction.getModelVersion());
        dto.setFeatures(prediction.getFeatures());
        dto.setGeneratedAt(prediction.getGeneratedAt());
        return dto;
    }

    /**
     * Generate price prediction for a route using ML service
     */
    @Transactional
    public PricePredictionDto generatePricePrediction(UUID routeId) {
        log.info("Generating price prediction for route: {}", routeId);
        
        // Get route details
        ReturnRoute route = returnRouteRepository.findById(routeId)
            .orElseThrow(() -> new RuntimeException("Route not found: " + routeId));
        
        try {
            // Extract features from route data
            Map<String, Object> features = extractFeaturesFromRoute(route);
            
            // Call ML service for prediction
            BigDecimal predictedPrice = callMLService(features);
            
            // Calculate price range (±20% of predicted price)
            BigDecimal minPrice = predictedPrice.multiply(new BigDecimal("0.8"))
                .setScale(2, RoundingMode.HALF_UP);
            BigDecimal maxPrice = predictedPrice.multiply(new BigDecimal("1.2"))
                .setScale(2, RoundingMode.HALF_UP);
            
            // Save prediction to database
            PricePrediction prediction = new PricePrediction();
            prediction.setRoute(route);
            prediction.setMinPrice(minPrice);
            prediction.setMaxPrice(maxPrice);
            prediction.setModelVersion("1.0");
            prediction.setFeatures(features);
            
            prediction = pricePredictionRepository.save(prediction);
            
            // Convert to DTO
            PricePredictionDto dto = new PricePredictionDto();
            dto.setId(prediction.getId());
            dto.setRouteId(routeId);
            dto.setMinPrice(minPrice);
            dto.setMaxPrice(maxPrice);
            dto.setModelVersion("1.0");
            dto.setFeatures(features);
            dto.setGeneratedAt(prediction.getGeneratedAt());
            
            log.info("Generated price prediction for route {}: {} - {}", routeId, minPrice, maxPrice);
            return dto;
            
        } catch (Exception e) {
            log.error("Failed to generate price prediction for route {}: {}", routeId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate price prediction: " + e.getMessage());
        }
    }
    
    /**
     * Extract features needed for ML prediction from route data
     */
    private Map<String, Object> extractFeaturesFromRoute(ReturnRoute route) {
        Map<String, Object> features = new HashMap<>();
        
        // Distance in km
        BigDecimal distance = route.getTotalDistanceKm();
        if (distance == null || distance.compareTo(BigDecimal.ZERO) <= 0) {
            // Fallback: calculate approximate distance from coordinates
            distance = calculateDistanceFromCoordinates(
                route.getOriginLat(), route.getOriginLng(),
                route.getDestinationLat(), route.getDestinationLng()
            );
        }
        features.put("distance", distance.doubleValue());
        
        // Default weight and volume (can be enhanced later with user input)
        // Using average values from training data as defaults
        features.put("weight", 500.0); // Average weight from training data
        features.put("volume", 5.0);   // Average volume from training data
        
        log.info("Extracted features for route {}: {}", route.getId(), features);
        return features;
    }
    
    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private BigDecimal calculateDistanceFromCoordinates(BigDecimal lat1, BigDecimal lon1, 
                                                       BigDecimal lat2, BigDecimal lon2) {
        final double R = 6371; // Earth's radius in km
        
        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lon1Rad = Math.toRadians(lon1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());
        double lon2Rad = Math.toRadians(lon2.doubleValue());
        
        double dLat = lat2Rad - lat1Rad;
        double dLon = lon2Rad - lon1Rad;
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;
        
        return new BigDecimal(distance).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Call ML service for price prediction
     */
    private BigDecimal callMLService(Map<String, Object> features) {
        try {
            String url = mlServiceUrl + "/predict";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("distance", features.get("distance"));
            requestBody.put("weight", features.get("weight"));
            requestBody.put("volume", features.get("volume"));
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            log.info("Calling ML service at {} with features: {}", url, requestBody);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                double rawPrediction = jsonResponse.get("price").asDouble();
                
                // Apply scaling factor to make prices more reasonable for Sri Lankan market
                // The training data appears to have inflated prices, so we scale down by 70%
                double scalingFactor = 0.1;
                double predictedPrice = rawPrediction * scalingFactor;
                
                log.info("ML service returned raw prediction: {}, scaled prediction: {}", rawPrediction, predictedPrice);
                return new BigDecimal(predictedPrice).setScale(2, RoundingMode.HALF_UP);
            } else {
                throw new RuntimeException("ML service returned error: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Error calling ML service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call ML service: " + e.getMessage());
        }
    }
    
    /**
     * Public method to call ML service with standalone features
     * This can be used by controllers that need direct ML predictions
     */
    public BigDecimal callMLServiceStandalone(Map<String, Object> features) {
        return callMLService(features);
    }
}
