package com.example.be.repository;

import com.example.be.model.PricePrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PricePredictionRepository extends JpaRepository<PricePrediction, UUID> {
    @Query("SELECT p FROM PricePrediction p WHERE p.route.id = :routeId ORDER BY p.generatedAt DESC")
    PricePrediction findTopByRouteIdOrderByGeneratedAtDesc(@Param("routeId") UUID routeId);
}
