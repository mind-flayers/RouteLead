package com.example.be.repository;

import com.example.be.model.RouteSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RouteSegmentRepository extends JpaRepository<RouteSegment, UUID> {
    List<RouteSegment> findAllByRouteId(UUID routeId);
}
