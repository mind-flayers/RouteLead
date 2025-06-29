package com.example.be;

import com.example.be.controller.VehicleController;
import com.example.be.dto.VehicleRequestDto;
import com.example.be.model.Vehicle;
import com.example.be.service.VehicleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(controllers = VehicleController.class, 
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = com.example.be.config.SecurityConfig.class),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = com.example.be.config.JwtAuthenticationFilter.class),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = com.example.be.config.JwtUtil.class),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = com.example.be.config.EnvConfig.class),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = com.example.be.config.SupabaseConfig.class)
    })
@AutoConfigureMockMvc(addFilters = false)
public class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VehicleService vehicleService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateVehicle() throws Exception {
        // Given
        VehicleRequestDto requestDto = new VehicleRequestDto();
        requestDto.setDriverId(UUID.randomUUID());
        requestDto.setMake("Toyota");
        requestDto.setModel("Camry");
        requestDto.setYearOfManufacture(2020);
        requestDto.setColor("White");
        requestDto.setPlateNumber("ABC123");
        requestDto.setMaxWeightKg(new BigDecimal("500.00"));
        requestDto.setMaxVolumeM3(new BigDecimal("2.5"));
        requestDto.setVehiclePhotos(Collections.emptyList());

        Vehicle createdVehicle = new Vehicle();
        createdVehicle.setId(1L);
        createdVehicle.setDriverId(requestDto.getDriverId());
        createdVehicle.setMake(requestDto.getMake());
        createdVehicle.setModel(requestDto.getModel());
        createdVehicle.setYearOfManufacture(requestDto.getYearOfManufacture());
        createdVehicle.setColor(requestDto.getColor());
        createdVehicle.setPlateNumber(requestDto.getPlateNumber());
        createdVehicle.setMaxWeightKg(requestDto.getMaxWeightKg());
        createdVehicle.setMaxVolumeM3(requestDto.getMaxVolumeM3());
        createdVehicle.setVehiclePhotos(requestDto.getVehiclePhotos());

        when(vehicleService.createVehicleFromRequest(any(VehicleRequestDto.class)))
                .thenReturn(createdVehicle);

        // When & Then
        mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.make").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Camry"))
                .andExpect(jsonPath("$.plateNumber").value("ABC123"));
    }

    @Test
    public void testCreateVehicleWithInvalidData() throws Exception {
        // Given - Missing required fields
        VehicleRequestDto requestDto = new VehicleRequestDto();
        requestDto.setDriverId(UUID.randomUUID());
        // Missing make, model, and plateNumber

        // When & Then
        mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest());
    }
} 