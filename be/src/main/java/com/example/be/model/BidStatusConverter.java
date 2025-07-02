package com.example.be.model;

import com.example.be.types.BidStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BidStatusConverter implements AttributeConverter<BidStatus, String> {
    @Override
    public String convertToDatabaseColumn(BidStatus attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public BidStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : BidStatus.valueOf(dbData);
    }
}
