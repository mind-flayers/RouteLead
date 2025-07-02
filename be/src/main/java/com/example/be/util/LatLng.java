package com.example.be.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LatLng {
    private double lat;
    private double lng;
    
    public LatLng(java.math.BigDecimal lat, java.math.BigDecimal lng) {
        this.lat = lat.doubleValue();
        this.lng = lng.doubleValue();
    }
} 