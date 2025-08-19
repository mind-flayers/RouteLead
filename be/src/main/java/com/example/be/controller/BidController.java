package com.example.be.controller;

import com.example.be.dto.BidDto;
import com.example.be.dto.BidCreateDto;
import com.example.be.service.BidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BidController {

    private final BidService bidService;

    //test bid: 722d67db-97b3-4258-84b5-944b6a780125
    @GetMapping("/{bidId}")
    public ResponseEntity<BidDto> getBidById(@PathVariable("bidId") UUID bidId) {
        log.info("GET /bids/{} - Fetching bid by ID", bidId);
        BidDto bid = bidService.getBidById(bidId);
        return ResponseEntity.ok(bid);
    }

    @GetMapping(value = {"", "/"})
    public ResponseEntity<List<BidDto>> getAllBids() {
        log.info("GET /bids - Fetching all bids");
        List<BidDto> bids = bidService.getAllBids();
        return ResponseEntity.ok(bids);
    }
    @PostMapping
    public ResponseEntity<?> createBid(@RequestBody BidCreateDto bidCreateDto) {
        log.info("POST /bids - Creating new bid");
        try {
            BidDto createdBid = bidService.createBid(bidCreateDto);
            return ResponseEntity.ok(createdBid);
        } catch (Exception e) {
            log.error("Error creating bid: ", e);
            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("timestamp", java.time.ZonedDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/bids");
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @PatchMapping("/{bidId}/status")
    public ResponseEntity<?> updateBidStatus(@PathVariable("bidId") UUID bidId, @RequestBody com.example.be.dto.BidStatusUpdateDto statusUpdateDto) {
        log.info("PATCH /bids/{}/status - Updating bid status", bidId);
        try {
            BidDto updatedBid = bidService.updateBidStatus(bidId, statusUpdateDto.getStatus());
            return ResponseEntity.ok(updatedBid);
        } catch (Exception e) {
            log.error("Error updating bid status: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", java.time.LocalDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/bids/" + bidId + "/status");
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{bidId}")
    public ResponseEntity<?> deleteBid(@PathVariable("bidId") UUID bidId) {
        log.info("DELETE /bids/{} - Deleting bid", bidId);
        try {
            bidService.deleteBid(bidId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting bid: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", java.time.ZonedDateTime.now());
            errorResponse.put("status", 500);
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("details", e.getClass().getSimpleName());
            errorResponse.put("path", "/bids/" + bidId);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
