package com.example.be.dto;

import com.example.be.types.RouteStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class RouteDetailsDto {
    // Basic route information
    private UUID id;
    private UUID driverId;
    private String driverName;
    private String driverEmail;
    private String driverPhone;
    private String driverProfilePhoto;
    
    // Location information
    private BigDecimal originLat;
    private BigDecimal originLng;
    private String originAddress;
    private BigDecimal destinationLat;
    private BigDecimal destinationLng;
    private String destinationAddress;
    
    // Route details
    private ZonedDateTime departureTime;
    private BigDecimal detourToleranceKm;
    private BigDecimal suggestedPriceMin;
    private BigDecimal suggestedPriceMax;
    private RouteStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    // Bid information
    private Integer totalBids;
    private BigDecimal highestBid;
    private BigDecimal averageBid;
    private List<BidSummaryDto> recentBids;
    
    // Driver information
    private String vehicleMake;
    private String vehicleModel;
    private String vehiclePlateNumber;
    private BigDecimal vehicleMaxWeight;
    private BigDecimal vehicleMaxVolume;
    private Double driverRating;
    private Integer driverReviewCount;
    
    // Route segments
    private List<RouteSegmentDto> segments;
    private BigDecimal totalDistance;
    private String estimatedDuration;
    
    // Price prediction
    private PricePredictionDto pricePrediction;
    
    // Additional metadata
    private String routeImage;
    private List<String> routeTags;
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getDriverId() { return driverId; }
    public void setDriverId(UUID driverId) { this.driverId = driverId; }
    
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    
    public String getDriverEmail() { return driverEmail; }
    public void setDriverEmail(String driverEmail) { this.driverEmail = driverEmail; }
    
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    
    public String getDriverProfilePhoto() { return driverProfilePhoto; }
    public void setDriverProfilePhoto(String driverProfilePhoto) { this.driverProfilePhoto = driverProfilePhoto; }
    
    public BigDecimal getOriginLat() { return originLat; }
    public void setOriginLat(BigDecimal originLat) { this.originLat = originLat; }
    
    public BigDecimal getOriginLng() { return originLng; }
    public void setOriginLng(BigDecimal originLng) { this.originLng = originLng; }
    
    public String getOriginAddress() { return originAddress; }
    public void setOriginAddress(String originAddress) { this.originAddress = originAddress; }
    
    public BigDecimal getDestinationLat() { return destinationLat; }
    public void setDestinationLat(BigDecimal destinationLat) { this.destinationLat = destinationLat; }
    
    public BigDecimal getDestinationLng() { return destinationLng; }
    public void setDestinationLng(BigDecimal destinationLng) { this.destinationLng = destinationLng; }
    
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
    
    public ZonedDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(ZonedDateTime departureTime) { this.departureTime = departureTime; }
    
    public BigDecimal getDetourToleranceKm() { return detourToleranceKm; }
    public void setDetourToleranceKm(BigDecimal detourToleranceKm) { this.detourToleranceKm = detourToleranceKm; }
    
    public BigDecimal getSuggestedPriceMin() { return suggestedPriceMin; }
    public void setSuggestedPriceMin(BigDecimal suggestedPriceMin) { this.suggestedPriceMin = suggestedPriceMin; }
    
    public BigDecimal getSuggestedPriceMax() { return suggestedPriceMax; }
    public void setSuggestedPriceMax(BigDecimal suggestedPriceMax) { this.suggestedPriceMax = suggestedPriceMax; }
    
    public RouteStatus getStatus() { return status; }
    public void setStatus(RouteStatus status) { this.status = status; }
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getTotalBids() { return totalBids; }
    public void setTotalBids(Integer totalBids) { this.totalBids = totalBids; }
    
    public BigDecimal getHighestBid() { return highestBid; }
    public void setHighestBid(BigDecimal highestBid) { this.highestBid = highestBid; }
    
    public BigDecimal getAverageBid() { return averageBid; }
    public void setAverageBid(BigDecimal averageBid) { this.averageBid = averageBid; }
    
    public List<BidSummaryDto> getRecentBids() { return recentBids; }
    public void setRecentBids(List<BidSummaryDto> recentBids) { this.recentBids = recentBids; }
    
    public String getVehicleMake() { return vehicleMake; }
    public void setVehicleMake(String vehicleMake) { this.vehicleMake = vehicleMake; }
    
    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
    
    public String getVehiclePlateNumber() { return vehiclePlateNumber; }
    public void setVehiclePlateNumber(String vehiclePlateNumber) { this.vehiclePlateNumber = vehiclePlateNumber; }
    
    public BigDecimal getVehicleMaxWeight() { return vehicleMaxWeight; }
    public void setVehicleMaxWeight(BigDecimal vehicleMaxWeight) { this.vehicleMaxWeight = vehicleMaxWeight; }
    
    public BigDecimal getVehicleMaxVolume() { return vehicleMaxVolume; }
    public void setVehicleMaxVolume(BigDecimal vehicleMaxVolume) { this.vehicleMaxVolume = vehicleMaxVolume; }
    
    public Double getDriverRating() { return driverRating; }
    public void setDriverRating(Double driverRating) { this.driverRating = driverRating; }
    
    public Integer getDriverReviewCount() { return driverReviewCount; }
    public void setDriverReviewCount(Integer driverReviewCount) { this.driverReviewCount = driverReviewCount; }
    
    public List<RouteSegmentDto> getSegments() { return segments; }
    public void setSegments(List<RouteSegmentDto> segments) { this.segments = segments; }
    
    public BigDecimal getTotalDistance() { return totalDistance; }
    public void setTotalDistance(BigDecimal totalDistance) { this.totalDistance = totalDistance; }
    
    public String getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(String estimatedDuration) { this.estimatedDuration = estimatedDuration; }
    
    public PricePredictionDto getPricePrediction() { return pricePrediction; }
    public void setPricePrediction(PricePredictionDto pricePrediction) { this.pricePrediction = pricePrediction; }
    
    public String getRouteImage() { return routeImage; }
    public void setRouteImage(String routeImage) { this.routeImage = routeImage; }
    
    public List<String> getRouteTags() { return routeTags; }
    public void setRouteTags(List<String> routeTags) { this.routeTags = routeTags; }
} 