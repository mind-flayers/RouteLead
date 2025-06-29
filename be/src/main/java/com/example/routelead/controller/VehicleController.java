package com.example.routelead.controller;

import com.example.routelead.dto.VehicleDto;
import com.example.routelead.dto.VehicleRequestDto;
import com.example.routelead.dto.VehicleUpdateRequestDto;
import com.example.routelead.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Vehicle operations.
 * Provides endpoints for vehicle management.
 */
@Slf4j
@RestController("routeleadVehicleController")
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * Get all vehicles
     * 
     * @return List of all vehicles
     */
    @GetMapping
    public ResponseEntity<List<VehicleDto>> getAllVehicles() {
        log.info("GET /api/v1/vehicles - Fetching all vehicles");
        List<VehicleDto> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(vehicles);
    }

    /**
     * Get vehicles by driver ID
     * 
     * @param driverId The driver's UUID
     * @return List of vehicles for the driver
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<VehicleDto>> getVehiclesByDriverId(@PathVariable UUID driverId) {
        log.info("GET /api/v1/vehicles/driver/{} - Fetching vehicles for driver", driverId);
        List<VehicleDto> vehicles = vehicleService.getVehiclesByDriverId(driverId);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * Get vehicle by ID
     * 
     * @param id The vehicle ID
     * @return Vehicle details
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable Long id) {
        log.info("GET /api/v1/vehicles/{} - Fetching vehicle by ID", id);
        VehicleDto vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    /**
     * Get vehicle by plate number
     * 
     * @param plateNumber The vehicle plate number
     * @return Vehicle details
     */
    @GetMapping("/plate/{plateNumber}")
    public ResponseEntity<VehicleDto> getVehicleByPlateNumber(@PathVariable String plateNumber) {
        log.info("GET /api/v1/vehicles/plate/{} - Fetching vehicle by plate number", plateNumber);
        VehicleDto vehicle = vehicleService.getVehicleByPlateNumber(plateNumber);
        return ResponseEntity.ok(vehicle);
    }

    /**
     * Create a new vehicle
     * 
     * @param requestDto Vehicle creation request
     * @return Created vehicle details
     */
    @PostMapping
    public ResponseEntity<VehicleDto> createVehicle(@Valid @RequestBody VehicleRequestDto requestDto) {
        log.info("POST /api/v1/vehicles - Creating new vehicle for driver: {}", requestDto.getDriverId());
        VehicleDto createdVehicle = vehicleService.createVehicle(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
    }

    /**
     * Update an existing vehicle
     * 
     * @param id The vehicle ID
     * @param requestDto Vehicle update request
     * @return Updated vehicle details
     */
    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(
            @PathVariable Long id, 
            @Valid @RequestBody VehicleUpdateRequestDto requestDto) {
        log.info("PUT /api/v1/vehicles/{} - Updating vehicle", id);
        VehicleDto updatedVehicle = vehicleService.updateVehicle(id, requestDto);
        return ResponseEntity.ok(updatedVehicle);
    }

    /**
     * Delete a vehicle
     * 
     * @param id The vehicle ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        log.info("DELETE /api/v1/vehicles/{} - Deleting vehicle", id);
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Find vehicles by make and model
     * 
     * @param make Vehicle make
     * @param model Vehicle model
     * @return List of matching vehicles
     */
    @GetMapping("/search")
    public ResponseEntity<List<VehicleDto>> findVehiclesByMakeAndModel(
            @RequestParam String make, 
            @RequestParam String model) {
        log.info("GET /api/v1/vehicles/search?make={}&model={} - Searching vehicles", make, model);
        List<VehicleDto> vehicles = vehicleService.findVehiclesByMakeAndModel(make, model);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * Find vehicles with minimum weight capacity
     * 
     * @param minWeight Minimum weight capacity in kg
     * @return List of vehicles with sufficient weight capacity
     */
    @GetMapping("/capacity/weight")
    public ResponseEntity<List<VehicleDto>> findVehiclesWithMinWeight(
            @RequestParam BigDecimal minWeight) {
        log.info("GET /api/v1/vehicles/capacity/weight?minWeight={} - Finding vehicles with min weight", minWeight);
        List<VehicleDto> vehicles = vehicleService.findVehiclesWithMinWeight(minWeight);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * Find vehicles with minimum volume capacity
     * 
     * @param minVolume Minimum volume capacity in m³
     * @return List of vehicles with sufficient volume capacity
     */
    @GetMapping("/capacity/volume")
    public ResponseEntity<List<VehicleDto>> findVehiclesWithMinVolume(
            @RequestParam BigDecimal minVolume) {
        log.info("GET /api/v1/vehicles/capacity/volume?minVolume={} - Finding vehicles with min volume", minVolume);
        List<VehicleDto> vehicles = vehicleService.findVehiclesWithMinVolume(minVolume);
        return ResponseEntity.ok(vehicles);
    }
} 