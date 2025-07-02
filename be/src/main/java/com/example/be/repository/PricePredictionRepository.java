package com.example.be.repository;

import com.example.be.model.PricePrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PricePredictionRepository extends JpaRepository<PricePrediction, UUID> {
    PricePrediction findTopByRouteIdOrderByGeneratedAtDesc(UUID routeId);
}
