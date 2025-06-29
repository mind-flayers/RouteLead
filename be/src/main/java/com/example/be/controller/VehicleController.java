package com.example.be.controller;

import com.example.be.dto.VehicleRequestDto;
import com.example.be.model.Vehicle;
import com.example.be.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/vehicles", "/api/v1/vehicles"})
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    @Autowired
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        try {
            System.out.println("Getting all vehicles...");
            List<Vehicle> vehicles = vehicleService.getAllVehicles();
            System.out.println("Found " + vehicles.size() + " vehicles");
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.err.println("Error getting vehicles: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByDriverId(@PathVariable UUID driverId) {
        List<Vehicle> vehicles = vehicleService.getVehiclesByDriverId(driverId);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/plate/{plateNumber}")
    public ResponseEntity<Vehicle> getVehicleByPlateNumber(@PathVariable String plateNumber) {
        return vehicleService.getVehicleByPlateNumber(plateNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody VehicleRequestDto vehicleRequest) {
        try {
            System.out.println("Creating vehicle with request: " + vehicleRequest);
            
            // Basic validation
            if (vehicleRequest.getDriverId() == null) {
                System.err.println("Driver ID is null");
                return ResponseEntity.badRequest().build();
            }
            if (vehicleRequest.getMake() == null || vehicleRequest.getMake().trim().isEmpty()) {
                System.err.println("Make is null or empty");
                return ResponseEntity.badRequest().build();
            }
            if (vehicleRequest.getModel() == null || vehicleRequest.getModel().trim().isEmpty()) {
                System.err.println("Model is null or empty");
                return ResponseEntity.badRequest().build();
            }
            if (vehicleRequest.getPlateNumber() == null || vehicleRequest.getPlateNumber().trim().isEmpty()) {
                System.err.println("Plate number is null or empty");
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Validation passed, creating vehicle...");
            Vehicle createdVehicle = vehicleService.createVehicleFromRequest(vehicleRequest);
            System.out.println("Vehicle created successfully with ID: " + createdVehicle.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (Exception e) {
            System.err.println("Error creating vehicle: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicleDetails) {
        try {
            Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicleDetails);
            return ResponseEntity.ok(updatedVehicle);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 