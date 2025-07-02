package com.example.be.service;

import com.example.be.util.LatLng;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class PolylineService {

    public List<LatLng> sampleByDistance(String encoded, double intervalKm) {
        log.info("Sampling polyline with interval: {} km", intervalKm);
        
        // Decode the polyline to get all points
        List<LatLng> allPoints = decodePolyline(encoded);
        List<LatLng> samples = new ArrayList<>();
        
        if (allPoints.isEmpty()) {
            return samples;
        }
        
        // Add the first point
        samples.add(allPoints.get(0));
        double accumulated = 0;
        LatLng prev = allPoints.get(0);

        // Sample points at the specified interval
        for (int i = 1; i < allPoints.size(); i++) {
            LatLng curr = allPoints.get(i);
            double dist = calculateDistance(prev, curr);
            accumulated += dist;
            
            if (accumulated >= intervalKm) {
                samples.add(curr);
                accumulated = 0;
            }
            prev = curr;
        }
        
        // Ensure we include the last point if it's not already included
        if (!samples.contains(allPoints.get(allPoints.size() - 1))) {
            samples.add(allPoints.get(allPoints.size() - 1));
        }
        
        log.info("Sampled {} points from polyline", samples.size());
        return samples;
    }
    
    private List<LatLng> decodePolyline(String encoded) {
        List<LatLng> poly = new ArrayList<>();
        int index = 0, len = encoded.length();
        int lat = 0, lng = 0;

        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            double latDouble = lat / 1E5;
            double lngDouble = lng / 1E5;
            poly.add(new LatLng(latDouble, lngDouble));
        }
        
        return poly;
    }
    
    private double calculateDistance(LatLng point1, LatLng point2) {
        // Haversine formula to calculate distance between two points
        double lat1 = Math.toRadians(point1.getLat());
        double lat2 = Math.toRadians(point2.getLat());
        double deltaLat = Math.toRadians(point2.getLat() - point1.getLat());
        double deltaLng = Math.toRadians(point2.getLng() - point1.getLng());

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Earth's radius in kilometers
        double earthRadius = 6371.0;
        return earthRadius * c;
    }
} 