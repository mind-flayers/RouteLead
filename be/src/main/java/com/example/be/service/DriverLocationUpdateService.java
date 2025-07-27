package com.example.be.service;

import com.example.be.model.DriverLocationUpdate;
import com.example.be.repository.DriverLocationUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DriverLocationUpdateService {
    
    private final DriverLocationUpdateRepository driverLocationUpdateRepository;
    
    @Autowired
    public DriverLocationUpdateService(DriverLocationUpdateRepository driverLocationUpdateRepository) {
        this.driverLocationUpdateRepository = driverLocationUpdateRepository;
    }
    
    @Transactional
    public DriverLocationUpdate createLocationUpdate(UUID deliveryTrackingId, BigDecimal latitude, BigDecimal longitude) {
        DriverLocationUpdate locationUpdate = new DriverLocationUpdate();
        locationUpdate.setDeliveryTracking(new com.example.be.model.DeliveryTracking());
        locationUpdate.getDeliveryTracking().setId(deliveryTrackingId);
        locationUpdate.setLatitude(latitude);
        locationUpdate.setLongitude(longitude);
        locationUpdate.setRecordedAt(ZonedDateTime.now());
        
        return driverLocationUpdateRepository.save(locationUpdate);
    }
    
    @Transactional(readOnly = true)
    public List<DriverLocationUpdate> getLocationUpdatesByDeliveryTracking(UUID deliveryTrackingId) {
        return driverLocationUpdateRepository.findByDeliveryTrackingIdOrderByRecordedAtDesc(deliveryTrackingId);
    }
    
    @Transactional(readOnly = true)
    public List<DriverLocationUpdate> getLocationUpdatesByDeliveryTrackingAndTimeRange(
            UUID deliveryTrackingId, ZonedDateTime startTime, ZonedDateTime endTime) {
        return driverLocationUpdateRepository.findByDeliveryTrackingIdAndTimeRange(deliveryTrackingId, startTime, endTime);
    }
    
    @Transactional(readOnly = true)
    public Optional<DriverLocationUpdate> getLatestLocationUpdate(UUID deliveryTrackingId) {
        return driverLocationUpdateRepository.findLatestByDeliveryTrackingId(deliveryTrackingId);
    }
    
    @Transactional(readOnly = true)
    public List<DriverLocationUpdate> getLocationUpdatesAfterTime(ZonedDateTime afterTime) {
        return driverLocationUpdateRepository.findByRecordedAtAfterOrderByRecordedAtDesc(afterTime);
    }
    
    @Transactional(readOnly = true)
    public DriverLocationUpdate getLocationUpdateById(UUID id) {
        return driverLocationUpdateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location update not found with id: " + id));
    }
} 