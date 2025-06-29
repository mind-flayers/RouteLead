package com.example.routelead.service;

import com.example.routelead.dto.VehicleDto;
import com.example.routelead.dto.VehicleRequestDto;
import com.example.routelead.dto.VehicleUpdateRequestDto;
import com.example.routelead.exception.ResourceNotFoundException;
import com.example.routelead.exception.ValidationException;
import com.example.routelead.model.Vehicle;
import com.example.routelead.repository.VehicleRepository;
import com.example.routelead.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for Vehicle operations.
 * Handles business logic for vehicle management.
 */
@Slf4j
@Service("routeleadVehicleService")
@RequiredArgsConstructor
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    /**
     * Get all vehicles
     */
    public List<VehicleDto> getAllVehicles() {
        log.info("Fetching all vehicles");
        return vehicleRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get vehicles by driver ID
     */
    public List<VehicleDto> getVehiclesByDriverId(UUID driverId) {
        ValidationUtils.validateUuidNotNull(driverId, "driverId");
        log.info("Fetching vehicles for driver: {}", driverId);
        
        return vehicleRepository.findByDriverId(driverId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get vehicle by ID
     */
    public VehicleDto getVehicleById(Long id) {
        ValidationUtils.validateNotNull(id, "id");
        log.info("Fetching vehicle with ID: {}", id);
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id.toString()));
        
        return convertToDto(vehicle);
    }

    /**
     * Get vehicle by plate number
     */
    public VehicleDto getVehicleByPlateNumber(String plateNumber) {
        ValidationUtils.validateNotNullOrEmpty(plateNumber, "plateNumber");
        log.info("Fetching vehicle with plate number: {}", plateNumber);
        
        Vehicle vehicle = vehicleRepository.findByPlateNumber(plateNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", plateNumber));
        
        return convertToDto(vehicle);
    }

    /**
     * Create a new vehicle
     */
    public VehicleDto createVehicle(VehicleRequestDto requestDto) {
        validateVehicleRequest(requestDto);
        log.info("Creating vehicle for driver: {}", requestDto.getDriverId());
        
        if (vehicleRepository.existsByPlateNumber(requestDto.getPlateNumber())) {
            throw new ValidationException("plateNumber", "already exists");
        }
        
        Vehicle vehicle = convertToEntity(requestDto);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        
        log.info("Vehicle created with ID: {}", savedVehicle.getId());
        return convertToDto(savedVehicle);
    }

    /**
     * Update an existing vehicle
     */
    public VehicleDto updateVehicle(Long id, VehicleUpdateRequestDto requestDto) {
        ValidationUtils.validateNotNull(id, "id");
        validateVehicleUpdateRequest(requestDto);
        log.info("Updating vehicle with ID: {}", id);
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id.toString()));
        
        if (requestDto.getPlateNumber() != null && 
            !requestDto.getPlateNumber().equals(vehicle.getPlateNumber()) &&
            vehicleRepository.existsByPlateNumber(requestDto.getPlateNumber())) {
            throw new ValidationException("plateNumber", "already exists");
        }
        
        updateVehicleFields(vehicle, requestDto);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        
        log.info("Vehicle updated with ID: {}", updatedVehicle.getId());
        return convertToDto(updatedVehicle);
    }

    /**
     * Delete a vehicle
     */
    public void deleteVehicle(Long id) {
        ValidationUtils.validateNotNull(id, "id");
        log.info("Deleting vehicle with ID: {}", id);
        
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle", id.toString());
        }
        
        vehicleRepository.deleteById(id);
        log.info("Vehicle deleted with ID: {}", id);
    }

    /**
     * Find vehicles by make and model
     */
    public List<VehicleDto> findVehiclesByMakeAndModel(String make, String model) {
        ValidationUtils.validateNotNullOrEmpty(make, "make");
        ValidationUtils.validateNotNullOrEmpty(model, "model");
        log.info("Finding vehicles by make: {} and model: {}", make, model);
        
        return vehicleRepository.findByMakeAndModel(make, model)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Find vehicles with minimum weight capacity
     */
    public List<VehicleDto> findVehiclesWithMinWeight(java.math.BigDecimal minWeight) {
        ValidationUtils.validatePositive(minWeight, "minWeight");
        log.info("Finding vehicles with minimum weight capacity: {}", minWeight);
        
        return vehicleRepository.findVehiclesWithMinWeight(minWeight)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Find vehicles with minimum volume capacity
     */
    public List<VehicleDto> findVehiclesWithMinVolume(java.math.BigDecimal minVolume) {
        ValidationUtils.validatePositive(minVolume, "minVolume");
        log.info("Finding vehicles with minimum volume capacity: {}", minVolume);
        
        return vehicleRepository.findVehiclesWithMinVolume(minVolume)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Validate vehicle creation request
     */
    private void validateVehicleRequest(VehicleRequestDto requestDto) {
        ValidationUtils.validateNotNull(requestDto, "requestDto");
        ValidationUtils.validateUuidNotNull(requestDto.getDriverId(), "driverId");
        ValidationUtils.validateNotNullOrEmpty(requestDto.getMake(), "make");
        ValidationUtils.validateNotNullOrEmpty(requestDto.getModel(), "model");
        ValidationUtils.validateNotNullOrEmpty(requestDto.getPlateNumber(), "plateNumber");
        
        if (requestDto.getMaxWeightKg() != null) {
            ValidationUtils.validatePositive(requestDto.getMaxWeightKg(), "maxWeightKg");
        }
        if (requestDto.getMaxVolumeM3() != null) {
            ValidationUtils.validatePositive(requestDto.getMaxVolumeM3(), "maxVolumeM3");
        }
    }

    /**
     * Validate vehicle update request
     */
    private void validateVehicleUpdateRequest(VehicleUpdateRequestDto requestDto) {
        ValidationUtils.validateNotNull(requestDto, "requestDto");
        
        if (requestDto.getMake() != null) {
            ValidationUtils.validateNotNullOrEmpty(requestDto.getMake(), "make");
        }
        if (requestDto.getModel() != null) {
            ValidationUtils.validateNotNullOrEmpty(requestDto.getModel(), "model");
        }
        if (requestDto.getPlateNumber() != null) {
            ValidationUtils.validateNotNullOrEmpty(requestDto.getPlateNumber(), "plateNumber");
        }
        if (requestDto.getMaxWeightKg() != null) {
            ValidationUtils.validatePositive(requestDto.getMaxWeightKg(), "maxWeightKg");
        }
        if (requestDto.getMaxVolumeM3() != null) {
            ValidationUtils.validatePositive(requestDto.getMaxVolumeM3(), "maxVolumeM3");
        }
    }

    /**
     * Update vehicle fields from request DTO
     */
    private void updateVehicleFields(Vehicle vehicle, VehicleUpdateRequestDto requestDto) {
        if (requestDto.getColor() != null) {
            vehicle.setColor(requestDto.getColor());
        }
        if (requestDto.getMake() != null) {
            vehicle.setMake(requestDto.getMake());
        }
        if (requestDto.getModel() != null) {
            vehicle.setModel(requestDto.getModel());
        }
        if (requestDto.getYearOfManufacture() != null) {
            vehicle.setYearOfManufacture(requestDto.getYearOfManufacture());
        }
        if (requestDto.getPlateNumber() != null) {
            vehicle.setPlateNumber(requestDto.getPlateNumber());
        }
        if (requestDto.getMaxWeightKg() != null) {
            vehicle.setMaxWeightKg(requestDto.getMaxWeightKg());
        }
        if (requestDto.getMaxVolumeM3() != null) {
            vehicle.setMaxVolumeM3(requestDto.getMaxVolumeM3());
        }
        if (requestDto.getVehiclePhotos() != null) {
            vehicle.setVehiclePhotos(requestDto.getVehiclePhotos());
        }
    }

    /**
     * Convert entity to DTO
     */
    private VehicleDto convertToDto(Vehicle vehicle) {
        return VehicleDto.builder()
                .id(vehicle.getId())
                .driverId(vehicle.getDriverId())
                .color(vehicle.getColor())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .yearOfManufacture(vehicle.getYearOfManufacture())
                .plateNumber(vehicle.getPlateNumber())
                .maxWeightKg(vehicle.getMaxWeightKg())
                .maxVolumeM3(vehicle.getMaxVolumeM3())
                .vehiclePhotos(vehicle.getVehiclePhotos())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }

    /**
     * Convert request DTO to entity
     */
    private Vehicle convertToEntity(VehicleRequestDto requestDto) {
        return Vehicle.builder()
                .driverId(requestDto.getDriverId())
                .color(requestDto.getColor())
                .make(requestDto.getMake())
                .model(requestDto.getModel())
                .yearOfManufacture(requestDto.getYearOfManufacture())
                .plateNumber(requestDto.getPlateNumber())
                .maxWeightKg(requestDto.getMaxWeightKg() != null ? requestDto.getMaxWeightKg() : java.math.BigDecimal.ZERO)
                .maxVolumeM3(requestDto.getMaxVolumeM3() != null ? requestDto.getMaxVolumeM3() : java.math.BigDecimal.ZERO)
                .vehiclePhotos(requestDto.getVehiclePhotos() != null ? requestDto.getVehiclePhotos() : "[]")
                .build();
    }
} 