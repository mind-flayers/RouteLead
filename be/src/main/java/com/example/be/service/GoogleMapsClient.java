package com.example.be.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.DirectionsApi;
import com.google.maps.model.*;
import com.example.be.util.LatLng;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class GoogleMapsClient {
    private final GeoApiContext context;

    public GoogleMapsClient(@Value("${google.maps.api-key}") String apiKey) {
        this.context = new GeoApiContext.Builder()
            .apiKey(apiKey)
            .build();
    }

    public DirectionsResult getDirections(LatLng origin, LatLng dest) throws Exception {
        log.info("Getting directions from ({}, {}) to ({}, {})", origin.getLat(), origin.getLng(), dest.getLat(), dest.getLng());
        
        return DirectionsApi.newRequest(context)
            .mode(TravelMode.DRIVING)
            .origin(new com.google.maps.model.LatLng(origin.getLat(), origin.getLng()))
            .destination(new com.google.maps.model.LatLng(dest.getLat(), dest.getLng()))
            .alternatives(true)
            .await();
    }

    public GeocodingResult[] reverseGeocode(com.google.maps.model.LatLng point) throws Exception {
        log.info("Reverse geocoding point ({}, {})", point.lat, point.lng);
        
        return GeocodingApi.newRequest(context)
            .latlng(point)
            .resultType(AddressType.LOCALITY)
            .await();
    }
} 