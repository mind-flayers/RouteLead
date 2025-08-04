package com.example.be.config;

import com.example.be.types.RouteStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class RouteStatusConverter implements AttributeConverter<RouteStatus, String> {

    @Override
    public String convertToDatabaseColumn(RouteStatus status) {
        if (status == null) {
            return null;
        }
        return status.name();
    }

    @Override
    public RouteStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return RouteStatus.valueOf(dbData);
    }
} 