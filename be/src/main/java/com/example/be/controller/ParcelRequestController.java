package com.example.be.controller;

import com.example.be.model.ParcelRequest;
import com.example.be.service.ParcelRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/parcel-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ParcelRequestController {
    private final ParcelRequestService service;

    @GetMapping
    public List<ParcelRequest> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        ParcelRequest pr = service.getById(id);
        return pr != null ? ResponseEntity.ok(pr) : ResponseEntity.notFound().build();
    }

    @GetMapping("/by-customer")
    public List<ParcelRequest> getByCustomerId(@RequestParam UUID customerId) {
        return service.getByCustomerId(customerId);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ParcelRequest pr) {
        try {
            service.createNative(pr);
            return ResponseEntity.status(201).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
