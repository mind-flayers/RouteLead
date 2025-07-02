package com.example.be.repository;

import com.example.be.model.RouteSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RouteSegmentRepository extends JpaRepository<RouteSegment, UUID> {
    
    /**
     * Find all segments by route ID, ordered by segment index
     */
    List<RouteSegment> findByRouteIdOrderBySegmentIndex(UUID routeId);
    
    /**
     * Find segments by town name
     */
    List<RouteSegment> findByTownName(String townName);
    
    /**
     * Find segments by route ID and town name
     */
    List<RouteSegment> findByRouteIdAndTownName(UUID routeId, String townName);
} 