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

@Slf4j
@RestController
@RequestMapping("/bids")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BidController {

    private final BidService bidService;

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
    public ResponseEntity<BidDto> createBid(@RequestBody BidCreateDto bidCreateDto) {
        log.info("POST /bids - Creating new bid");
        BidDto createdBid = bidService.createBid(bidCreateDto);
        return ResponseEntity.ok(createdBid);
    }
}
