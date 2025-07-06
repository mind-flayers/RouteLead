package com.example.be.service;

import com.example.be.dto.RouteSegmentDto;
import com.example.be.model.RouteSegment;
import com.example.be.repository.RouteSegmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RouteSegmentService {
    private final RouteSegmentRepository routeSegmentRepository;

    @Autowired
    public RouteSegmentService(RouteSegmentRepository routeSegmentRepository) {
        this.routeSegmentRepository = routeSegmentRepository;
    }

    @Transactional(readOnly = true)
    public List<RouteSegmentDto> getAllRouteSegments() {
        return routeSegmentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private RouteSegmentDto toDto(RouteSegment segment) {
        RouteSegmentDto dto = new RouteSegmentDto();
        dto.setId(segment.getId());
        dto.setRouteId(segment.getRoute() != null ? segment.getRoute().getId() : null);
        dto.setSegmentIndex(segment.getSegmentIndex());
        dto.setStartLat(segment.getStartLat());
        dto.setStartLng(segment.getStartLng());
        dto.setEndLat(segment.getEndLat());
        dto.setEndLng(segment.getEndLng());
        dto.setDistanceKm(segment.getDistanceKm());
        dto.setCreatedAt(segment.getCreatedAt());
        return dto;
    }
}
