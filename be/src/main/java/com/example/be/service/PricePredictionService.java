package com.example.be.service;

import com.example.be.dto.PricePredictionDto;
import com.example.be.model.PricePrediction;
import com.example.be.repository.PricePredictionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PricePredictionService {
    private final PricePredictionRepository pricePredictionRepository;

    @Autowired
    public PricePredictionService(PricePredictionRepository pricePredictionRepository) {
        this.pricePredictionRepository = pricePredictionRepository;
    }

    @Transactional(readOnly = true)
    public PricePredictionDto getLatestPriceSuggestion(UUID routeId) {
        PricePrediction prediction = pricePredictionRepository.findTopByRouteIdOrderByGeneratedAtDesc(routeId);
        if (prediction == null) {
            throw new RuntimeException("No price suggestion found for this route");
        }
        PricePredictionDto dto = new PricePredictionDto();
        dto.setId(prediction.getId());
        dto.setRouteId(prediction.getRouteId());
        dto.setMinPrice(prediction.getMinPrice());
        dto.setMaxPrice(prediction.getMaxPrice());
        dto.setModelVersion(prediction.getModelVersion());
        dto.setFeatures(prediction.getFeatures());
        dto.setGeneratedAt(prediction.getGeneratedAt());
        return dto;
    }
}
