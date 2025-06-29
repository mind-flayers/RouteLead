package com.example.routelead.repository;

import com.example.routelead.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Vehicle entity.
 * Provides data access methods for vehicle operations.
 */
@Repository("routeleadVehicleRepository")
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    /**
     * Find all vehicles by driver ID
     */
    List<Vehicle> findByDriverId(UUID driverId);
    
    /**
     * Find vehicle by plate number
     */
    Optional<Vehicle> findByPlateNumber(String plateNumber);
    
    /**
     * Check if vehicle exists by plate number
     */
    boolean existsByPlateNumber(String plateNumber);
    
    /**
     * Find vehicles by make and model
     */
    List<Vehicle> findByMakeAndModel(String make, String model);
    
    /**
     * Find vehicles by make
     */
    List<Vehicle> findByMake(String make);
    
    /**
     * Find vehicles with capacity greater than specified weight
     */
    @Query("SELECT v FROM Vehicle v WHERE v.maxWeightKg >= :minWeight")
    List<Vehicle> findVehiclesWithMinWeight(@Param("minWeight") java.math.BigDecimal minWeight);
    
    /**
     * Find vehicles with capacity greater than specified volume
     */
    @Query("SELECT v FROM Vehicle v WHERE v.maxVolumeM3 >= :minVolume")
    List<Vehicle> findVehiclesWithMinVolume(@Param("minVolume") java.math.BigDecimal minVolume);
    
    /**
     * Find vehicles by driver ID and make
     */
    List<Vehicle> findByDriverIdAndMake(UUID driverId, String make);
} 