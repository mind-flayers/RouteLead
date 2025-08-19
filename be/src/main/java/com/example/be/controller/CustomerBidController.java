package com.example.be.controller;

import com.example.be.dto.BidDto;
import com.example.be.service.BidService;
import com.example.be.types.BidStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/customer/bids")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerBidController {
    private final BidService bidService;

    @GetMapping("")
    public ResponseEntity<List<BidDto>> getCustomerBids(
            @RequestParam(name = "parcel_requestid", required = false) UUID parcelRequestId,
            @RequestParam(name = "customerId", required = false) UUID customerId,
            @RequestParam(required = false) BidStatus status
    ) {
        if (parcelRequestId != null) {
            log.info("GET /customer/bids?parcel_requestid={}&status={} - Fetching bids by parcel_requestid", parcelRequestId, status);
            List<BidDto> bids = bidService.getBidsByParcelRequestIdAndStatus(parcelRequestId, status);
            return ResponseEntity.ok(bids);
        } else if (customerId != null) {
            log.info("GET /customer/bids?customerId={}&status={} - Fetching bids by customerId", customerId, status);
            List<BidDto> bids = bidService.getBidsByCustomerIdAndStatus(customerId, status);
            return ResponseEntity.ok(bids);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
