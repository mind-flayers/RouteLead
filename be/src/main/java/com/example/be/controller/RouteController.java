package com.example.be.controller;

import com.example.be.dto.PricePredictionDto;
import com.example.be.service.PricePredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RouteController {

    private final PricePredictionService pricePredictionService;

    @GetMapping("/price-suggestion")
    public ResponseEntity<PricePredictionDto> getPriceSuggestion(@RequestParam("routeId") UUID routeId) {
        log.info("GET /routes/price-suggestion - Fetching price suggestion for route {}", routeId);
        PricePredictionDto suggestion = pricePredictionService.getLatestPriceSuggestion(routeId);
        return ResponseEntity.ok(suggestion);
    }
}
