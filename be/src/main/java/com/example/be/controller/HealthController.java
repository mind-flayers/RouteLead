package com.example.be.controller;

import com.example.be.repository.BidRepository;
import com.example.be.model.Bid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @Autowired
    private BidRepository bidRepository;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "RouteLead Backend API");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend API is working!");
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/debug/bids")
    public ResponseEntity<Map<String, Object>> getAvailableBids() {
        try {
            List<Bid> allBids = bidRepository.findAll();
            List<UUID> bidIds = allBids.stream()
                .map(Bid::getId)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("total_bids", allBids.size());
            response.put("bid_ids", bidIds);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Failed to fetch bids: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(500).body(response);
        }
    }
}
