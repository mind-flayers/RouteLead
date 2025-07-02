package com.example.be.service;

import com.example.be.dto.CreateRouteDto;
import com.example.be.dto.RouteSegmentDto;
import com.example.be.model.ReturnRoute;
import com.example.be.model.RouteSegment;
import com.example.be.repository.ReturnRouteRepository;
import com.example.be.repository.RouteSegmentRepository;
import com.example.be.util.LatLng;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    @Mock
    private ReturnRouteRepository routeRepo;

    @Mock
    private RouteSegmentRepository segRepo;

    @Mock
    private GoogleMapsClient maps;

    @Mock
    private PolylineService polyService;

    @InjectMocks
    private RouteService routeService;

    @Test
    void testGetSegments() {
        // Given
        UUID routeId = UUID.randomUUID();
        RouteSegment segment1 = new RouteSegment();
        segment1.setId(UUID.randomUUID());
        segment1.setRouteId(routeId);
        segment1.setSegmentIndex(0);
        segment1.setTownName("Colombo");
        segment1.setStartLat(BigDecimal.valueOf(6.9271));
        segment1.setStartLng(BigDecimal.valueOf(79.8612));
        segment1.setEndLat(BigDecimal.valueOf(6.9271));
        segment1.setEndLng(BigDecimal.valueOf(79.8612));
        segment1.setDistanceKm(BigDecimal.ZERO);
        segment1.setCreatedAt(ZonedDateTime.now());

        RouteSegment segment2 = new RouteSegment();
        segment2.setId(UUID.randomUUID());
        segment2.setRouteId(routeId);
        segment2.setSegmentIndex(1);
        segment2.setTownName("Kandy");
        segment2.setStartLat(BigDecimal.valueOf(7.2906));
        segment2.setStartLng(BigDecimal.valueOf(80.6337));
        segment2.setEndLat(BigDecimal.valueOf(7.2906));
        segment2.setEndLng(BigDecimal.valueOf(80.6337));
        segment2.setDistanceKm(BigDecimal.ZERO);
        segment2.setCreatedAt(ZonedDateTime.now());

        List<RouteSegment> segments = Arrays.asList(segment1, segment2);

        when(segRepo.findByRouteIdOrderBySegmentIndex(routeId)).thenReturn(segments);

        // When
        List<RouteSegmentDto> result = routeService.getSegments(routeId);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Colombo", result.get(0).getTownName());
        assertEquals("Kandy", result.get(1).getTownName());
        assertEquals(0, result.get(0).getSegmentIndex());
        assertEquals(1, result.get(1).getSegmentIndex());

        verify(segRepo).findByRouteIdOrderBySegmentIndex(routeId);
    }

    @Test
    void testCreateRoute() throws Exception {
        // Given
        CreateRouteDto dto = new CreateRouteDto();
        dto.setDriverId(UUID.randomUUID());
        dto.setOriginLat(BigDecimal.valueOf(6.9271));
        dto.setOriginLng(BigDecimal.valueOf(79.8612));
        dto.setDestinationLat(BigDecimal.valueOf(7.2906));
        dto.setDestinationLng(BigDecimal.valueOf(80.6337));
        dto.setDepartureTime(ZonedDateTime.now());
        dto.setDetourToleranceKm(BigDecimal.valueOf(5.0));
        dto.setSuggestedPriceMin(BigDecimal.valueOf(100.0));
        dto.setSuggestedPriceMax(BigDecimal.valueOf(200.0));

        ReturnRoute savedRoute = new ReturnRoute();
        savedRoute.setId(UUID.randomUUID());
        savedRoute.setDriverId(dto.getDriverId());

        when(routeRepo.save(any(ReturnRoute.class))).thenReturn(savedRoute);

        // Mock DirectionsResult and its nested fields
        com.google.maps.model.DirectionsResult mockDirectionsResult = new com.google.maps.model.DirectionsResult();
        com.google.maps.model.DirectionsRoute mockRoute = new com.google.maps.model.DirectionsRoute();
        com.google.maps.model.EncodedPolyline mockPolyline = new com.google.maps.model.EncodedPolyline("_p~iF~ps|U_ulLnnqC");
        mockRoute.overviewPolyline = mockPolyline;
        mockDirectionsResult.routes = new com.google.maps.model.DirectionsRoute[]{mockRoute};
        when(maps.getDirections(any(LatLng.class), any(LatLng.class))).thenReturn(mockDirectionsResult);

        when(polyService.sampleByDistance(anyString(), anyDouble()))
                .thenReturn(Arrays.asList(
                        new LatLng(6.9271, 79.8612),
                        new LatLng(7.2906, 80.6337)
                ));

        // Mock the geocoding results - simplified approach
        when(maps.reverseGeocode(any(com.google.maps.model.LatLng.class)))
                .thenReturn(new com.google.maps.model.GeocodingResult[0]);

        // When
        routeService.createRoute(dto);

        // Then
        verify(routeRepo).save(any(ReturnRoute.class));
        verify(maps).getDirections(any(LatLng.class), any(LatLng.class));
        verify(polyService).sampleByDistance(anyString(), eq(10.0));
        verify(maps, atLeastOnce()).reverseGeocode(any(com.google.maps.model.LatLng.class));
        verify(segRepo, atLeastOnce()).save(any(RouteSegment.class));
    }
} 