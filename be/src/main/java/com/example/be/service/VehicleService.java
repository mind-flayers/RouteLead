package com.example.be.service;

import com.example.be.dto.VehicleRequestDto;
import com.example.be.model.Vehicle;
import com.example.be.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getVehiclesByDriverId(UUID driverId) {
        return vehicleRepository.findByDriverId(driverId);
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Optional<Vehicle> getVehicleByPlateNumber(String plateNumber) {
        return vehicleRepository.findByPlateNumber(plateNumber);
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle createVehicleFromRequest(VehicleRequestDto requestDto) {
        try {
            System.out.println("Service: Creating vehicle from request DTO");
            Vehicle vehicle = new Vehicle();
            System.out.println("Service: Setting driver ID: " + requestDto.getDriverId());
            vehicle.setDriverId(requestDto.getDriverId());
            System.out.println("Service: Setting color: " + requestDto.getColor());
            vehicle.setColor(requestDto.getColor());
            System.out.println("Service: Setting make: " + requestDto.getMake());
            vehicle.setMake(requestDto.getMake());
            System.out.println("Service: Setting model: " + requestDto.getModel());
            vehicle.setModel(requestDto.getModel());
            System.out.println("Service: Setting year: " + requestDto.getYearOfManufacture());
            vehicle.setYearOfManufacture(requestDto.getYearOfManufacture());
            System.out.println("Service: Setting plate number: " + requestDto.getPlateNumber());
            vehicle.setPlateNumber(requestDto.getPlateNumber());
            System.out.println("Service: Setting max weight: " + requestDto.getMaxWeightKg());
            vehicle.setMaxWeightKg(requestDto.getMaxWeightKg());
            System.out.println("Service: Setting max volume: " + requestDto.getMaxVolumeM3());
            vehicle.setMaxVolumeM3(requestDto.getMaxVolumeM3());
            System.out.println("Service: Setting vehicle photos: " + requestDto.getVehiclePhotos());
            vehicle.setVehiclePhotos(requestDto.getVehiclePhotos());
            
            System.out.println("Service: Saving vehicle to repository...");
            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            System.out.println("Service: Vehicle saved successfully with ID: " + savedVehicle.getId());
            return savedVehicle;
        } catch (Exception e) {
            System.err.println("Service: Error creating vehicle: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));

        if (vehicleDetails.getMake() != null) {
        vehicle.setMake(vehicleDetails.getMake());
        }
        if (vehicleDetails.getModel() != null) {
        vehicle.setModel(vehicleDetails.getModel());
        }
        if (vehicleDetails.getYearOfManufacture() != null) {
        vehicle.setYearOfManufacture(vehicleDetails.getYearOfManufacture());
        }
        if (vehicleDetails.getColor() != null) {
            vehicle.setColor(vehicleDetails.getColor());
        }
        if (vehicleDetails.getPlateNumber() != null) {
            vehicle.setPlateNumber(vehicleDetails.getPlateNumber());
        }
        if (vehicleDetails.getMaxWeightKg() != null) {
            vehicle.setMaxWeightKg(vehicleDetails.getMaxWeightKg());
        }
        if (vehicleDetails.getMaxVolumeM3() != null) {
            vehicle.setMaxVolumeM3(vehicleDetails.getMaxVolumeM3());
        }
        if (vehicleDetails.getVehiclePhotos() != null) {
            vehicle.setVehiclePhotos(vehicleDetails.getVehiclePhotos());
        }

        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        vehicleRepository.delete(vehicle);
    }
} 