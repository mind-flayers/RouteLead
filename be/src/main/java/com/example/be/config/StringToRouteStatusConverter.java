package com.example.be.config;

import com.example.be.types.RouteStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToRouteStatusConverter implements Converter<String, RouteStatus> {
    
    @Override
    public RouteStatus convert(String source) {
        if (source == null || source.trim().isEmpty()) {
            return null;
        }
        
        try {
            return RouteStatus.valueOf(source.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid RouteStatus: " + source + 
                ". Valid values are: OPEN, BOOKED, COMPLETED, CANCELLED");
        }
    }
}
